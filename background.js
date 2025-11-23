(()=>{function R(s,e){if(!s||s.length===0)throw new Error(`Missing required environment variable: ${e}`);return s}var L=R("https://api-prod-1ac9e2e428.calcheckr.com","SERVER_URL"),w={SERVER_URL:L,IS_PRODUCTION:!0};function _(){return{userAgent:navigator.userAgent,acceptLanguage:navigator.language||navigator.languages&&navigator.languages[0]||"en-US",timezoneOffset:new Date().getTimezoneOffset(),platform:navigator.platform}}function m(s){return{"X-Timezone-Offset":(s||_()).timezoneOffset.toString()}}var y=500,S=700,u="sessionProof",U="X-Session-Proof",E=".calcheckr.com",N="welcome-install.html",D="welcome-update.html",g="hasSeenOnboarding",b="lastOnboardingSeen";function H(s){return"htmlLink"in s}function h(){let s=chrome?.storage;if(s?.local)return s.local;throw new Error("chrome.storage.local is not available")}function x(s){let e=s?.origin;if(!e)return!1;try{let t=new URL(e);if(t.protocol!=="https:")return!1;let{hostname:r}=t;return r===E.slice(1)||r.endsWith(E)}catch(t){return console.warn("Failed to parse external message origin",t),!1}}var p=class{constructor(){this.serverUrl=w.SERVER_URL,this.authWindow=null,this.authCheckInterval=null,this.sessionProof=null,this.sessionProofLoadPromise=null}async initialize(){await this.ensureSessionProofLoadedFromStorage()}async ensureSessionProofLoadedFromStorage(){if(!this.sessionProof){if(this.sessionProofLoadPromise){await this.sessionProofLoadPromise;return}this.sessionProofLoadPromise=(async()=>{try{let r=(await h().get(u))?.[u];typeof r=="string"&&r.length>0&&(this.sessionProof=r,console.log("Session proof loaded from storage"))}catch(e){console.error("Failed to load session proof from storage:",e)}finally{this.sessionProofLoadPromise=null}})(),await this.sessionProofLoadPromise}}buildHeaders(e={}){let t={...e};this.sessionProof&&(t[U]=this.sessionProof);let r=m();return Object.assign(t,r),t}async setSessionProof(e){if(typeof e!="string"||e.length===0)return;this.sessionProof=e,await h().set({[u]:e}),console.log("Stored new session proof from backend")}async clearSessionProof(){this.sessionProof=null,await h().remove(u)}async clearExtensionStorage(){try{await this.clearSessionProof()}catch(e){console.warn("Failed to clear session proof from session storage",e)}try{await chrome.storage.local.clear()}catch(e){throw console.error("Failed to clear extension storage",e),e}this.sessionProof=null,console.log("Cleared all extension storage data")}async handleApiError(e){if(e.status===401)throw(await e.json().catch(()=>({}))).code==="SESSION_REVOKED_SECURITY"?(await this.clearExtensionStorage(),new Error("Session revoked due to security concerns. Please sign in again.")):(await chrome.storage.local.set({isAuthenticated:!1,lastChecked:Date.now()}),new Error("Authentication required"));return!1}async waitForSessionProof(e=5e3){if(this.sessionProof)return!0;let t=h(),r=Date.now()+e;for(;!this.sessionProof&&Date.now()<r;)if(await new Promise(o=>setTimeout(o,100)),!this.sessionProof){let a=(await t.get(u))?.[u];if(typeof a=="string"&&a.length>0){this.sessionProof=a;break}}return!!this.sessionProof}async throwForErrorResponse(e,t){let r=null;try{r=await e.json()}catch{r=null}let o=typeof r?.error=="string"&&r.error.length>0?r.error:t,a=new Error(o);a.status=e.status,r?.code&&typeof r.code=="string"&&(a.code=r.code),r?.details!==void 0&&(a.details=r.details);let i;if(typeof r?.retryAfterSeconds=="number"&&Number.isFinite(r.retryAfterSeconds))i=r.retryAfterSeconds;else{let c=e.headers.get("Retry-After");if(c){let l=Number.parseInt(c,10);if(Number.isFinite(l))i=l;else{let d=Date.parse(c);Number.isNaN(d)||(i=Math.max(0,Math.ceil((d-Date.now())/1e3)))}}}throw i!==void 0&&(a.retryAfterSeconds=i,a.retryAfterMs=i*1e3),a}computeCardlessTrialEligibility(e){return!(!e||e.hasActiveSubscription||e.cardlessTrialConsumed)}async checkAuthStatus(){try{await this.ensureSessionProofLoadedFromStorage();let e=await fetch(`${this.serverUrl}/auth/status`,{method:"GET",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})});if(!e.ok)throw new Error("Failed to check auth status");let r=!!(await e.json())?.authenticated;return await chrome.storage.local.set({isAuthenticated:r,lastChecked:Date.now()}),{authenticated:r}}catch(e){return console.error("Error checking auth status:",e),await chrome.storage.local.set({isAuthenticated:!1,lastChecked:Date.now()}),{authenticated:!1}}}async authenticate(){try{await this.clearSessionProof()}catch(e){console.warn("Failed to clear existing session proof before authentication:",e)}return new Promise((e,t)=>{this.authWindow&&(chrome.windows.remove(this.authWindow.id).catch(()=>{}),this.authWindow=null),chrome.windows.getCurrent(r=>{let o=Math.round(r.left+(r.width-y)/2),a=Math.round(r.top+(r.height-S)/2),i=new Date().getTimezoneOffset(),c=`${this.serverUrl}/auth/google?timezoneOffset=${i}`;chrome.windows.create({url:c,type:"popup",width:y,height:S,left:o,top:a},l=>{this.authWindow=l,this.monitorAuthWindow(l.id,e,t)})})})}monitorAuthWindow(e,t,r){this.authCheckInterval&&(clearInterval(this.authCheckInterval),this.authCheckInterval=null);let o=0,a=120;this.authCheckInterval=setInterval(async()=>{o++;try{let i=await chrome.windows.get(e);if(i.tabs&&i.tabs[0]){let c=i.tabs[0];c.url&&c.url.includes("/auth/callback")&&(clearInterval(this.authCheckInterval),this.authCheckInterval=null,setTimeout(async()=>{await this.waitForSessionProof();let l=await this.checkAuthStatus();chrome.windows.remove(e).catch(()=>{}),this.authWindow=null,l.authenticated?t({success:!0}):r(new Error("Authentication failed"))},1e3))}}catch{clearInterval(this.authCheckInterval),this.authCheckInterval=null,this.authWindow=null,await this.waitForSessionProof(),(await this.checkAuthStatus()).authenticated?t({success:!0}):r(new Error("Authentication window closed"))}o>=a&&(clearInterval(this.authCheckInterval),this.authCheckInterval=null,chrome.windows.remove(e).catch(()=>{}),this.authWindow=null,r(new Error("Authentication timeout")))},1e3)}async closeAuthWindow(){if(!(!this.authWindow||!this.authWindow.id)){try{await chrome.windows.remove(this.authWindow.id)}catch(e){console.warn("Failed to close auth window via extension message",e)}this.authWindow=null}}async signOut(){try{if(!(await fetch(`${this.serverUrl}/auth/logout`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})})).ok)throw new Error("Failed to sign out");try{await this.clearExtensionStorage()}catch(t){console.error("Partial sign-out: failed to clear local storage",t)}return{success:!0}}catch(e){throw console.error("Error signing out:",e),e}}async revokeAccess(){try{if(!(await fetch(`${this.serverUrl}/auth/revoke`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})})).ok)throw new Error("Failed to revoke access");try{await this.clearExtensionStorage()}catch(t){console.error("Partial revoke: failed to clear local storage",t)}return{success:!0}}catch(e){throw console.error("Error revoking access:",e),e}}async modifyEventInternal(e,t){try{let r=Intl.DateTimeFormat().resolvedOptions().timeZone,o=H(e)?{htmlLink:e.htmlLink,timeZone:r}:{eventId:e.eventId,calendarId:e.calendarId,timeZone:r},a=await fetch(`${this.serverUrl}/calendar/modify-event?source=${t}`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"}),body:JSON.stringify(o)});return await this.handleApiError(a)?this.modifyEventInternal(e,t):(a.ok||await this.throwForErrorResponse(a,"Failed to modify event"),await a.json())}catch(r){if(console.error("Error modifying event:",r),r?.message&&(r.message.includes("Premium subscription required")||r.message.includes("Authentication required")))return console.log("[DEV MODE] API error, returning fallback response"),{success:!0,needsManualUpdate:!0,action:"marked",summary:"",htmlLink:H(e)?e.htmlLink:""};throw r}}async modifyEventFromContent(e){return this.modifyEventInternal({htmlLink:e},"content")}async modifyEventFromPopup(e,t){return this.modifyEventInternal({eventId:e,calendarId:t},"popup")}async listEvents(e,t){try{let r=await fetch(`${this.serverUrl}/calendar/list-events`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"}),body:JSON.stringify({date:e,timeZone:t})});return await this.handleApiError(r)?this.listEvents(e,t):(r.ok||await this.throwForErrorResponse(r,"Failed to list events"),await r.json())}catch(r){throw console.error("Error listing events:",r),r}}async listCalendars(){try{let e=await fetch(`${this.serverUrl}/calendar/list-calendars`,{method:"GET",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})});return await this.handleApiError(e)?this.listCalendars():(e.ok||await this.throwForErrorResponse(e,"Failed to list calendars"),await e.json())}catch(e){throw console.error("Error listing calendars:",e),e}}async updateCalendarPreferences(e){try{let t=await fetch(`${this.serverUrl}/calendar/preferences`,{method:"PUT",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"}),body:JSON.stringify({selectedCalendarIds:e})});if(await this.handleApiError(t))return this.updateCalendarPreferences(e);t.ok||await this.throwForErrorResponse(t,"Failed to update calendar preferences");let o=await t.json();try{await chrome.storage.local.set({selectedCalendarIds:e,selectedCalendarIdsUpdatedAt:Date.now()})}catch(a){console.warn("Failed to persist selected calendar IDs locally",a)}return o}catch(t){throw console.error("Error updating calendar preferences:",t),t}}async notifyToolbarNotFound(e){try{let t=await fetch(`${this.serverUrl}/diagnostics/toolbar-not-found`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"}),body:JSON.stringify(e)});return t.ok?{success:!0,...await t.json()}:(console.warn("Failed to send diagnostic info to backend"),{success:!1})}catch(t){return console.error("Error notifying backend about toolbar issue:",t),{success:!1,error:t.message}}}async getSubscriptionStatus(){try{let e=await fetch(`${this.serverUrl}/payment/status`,{method:"GET",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})});e.ok||await this.throwForErrorResponse(e,"Failed to fetch subscription status");let t=await e.json(),r=this.computeCardlessTrialEligibility(t);return{success:!0,data:{...t,hasActiveSubscription:!0},canStartCardlessTrial:r}}catch(e){console.error("Error getting subscription status:",e);let t={success:!1,error:e?.message||"Failed to fetch subscription status"};return e?.code&&(t.code=e.code),typeof e?.retryAfterSeconds=="number"&&(t.retryAfterSeconds=e.retryAfterSeconds),t}}async createCheckoutSession(){try{let e=await fetch(`${this.serverUrl}/payment/create-checkout`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})});e.ok||await this.throwForErrorResponse(e,"Failed to create checkout session");let t=await e.json();return{success:!0,url:t.url,sessionId:t.sessionId}}catch(e){return console.error("Error creating checkout session:",e),{success:!1,error:e.message}}}async createBillingPortalSession(){try{let e=await fetch(`${this.serverUrl}/payment/billing-portal`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})});return e.ok||await this.throwForErrorResponse(e,"Failed to create billing portal session"),{success:!0,url:(await e.json()).url}}catch(e){return console.error("Error creating billing portal session:",e),{success:!1,error:e.message}}}async startCardlessTrial(){let e=null;try{let t=await fetch(`${this.serverUrl}/trial/cardless/start`,{method:"POST",credentials:"include",headers:this.buildHeaders({"Content-Type":"application/json"})});try{e=await t.json()}catch{e=null}if(!t.ok){let a=e?.status,i=this.computeCardlessTrialEligibility(a??null);return{success:!1,error:e?.error||`HTTP ${t.status}: ${t.statusText}`,code:e?.code,status:a,canStartCardlessTrial:i}}let r=e,o=this.computeCardlessTrialEligibility(r);return{success:!0,data:r,canStartCardlessTrial:o}}catch(t){return console.error("Error starting cardless trial:",t),{success:!1,error:t.message||"Failed to start cardless trial",status:e?.status??null,code:e?.code}}}},n=new p;n.initialize().catch(s=>{console.error("Failed to initialize API client state:",s)});var W=5*60*1e3,j=30*1e3,f=!1;async function v(s=!1){try{let e=await chrome.storage.local.get({subscriptionLastChecked:0,hasActiveSubscription:!1,isAuthenticated:!1});if(!e.isAuthenticated)return;let t=Date.now(),r=e.hasActiveSubscription?W:j;if(!s&&e.subscriptionLastChecked&&t-e.subscriptionLastChecked<r||f)return;f=!0;let a=await n.getSubscriptionStatus();if(a.success)await chrome.storage.local.set({hasActiveSubscription:a.data.hasActiveSubscription,subscriptionLastChecked:t}),console.log("Background subscription status updated");else{let i=a;await chrome.storage.local.set({subscriptionLastChecked:t}),console.warn("Background subscription status check failed:",i.error||"unknown error")}}catch(e){console.error("Background subscription status refresh error:",e)}finally{f=!1}}chrome.runtime.onMessage.addListener((s,e,t)=>((async()=>{try{switch(s.action){case"checkAuth":let r=await n.checkAuthStatus();t(r);break;case"authenticate":let o=await n.authenticate();t(o);break;case"signOut":let a=await n.signOut();t(a);break;case"revokeAccess":let i=await n.revokeAccess();t(i);break;case"modifyEvent":let c=await n.modifyEventFromContent(s.htmlLink);t(c);break;case"modifyEventDirect":let directResult=await modifyEventDirectAPI(s.htmlLink);t(directResult);break;case"listEventsDirect":let eventsDirectResult=await listEventsDirectAPI(s.date,s.timeZone);t(eventsDirectResult);break;case"listCalendarsDirect":let calendarsDirectResult=await listCalendarsDirectAPI();t(calendarsDirectResult);break;case"listEvents":let l=await n.listEvents(s.date,s.timeZone);t(l);break;case"listCalendars":let d=await n.listCalendars();t(d);break;case"updateCalendarPreferences":let k=await n.updateCalendarPreferences(s.selectedCalendarIds);t(k);break;case"toggleEventCompletion":let A=await n.modifyEventFromPopup(s.eventId,s.calendarId);t(A);break;case"notifyToolbarNotFound":let P=await n.notifyToolbarNotFound(s.diagnosticInfo);t(P);break;case"refreshAuthStatus":let C=await n.checkAuthStatus();t({authenticated:C});break;case"calendarTabActivity":await v(),t({success:!0});break;case"getSubscriptionStatus":let T=await n.getSubscriptionStatus();t(T);break;case"startCardlessTrial":let I=await n.startCardlessTrial();t(I);break;case"createCheckoutSession":let F=await n.createCheckoutSession();t(F);break;case"createBillingPortalSession":let O=await n.createBillingPortalSession();t(O);break;default:t({error:"Unknown action"})}}catch(r){let o={success:!1,error:r?.message||"Operation failed"};r?.details!==void 0&&(o.details=r.details),r?.code&&(o.code=r.code),typeof r?.retryAfterSeconds=="number"&&(o.retryAfterSeconds=r.retryAfterSeconds),t(o)}})(),!0));chrome.runtime.onMessageExternal.addListener((s,e,t)=>{if(!x(e))return console.warn("Blocked external message from unauthorized origin"),t({success:!1,error:"Unauthorized origin"}),!1;if(s?.type==="session-proof"&&typeof s.clientProof=="string"){let r=[n.setSessionProof(s.clientProof)];return typeof s.hasActiveSubscription=="boolean"&&r.push(chrome.storage.local.set({hasActiveSubscription:s.hasActiveSubscription})),typeof s.userEmail=="string"&&r.push(chrome.storage.local.set({userEmail:s.userEmail})),Promise.all(r).then(()=>t({success:!0})).catch(o=>t({success:!1,error:o.message})),!0}return s?.type==="auth-close-window"?(n.closeAuthWindow().then(()=>t({success:!0})).catch(r=>t({success:!1,error:r.message||"Failed to close auth window"})),!0):(t({success:!1,error:"Unsupported message type"}),!1)});chrome.runtime.onInstalled.addListener(async s=>{let e=chrome.runtime.getManifest().version;try{await n.initialize(),await n.checkAuthStatus()}catch(t){console.warn("Initialization during onInstalled failed",t)}try{if(!!!(await chrome.storage.sync.get([g,b]))?.[g]){let o=s.reason==="install"?N:D;await M(o,e)}}catch(t){console.error("Failed to launch onboarding tab during install/update",t)}await v(!0)});async function M(s,e){await chrome.tabs.create({url:chrome.runtime.getURL(s)}),await chrome.storage.sync.set({[g]:!0,[b]:e})}})();

