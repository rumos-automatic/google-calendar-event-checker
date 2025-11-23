(()=>{(async function(){let q="gcal-checker-chrome-ext-btn-wrapper",w="[role='main'] input[type='text']",$={"add-emoji-check-mark":!0,"add-description-completed-datetime":!0,"add-description-origin-title":!1,"use-strikethrough-effect":!1,"add-emoji-crossed-mark":!1,"enable-reporting":!1},G=e=>new Promise(n=>{chrome.storage.sync.get(e,o=>n(o))}),V=e=>new Promise(n=>{chrome.storage.local.get(e,o=>n(o))}),g=await G($);function S(){return window.location.href.indexOf("eventedit")!==-1}let C="[CalCheckr]";function f(...e){console.log(C,...e),window.Sentry&&window.Sentry.captureMessage(String(e[0]))}function x(...e){console.warn(C,...e),window.Sentry&&window.Sentry.captureMessage(String(e[0]),{level:"warning"})}function l(...e){if(console.error(C,...e),window.Sentry){let o=e.find(t=>t instanceof Error)||new Error(String(e[0]));window.Sentry.captureException(o)}}function X(e){try{chrome.runtime.sendMessage({action:"calendarTabActivity",reason:e},()=>{let n=chrome.runtime.lastError;n&&!/Receiving end does not exist/i.test(n.message||"")&&l("Subscription refresh request failed",n.message)})}catch(n){l("Subscription refresh request threw",n)}}let j=!0,U=g["add-emoji-check-mark"],K=g["add-emoji-crossed-mark"],E=["\u2705","\u274C"],Z=[...K?["\u274C"]:[],...U?["\u2705"]:[]],y="\u0336",W=e=>e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),R=new RegExp(`^(${E.map(W).join("|")})\\s*`,"u"),Y=new RegExp(y,"g"),J=e=>!!(e&&R.test(e)),Q=e=>!!(e&&e.includes(y)),B=e=>e?e.replace(R,"").replace(Y,""):"",O=e=>J(e)||Q(e);function T(){return S()?document.querySelector(w):null}function ee(e){if(!g["use-strikethrough-effect"])return e;let n=r=>{let i=r.codePointAt(0);return i?i>=19968&&i<=40959:!1};if(typeof Intl<"u"&&Intl.Segmenter){let r=new Intl.Segmenter("en",{granularity:"grapheme"});return Array.from(r.segment(e)).map(({segment:s})=>/\s/.test(s)||new RegExp("\\p{Emoji_Presentation}","u").test(s)||n(s)?s:s+y).join("")}let o=new RegExp("\\p{RI}\\p{RI}|\\p{Emoji}(\\p{Emoji_Modifier}|\\uFE0F)?(\\u200D\\p{Emoji}(\\p{Emoji_Modifier}|\\uFE0F)?)*|.","gus");return(e.match(o)||[]).map(r=>/\s/.test(r)||new RegExp("\\p{Emoji_Presentation}","u").test(r)||n(r)?r:r+y).join("")}function N(e){return e.split("").filter(n=>n!==y).join("")}function te(e,n){return!g["add-emoji-check-mark"]&&!g["add-emoji-crossed-mark"]?e:`${n} ${e}`}function z(e){return e.replace(new RegExp(`^(${E.join("|")})(\\s)`,"gi"),"")}function ne(e,n){let o=e;return[...o].some(r=>r===y)||E.some(r=>o.startsWith(r))?(o=N(o),o=z(o)):(o=ee(o),o=te(o,n)),o}function H(e){[...e.value].some(o=>o===y)?e.style.fontFamily="Arial, sans-serif":e.style.fontFamily=""}async function oe(e){let n=T();if(!n)return;let o=n.value;if(!o)return;let t=ne(o,e),r=[...t].some(i=>i===y)||E.some(i=>t.startsWith(i));n.value=`${t}`,n.dispatchEvent(new Event("input",{bubbles:!0})),H(n),ie({originValue:N(z(t)),checked:r})}function re(e){try{oe(e),f("Successful usage: click")}catch(n){l(n)}}function ie({originValue:e,checked:n}){let o=document.querySelector('div[role="textbox"][aria-multiline="true"]');if(!o){l("Description div node was not found");return}o.innerHTML=o.innerHTML.replace(/(<br>)?===\u{200b}===.*===\u{200b}===/gu,"");let t=g["add-description-completed-datetime"],r=g["add-description-origin-title"];if(!t&&!r)return;let i=new Date().toLocaleDateString(void 0,{timeZoneName:"short"})+", "+new Date().toLocaleTimeString(),s=t?`Marked on: ${i}`:"",c=r?`Origin title: ${e}`:"",a="\u200B",d=[s,c].filter(p=>p).join("<br>"),u=`===${a}===<br>${d}<br>===${a}===`;if(n&&(s||c)){let p=`${o.innerHTML.length?"<br>":""}${u}`;o.innerHTML+=p}else o.innerHTML=o.innerHTML.replace(/(<br>)?===\u{200b}===.*===\u{200b}===/gu,"")}function k(e){if(document.getElementById(q))return;let o=e.parentElement;if(!o)return;let t=document.createElement("div");t.id=q,t.style.position="absolute",t.style.right="0px";function r(i){let s=document.createElement("button");s.innerText=i,s.style.border="none",s.style.outline="none",s.style.padding="0",s.style.margin="0 0 0 5px",s.style.background="none",s.style.fontSize="26px",s.addEventListener("click",()=>re(i)),t.appendChild(s)}Z.forEach(i=>r(i)),o.appendChild(t),H(e),f("Complete button added to DOM on Event Edit page")}function se(){let e=document.body,n={attributes:!0,childList:!0,subtree:!0},o=r=>{for(let i of r){if(i.type==="attributes"&&i.attributeName==="data-viewkey"){if(document.body.dataset.viewkey?.toLowerCase()==="eventedit"){let s=T();s&&k(s)}continue}i.type==="childList"&&S()&&i.addedNodes.forEach(s=>{if(s.nodeType!==Node.ELEMENT_NODE)return;let c=s;if(c.matches&&c.matches(w)){k(c);return}if(c.querySelector){let a=c.querySelector(w);a&&k(a)}})}};if(new MutationObserver(o).observe(e,n),S()){let r=T();r&&k(r)}}function F(e){let n=e.querySelector("#rAECCd");if(n)return n;let o=e.querySelector("#xDetDlgWhen");if(o&&(n=o.querySelector("[data-text]"),n)||(n=e.querySelector('[role="heading"][aria-level="1"]'),n)||(n=e.querySelector('span[role="heading"]'),n))return n;let t=e.querySelector('[jsname="sV9x3c"]');if(t&&(n=t.querySelector('span[role="heading"]')||t.querySelector('span[id*="AE"]'),n))return n;let r=e.querySelector(".nBzcnc, .toUqff");return r&&(n=r.querySelector('span[role="heading"], h1, h2'),n)?n:(l("Could not find title element with any strategy"),null)}function M(e){let n=F(e);if(!n)return!1;let o=n.textContent||"";return O(o)}function ae(e,n){let o=F(e);if(!o){l("Title element not found");return}let t=o.textContent||"",r=O(t),i;if(r)i=B(t),f("Event unmarked as completed");else{let a=B(t);i=`\u2705 ${a.length>0?a:"(No Title)"}`,f("Event marked as completed")}o.textContent=i;let s=e.querySelector("#gcal-checker-complete-btn button");s&&(s.style.opacity="0.6",s.style.pointerEvents="none");let c="イベントの更新に失敗しました。認証したGoogleアカウントのカレンダーイベントを表示していることを確認してください。";chrome.runtime.sendMessage({action:"modifyEventDirect",htmlLink:n},a=>{if(s&&(s.style.opacity="1",s.style.pointerEvents="auto"),chrome.runtime.lastError){l("Error communicating with background script",chrome.runtime.lastError),o.textContent=t,L(e,"イベントの更新に失敗しました。もう一度お試しください。"),setTimeout(()=>{v(e),A(e,c)},0);return}if(a&&a.success){if(a.needsManualUpdate){f("[DEV MODE] Using fallback: opening edit page");let u=a.htmlLink||n;if(!u){L(e,"エラー：イベントリンクが見つかりません");return}L(e,"[開発モード] イベント編集ページで自動更新しています...");let p=u.replace(/\/event\?/,"/eventedit/").replace(/&ctz=.*/,"");window.open(p,"_blank"),setTimeout(()=>{v(e)},2e3);return}f("Event modification successful");let u=(a.action||(r?"unmarked":"marked"))==="marked"?"\u2713 完了としてマーク！":"\u21BA 未完了としてマーク！";ce(e,u),setTimeout(()=>{v(e)},0)}else if(a&&a.code==="RATE_LIMITED"){let d=typeof a.retryAfterSeconds=="number"?`${a.retryAfterSeconds}s`:"unknown wait time";l("Event modification rate limited",d),o.textContent=t;let u=typeof a.retryAfterSeconds=="number"&&a.retryAfterSeconds>0?a.retryAfterSeconds:void 0,p=typeof a.error=="string"&&a.error.length>0?a.error:"短時間に多数のイベント更新が行われました。しばらくしてからお試しください。",m=u!==void 0?`${p} ${u}秒後に再試行してください。`:p;L(e,m),setTimeout(()=>{v(e),A(e,m)},0)}else{l("Failed to modify event",a?.error||"Unknown error"),l(new Error(a?.error||"Failed to modify event")),o.textContent=t;let d=a?.details==="Not Found",u=d?c:a?.error||"イベントの更新に失敗しました";L(e,u),setTimeout(()=>{v(e),A(e,d?c:u)},0)}})}function ce(e,n){let o=document.getElementById("gcal-checker-active-notification");o&&o.remove();let t=document.createElement("div");t.className="gcal-checker-notification gcal-checker-success",t.id="gcal-checker-active-notification";let r=document.createElement("div");r.style.cssText=`
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
        `;let i=document.createElement("div");i.textContent="\u2713",i.style.cssText=`
            font-size: 20px;
            font-weight: bold;
            color: #0f9d58;
            background: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;let s=document.createElement("div");s.textContent=n,s.style.cssText=`
            font-weight: 600;
            font-size: 14px;
        `,r.appendChild(i),r.appendChild(s);let c=document.createElement("div");c.innerHTML="Googleカレンダーの表示は遅延して更新されます。<br>ページを更新すると、変更をすぐに確認できます。",c.style.cssText=`
            font-size: 11px;
            opacity: 0.85;
            line-height: 1.4;
            margin-bottom: 10px;
            color: rgba(255, 255, 255, 0.9);
        `;let a=document.createElement("button");a.innerHTML=`
            <svg width="14" height="14" viewBox="0 0 24 24" style="margin-right: 4px; vertical-align: middle;">
                <path fill="currentColor" d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
            </svg>
            今すぐページを更新
        `,a.style.cssText=`
            background: rgba(255, 255, 255, 0.25);
            color: white;
            border: 1px solid rgba(255, 255, 255, 0.3);
            padding: 6px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            width: 100%;
            font-family: 'Google Sans', Roboto, Arial, sans-serif;
        `,a.addEventListener("mouseenter",()=>{a.style.background="rgba(255, 255, 255, 0.35)"}),a.addEventListener("mouseleave",()=>{a.style.background="rgba(255, 255, 255, 0.25)"}),a.addEventListener("click",()=>{window.location.reload()}),t.appendChild(r),t.appendChild(c),t.appendChild(a),t.style.cssText=`
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #0f9d58 0%, #0d8547 100%);
            color: white;
            padding: 16px;
            border-radius: 12px;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 4px 20px rgba(15, 157, 88, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
            pointer-events: auto;
            z-index: 99999;
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-width: 300px;
            font-family: 'Google Sans', Roboto, Arial, sans-serif;
        `,document.body.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translateX(0)"}),setTimeout(()=>{t.style.transition="all 0.4s ease-out",t.style.opacity="0",t.style.transform="translateX(20px)",setTimeout(()=>{t.remove()},400)},8e3)}function L(e,n){let o=document.getElementById("gcal-checker-active-notification");o&&o.remove();let t=document.createElement("div");t.id="gcal-checker-active-notification",t.style.cssText=`
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #d93025 0%, #b71c1c 100%);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            font-family: 'Google Sans', 'Roboto', arial, sans-serif;
            box-shadow: 0 4px 16px rgba(217, 48, 37, 0.3);
            z-index: 99999;
            opacity: 0;
            transform: translateX(400px);
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            max-width: 360px;
        `;let r=document.createElement("div");r.style.cssText=`
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 8px;
        `;let i=document.createElement("div");i.innerHTML="\u2717",i.style.cssText=`
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            font-weight: bold;
            flex-shrink: 0;
        `,r.appendChild(i);let s=document.createElement("div");s.textContent=n,s.style.cssText=`
            font-size: 14px;
            font-weight: 500;
            line-height: 1.4;
        `,r.appendChild(s),t.appendChild(r);let c=document.createElement("div");c.textContent="Please try again. If the problem persists, check your connection.",c.style.cssText=`
            font-size: 12px;
            opacity: 0.9;
            line-height: 1.4;
            margin-left: 34px;
        `,t.appendChild(c),document.body.appendChild(t),requestAnimationFrame(()=>{t.style.opacity="1",t.style.transform="translateX(0)"}),setTimeout(()=>{t.style.transition="all 0.4s ease-out",t.style.opacity="0",t.style.transform="translateX(400px)",setTimeout(()=>{t.remove()},400)},5e3)}function le(){if(document.getElementById("gcal-checker-notification-styles"))return;let e=document.createElement("style");e.id="gcal-checker-notification-styles",e.textContent=`
            @keyframes gcal-checker-shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }

            @keyframes gcal-checker-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .gcal-checker-notification {
                font-family: 'Google Sans', Roboto, Arial, sans-serif;
                letter-spacing: 0.2px;
            }
        `,document.head.appendChild(e)}function v(e){let n=e.querySelector("#gcal-checker-complete-btn button"),o=document.getElementById("gcal-checker-tooltip-complete");if(!n||!o){l("Button or tooltip not found for update");return}let r=M(e)?"Remove completion":"Mark as completed";n.setAttribute("aria-label",r),o.textContent=r;let i=n.closest("#gcal-checker-complete-btn");i&&b(i,e)}function de(e,n){let o=document.createElement("div");o.id="gcal-checker-complete-btn",o.style.cssText=`
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            margin: 0 8px 0 0;
            width: 28px;
            height: 28px;
            flex-shrink: 0;
        `;let t=document.createElement("button"),i=M(n)?"Remove completion":"Mark as completed";t.setAttribute("aria-label",i),t.setAttribute("type","button"),t.style.cssText=`
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 0;
            transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease, filter 0.2s ease, opacity 0.2s ease;
            outline: none;
        `,t.innerHTML=`
            <svg focusable="false" width="20" height="20" viewBox="0 0 24 24">
                <path data-state="mark" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"></path>
                <path data-state="unmark" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" opacity="0"></path>
            </svg>
        `;let s=document.getElementById("gcal-checker-tooltip-complete");s&&s.remove();let c=document.createElement("div");c.setAttribute("role","tooltip"),c.id="gcal-checker-tooltip-complete",c.textContent=i,c.style.cssText=`
            position: fixed;
            left: 50%;
            top: 0;
            transform: translate(-50%, 0) scale(0.9);
            background: rgba(33, 33, 33, 0.95);
            color: #fff;
            padding: 6px 10px;
            border-radius: 4px;
            font-size: 12px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            white-space: nowrap;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.2s ease, transform 0.2s ease;
            z-index: 2147483647;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        `;let a=()=>{let h=t.getBoundingClientRect(),be=h.bottom+8;c.style.left=`${h.left+h.width/2}px`,c.style.top=`${be}px`},d=!1,u=()=>{if(d){a();return}d=!0,a(),c.style.opacity="1",c.style.transform="translate(-50%, 0) scale(1)",window.addEventListener("scroll",a,!0),window.addEventListener("resize",a,!0)},p=()=>{d&&(d=!1,c.style.opacity="0",c.style.transform="translate(-50%, 0) scale(0.9)",window.removeEventListener("scroll",a,!0),window.removeEventListener("resize",a,!0))},m=h=>{b(o,n),h?(t.style.transform="scale(1.05)",t.style.boxShadow="0 3px 8px rgba(0, 0, 0, 0.25)",t.style.filter="brightness(1.1)",t.style.opacity="1"):t.style.transform="scale(1)"};return t.addEventListener("mouseenter",()=>{m(!0),u()}),t.addEventListener("mouseleave",()=>{m(!1),p()}),t.addEventListener("focus",()=>{m(!0),u()}),t.addEventListener("blur",()=>{m(!1),p()}),t.addEventListener("mousedown",()=>{t.style.transform="scale(0.95)"}),t.addEventListener("mouseup",()=>{t.matches(":hover")?m(!0):m(!1)}),t.addEventListener("click",h=>{h.preventDefault(),h.stopPropagation(),t.blur(),p(),ae(n,e),requestAnimationFrame(()=>{document.body.contains(o)&&(b(o,n),(t.matches(":hover")||document.activeElement===t)&&m(!0))})}),document.body.appendChild(c),o.appendChild(t),_(o,"#0f9d58"),b(o,n),o}function ue(e){if(!e||e.nodeType!==Node.ELEMENT_NODE)return!1;let n=e.getAttribute("style");return!!(n&&/background-color\s*:/i.test(n))}function P(e){if(!e||e.nodeType!==Node.ELEMENT_NODE)return null;if(ue(e))return e;for(let n of e.children){let o=P(n);if(o)return o}return null}function fe(e,n){let o=e;for(;o&&o!==n;){let t=o.parentElement;if(!t)break;for(let r of Array.from(t.children)){if(r===o)continue;let i=P(r);if(i)return i}o=t}return null}function pe(e){return e?window.CSS&&typeof window.CSS.escape=="function"?window.CSS.escape(e):e.replace(/[^a-zA-Z0-9_-]/g,n=>`\\${n}`):""}function me(e){if(!e)return;let n=`gcal-checker-hide-style-${e.replace(/[^a-zA-Z0-9_-]/g,"_")}`;if(document.getElementById(n))return;let o=pe(e),t=document.createElement("style");t.id=n,t.textContent=`body #xDetDlg .${o} { display: none !important; visibility: hidden !important; opacity: 0 !important; }`,document.body.appendChild(t)}function _(e,n){if(!e||!n)return;let o=e.querySelector("button");if(!o)return;let t=n.trim();(!t||t==="transparent"||t==="rgba(0, 0, 0, 0)")&&(t="#0f9d58"),e.dataset.gcalCheckerAccentColor=t,o.style.backgroundColor=t,o.style.color="#fff",e.dataset.gcalCheckerBaseShadow="0 1px 3px rgba(0, 0, 0, 0.2)",o.querySelectorAll("path").forEach(i=>i.setAttribute("fill","currentColor"))}function b(e,n){if(!e)return;let o=e.querySelector("button");if(!o)return;let t=n||o.closest("#xDetDlg")||document.querySelector("#xDetDlg"),r=t?M(t):!1,i=e.dataset.gcalCheckerAccentColor||"#0f9d58",s=e.dataset.gcalCheckerBaseShadow||"0 1px 3px rgba(0, 0, 0, 0.2)";e.dataset.gcalCheckerAccentColor=i,e.dataset.gcalCheckerBaseShadow=s,e.dataset.gcalCheckerCompleted=r?"true":"false",o.style.backgroundColor=i,o.style.color="#fff",o.style.boxShadow=r?"none":s,o.style.filter=r?"saturate(0.6) brightness(0.95)":"none",o.style.opacity=r?"0.75":"1";let c=o.querySelector('path[data-state="mark"]'),a=o.querySelector('path[data-state="unmark"]');c&&a&&(c.style.opacity=r?"0":"1",a.style.opacity=r?"1":"0"),o.dataset.gcalCheckerTooltipState==="error"&&delete o.dataset.gcalCheckerTooltipState,o.setAttribute("aria-pressed",r?"true":"false")}function A(e,n){let o=document.getElementById("gcal-checker-tooltip-complete");o&&(o.textContent=n);let t=e.querySelector("#gcal-checker-complete-btn button");t&&(t.setAttribute("aria-label",n),t.dataset.gcalCheckerTooltipState="error")}function D(e,n){let o=[".pdqVLc",".jefcFd > div:first-child",".nBzcnc",".toUqff"],t=null;for(let r of o){let i=e.querySelector(r);if(i){t=i;break}}t||(t=e);try{window.getComputedStyle(t).position==="static"&&(t.style.position="relative")}catch(r){x("Unable to compute styles for fallback host container",r)}return n.style.position="absolute",n.style.top="12px",n.style.left="12px",n.style.zIndex="1000",n.style.margin="0",t.insertBefore(n,t.firstChild),b(n,e),f("Complete button injected using fallback placement (top-left corner)"),t}function ge(e,n){let o=e.querySelector("#xDetDlgWhen");if(!o)return x("xDetDlgWhen element not found; using fallback placement"),D(e,n);let t=fe(o,e);if(!t)return x("Color indicator element not found; using fallback placement"),D(e,n);t.dataset.gcalCheckerOriginalDisplay||(t.dataset.gcalCheckerOriginalDisplay=t.style.display||"");let r=t.style.backgroundColor||window.getComputedStyle(t).backgroundColor||"#0f9d58";t.dataset.gcalCheckerHidden="true",t.style.display="none",Array.from(t.classList||[]).forEach(me);let s=t.parentElement;return s?(s.dataset.gcalCheckerOriginalOverflow||(s.dataset.gcalCheckerOriginalOverflow=s.style.overflow||""),s.style.overflow="visible",s.insertBefore(n,t),_(n,r),b(n,e),f("Complete button injected in event color slot"),s):(x("Color indicator parent element missing; using fallback placement"),D(e,n))}function I(e){try{if(!j||e.querySelector("#gcal-checker-complete-btn"))return;let o=e.getAttribute("data-eventid");if(!o){l("Event ID not found");return}let t=de(o,e),r=ge(e,t),i=new MutationObserver(c=>{e.querySelector("#gcal-checker-complete-btn")||(i.disconnect(),setTimeout(()=>I(e),10))}),s=r||e;i.observe(s,{childList:!0,subtree:s===e}),setTimeout(()=>{e.querySelector("#gcal-checker-complete-btn")||l("Complete button NOT found in DOM after injection!")},100)}catch(n){let o=n instanceof Error?n:new Error(String(n));l(o,"Failed to inject complete button")}}function ye(){let e=document.body,n={childList:!0,subtree:!0,attributes:!0,attributeFilter:["data-eventid"]},o=i=>{if(!(!i||i.nodeType!==Node.ELEMENT_NODE)){if(i.id==="xDetDlg"){I(i);return}if(typeof i.querySelector=="function"){let s=i.querySelector("#xDetDlg");s&&I(s)}}},t=new MutationObserver(i=>{for(let s of i){if(s.type==="childList"){s.addedNodes.forEach(o);continue}s.type==="attributes"&&s.attributeName==="data-eventid"&&o(s.target)}});t.observe(e,n);let r=()=>{let i=document.querySelectorAll("#xDetDlg");return i.forEach(o),i.length};return r(),{observer:t,scanExistingDialogs:r}}function he(){let e=chrome?.runtime?.getManifest()?.version||"n/a";window.Sentry.init({dsn:"https://6ba30b2efd7341d5b70786ee9f3d1b25@o4503916873777152.ingest.sentry.io/4503916877185024",initialScope:{tags:{version:e}},beforeSend:n=>(n.request?.url&&delete n.request.url,n),beforeBreadcrumb:n=>{let{category:o}=n;if(o==="navigation"){let t=r=>r.replace(/\/eventedit\/[^/]+/,"/eventedit/");return{category:"navigation",data:{from:t(n.data?.from||""),to:t(n.data?.to||"")}}}return n}})}try{se();let e=ye();le(),g["enable-reporting"]&&he(),X("page-load"),chrome.storage.onChanged.addListener((n,o)=>{if(o==="local"&&n.hasActiveSubscription){let t=n.hasActiveSubscription.newValue,r=n.hasActiveSubscription.oldValue;if(f("Subscription status flag changed"),j=t,t&&!r){f("Subscription activation detected; checking for open event dialogs");let i=e?.scanExistingDialogs?.()??0;i>0?f(`Processed ${i} dialog(s) for complete button injection.`):f("No open dialogs found. Button will appear on next event opened.")}}})}catch(e){l(e)}})();})();