// Google Calendar API Direct Client
async function getGoogleCalendarAuthToken() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      if (chrome.runtime.lastError) {
        console.error('[CalAPI] Auth token error:', chrome.runtime.lastError);
        reject(new Error(chrome.runtime.lastError.message));
      } else if (!token) {
        reject(new Error('No auth token received'));
      } else {
        console.log('[CalAPI] Auth token obtained successfully');
        resolve(token);
      }
    });
  });
}

function parseEventFromHtmlLink(htmlLink) {
  try {
    // Try to parse as URL first
    try {
      const url = new URL(htmlLink);
      const eid = url.searchParams.get('eid');
      if (eid) {
        const decoded = atob(eid.split(' ')[0]);
        const parts = decoded.split(' ');
        const eventId = parts[0];
        const calendarId = parts[1] || 'primary';
        console.log('[CalAPI] Parsed from URL:', { eventId, calendarId, from: htmlLink });
        return { eventId, calendarId };
      }
    } catch (urlError) {
      // Not a valid URL, continue to other parsing methods
      console.log('[CalAPI] Not a URL, trying other formats:', htmlLink);
    }

    // Try to decode as base64 (Google Calendar data-eventid format)
    try {
      const decoded = atob(htmlLink);
      console.log('[CalAPI] Base64 decoded:', decoded);
      const parts = decoded.split(' ');
      if (parts.length >= 2) {
        const eventId = parts[0];
        let calendarId = parts[1];

        // Fix truncated gmail.com addresses (Google Calendar sometimes truncates @gmail.com to @m)
        if (calendarId.endsWith('@m')) {
          calendarId = calendarId.replace(/@m$/, '@gmail.com');
          console.log('[CalAPI] Fixed truncated calendar ID:', calendarId);
        }

        console.log('[CalAPI] Parsed from base64:', { eventId, calendarId, from: htmlLink });
        return { eventId, calendarId };
      }
    } catch (base64Error) {
      // Not valid base64, try other formats
      console.log('[CalAPI] Not base64, treating as plain event ID:', htmlLink);
    }

    // Treat as plain event ID (format: eventId or eventId_calendarId)
    const parts = htmlLink.split('_');
    let eventId, calendarId;

    if (parts.length >= 2) {
      // Format: eventId_calendarId (e.g., "abc123_primary" or "abc123_user@gmail.com")
      eventId = parts[0];
      calendarId = parts.slice(1).join('_');
    } else {
      // Simple event ID, use primary calendar
      eventId = htmlLink;
      calendarId = 'primary';
    }

    console.log('[CalAPI] Parsed as plain event ID:', { eventId, calendarId, from: htmlLink });
    return { eventId, calendarId };
  } catch (error) {
    console.error('[CalAPI] Failed to parse event identifier:', error);
    throw new Error('Failed to parse event link: ' + error.message);
  }
}

async function modifyEventDirectAPI(htmlLink) {
  try {
    console.log('[CalAPI] Starting direct API call for:', htmlLink);

    const token = await getGoogleCalendarAuthToken();
    const { eventId, calendarId } = parseEventFromHtmlLink(htmlLink);

    // Get current event
    const getUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    console.log('[CalAPI] Fetching event:', getUrl);

    const getResponse = await fetch(getUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      console.error('[CalAPI] Get event failed:', errorText);
      throw new Error(`Failed to get event: ${getResponse.status} ${errorText}`);
    }

    const event = await getResponse.json();
    console.log('[CalAPI] Current event title:', event.summary);

    // Get user preferences
    const prefs = await chrome.storage.sync.get({
      'add-emoji-check-mark': true,
      'use-strikethrough-effect': false
    });

    // Toggle completion
    const hasCheckmark = event.summary?.startsWith('✅');
    const hasStrikethrough = event.summary?.includes('\u0336');
    const isCompleted = hasCheckmark || hasStrikethrough;

    let newSummary;
    if (isCompleted) {
      // Remove completion markers
      newSummary = event.summary.replace(/^✅\s*/, '').replace(/\u0336/g, '');
    } else {
      // Add completion markers
      newSummary = event.summary || '(No Title)';
      if (prefs['use-strikethrough-effect']) {
        newSummary = newSummary.split('').map(char =>
          /\s/.test(char) ? char : char + '\u0336'
        ).join('');
      }
      if (prefs['add-emoji-check-mark']) {
        newSummary = '✅ ' + newSummary;
      }
    }

    console.log('[CalAPI] New title:', newSummary);

    // Update event
    const patchUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`;
    const patchResponse = await fetch(patchUrl, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: newSummary
      })
    });

    if (!patchResponse.ok) {
      const errorText = await patchResponse.text();
      console.error('[CalAPI] Patch event failed:', errorText);
      throw new Error(`Failed to update event: ${patchResponse.status} ${errorText}`);
    }

    const updatedEvent = await patchResponse.json();
    console.log('[CalAPI] Event updated successfully:', updatedEvent.summary);

    return {
      success: true,
      action: isCompleted ? 'unmarked' : 'marked',
      summary: updatedEvent.summary,
      htmlLink: updatedEvent.htmlLink
    };
  } catch (error) {
    console.error('[CalAPI] Error in modifyEventDirectAPI:', error);
    return {
      success: false,
      error: error.message || 'Failed to modify event via Google Calendar API'
    };
  }
}

async function listEventsDirectAPI(date, timeZone) {
  try {
    console.log('[CalAPI] Listing events for date:', date, 'timezone:', timeZone);

    const token = await getGoogleCalendarAuthToken();

    // Get selected calendar IDs from storage, default to ['primary']
    const storage = await chrome.storage.local.get({ selectedCalendarIds: ['primary'] });
    const calendarIds = storage.selectedCalendarIds || ['primary'];

    console.log('[CalAPI] Querying calendars:', calendarIds);

    // Parse the date and create time boundaries
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      throw new Error('Invalid date format: ' + date);
    }

    // Set time to start of day (00:00:00) in the specified timezone
    const startOfDay = new Date(dateObj);
    startOfDay.setHours(0, 0, 0, 0);

    // Set time to end of day (23:59:59) in the specified timezone
    const endOfDay = new Date(dateObj);
    endOfDay.setHours(23, 59, 59, 999);

    const timeMin = startOfDay.toISOString();
    const timeMax = endOfDay.toISOString();

    console.log('[CalAPI] Time range:', timeMin, 'to', timeMax);

    // Fetch events from all selected calendars
    const eventPromises = calendarIds.map(async (calendarId) => {
      const url = new URL(`https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      url.searchParams.set('timeMin', timeMin);
      url.searchParams.set('timeMax', timeMax);
      url.searchParams.set('singleEvents', 'true');
      url.searchParams.set('orderBy', 'startTime');
      url.searchParams.set('maxResults', '250');

      console.log('[CalAPI] Fetching events from calendar:', calendarId);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[CalAPI] Failed to fetch events from calendar:', calendarId, errorText);
        // Return empty array for failed calendars instead of throwing
        return [];
      }

      const data = await response.json();
      const events = data.items || [];

      // Add calendarId and completion status to each event
      events.forEach(event => {
        event.calendarId = calendarId;

        // Detect completion status using same logic as modifyEventDirectAPI
        const hasCheckmark = event.summary?.startsWith('✅');
        const hasStrikethrough = event.summary?.includes('\u0336');
        event.isCompleted = hasCheckmark || hasStrikethrough;
      });

      return events;
    });

    // Wait for all calendar queries to complete
    const allEventsArrays = await Promise.all(eventPromises);

    // Flatten and sort all events by start time
    const allEvents = allEventsArrays.flat();
    allEvents.sort((a, b) => {
      const aTime = a.start?.dateTime || a.start?.date || '';
      const bTime = b.start?.dateTime || b.start?.date || '';
      return aTime.localeCompare(bTime);
    });

    console.log('[CalAPI] Total events found:', allEvents.length);

    return {
      success: true,
      events: allEvents
    };
  } catch (error) {
    console.error('[CalAPI] Error in listEventsDirectAPI:', error);
    return {
      success: false,
      error: error.message || 'Failed to list events via Google Calendar API'
    };
  }
}

async function listCalendarsDirectAPI() {
  try {
    console.log('[CalAPI] Listing calendars');

    const token = await getGoogleCalendarAuthToken();

    const url = 'https://www.googleapis.com/calendar/v3/users/me/calendarList';

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[CalAPI] Failed to list calendars:', errorText);
      throw new Error(`Failed to list calendars: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const calendars = data.items || [];

    console.log('[CalAPI] Calendars found:', calendars.length);

    return {
      success: true,
      calendars: calendars
    };
  } catch (error) {
    console.error('[CalAPI] Error in listCalendarsDirectAPI:', error);
    return {
      success: false,
      error: error.message || 'Failed to list calendars via Google Calendar API'
    };
  }
}
