# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

**Google Calendar Event Checker** (gcal-checker) - Chrome拡張機能
- **バージョン**: 2.0.1
- **技術**: Chrome Extension Manifest V3, Vanilla JavaScript (ES6+)
- **目的**: Googleカレンダーのイベントを絵文字や取り消し線でマーク（完了/キャンセル）する機能を提供

### 主要機能
- イベント編集ページでの完了マーク付け（無料）
- ポップアップUIからイベント一覧表示と完了管理（プレミアム）
- 絵文字/取り消し線のカスタマイズ（無料）
- イベント詳細ダイアログでのクイック完了ボタン（プレミアム）
- サブスクリプションベースの機能提供

## アーキテクチャ

### コンポーネント構成
```
background.js (Service Worker)
    ↓ (Message Passing)
contentScript.js ←→ popup.js
    ↓                   ↓
Google Calendar    User Interface
```

#### 1. background.js - APIクライアント & メッセージルーター
- **役割**: バックエンドAPIとの通信、認証管理、メッセージルーティング
- **主要クラス**: `ApiClient`
  - セッション管理（sessionProof）
  - 認証フロー（OAuth）
  - カレンダー操作（イベント取得/変更、カレンダー一覧）
  - サブスクリプション管理
  - レート制限とエラーハンドリング
- **バックエンドURL**: https://api-prod-1ac9e2e428.calcheckr.com

#### 2. contentScript.js - DOM操作 & イベントUI注入
- **役割**: Googleカレンダーのイベント編集ページにUI要素を注入
- **主要機能**:
  - イベントタイトルフィールドに完了ボタン（✅、❌）を追加
  - タイトルへの取り消し線/絵文字適用
  - イベント説明への完了メタデータ追加
  - DOM Mutation Observerによるイベントダイアログ監視
  - プレミアム: イベント詳細ビューにクイック完了ボタン

#### 3. popup.js/popup.html - メインUI
- **アーキテクチャ**: ビューベースのステートマシン
- **主要ビュー**:
  - SignInView: Google認証
  - EventsView: 日次イベントダッシュボード（プレミアム）
  - PremiumView: サブスクリプションアップグレード
  - CarouselView: オンボーディングスライド
  - UserOptionsView: 設定画面
- **キャッシング**: 日ごとのイベントキャッシュ（5分/30秒）、カレンダーキャッシュ（1時間）

#### 4. options.js/options.html - 設定ページ
- **役割**: 完了マーカーの動作設定（無料機能）
- **設定項目**: 絵文字チェックマーク、絵文字×マーク、取り消し線効果、説明文追加

### ストレージ戦略

#### chrome.storage.local
```javascript
{
  sessionProof: string,              // 認証トークン
  isAuthenticated: boolean,
  hasActiveSubscription: boolean,    // サブスクリプション状態
  userEmail: string,
  selectedCalendarIds: string[],     // ユーザー選択カレンダー
  cachedCalendars: { calendars, timestamp },
  events_YYYY-MM-DD: { events, timestamp }  // 日ごとのキャッシュ
}
```

#### chrome.storage.sync（デバイス間同期）
```javascript
{
  "add-emoji-check-mark": boolean,
  "use-strikethrough-effect": boolean,
  "add-description-completed-datetime": boolean,
  // ... その他の設定
}
```

### メッセージパッシングパターン
```javascript
// Content Script → Background
chrome.runtime.sendMessage({ action: 'modifyEvent', data: {...} });

// Popup → Background
chrome.runtime.sendMessage({ action: 'listEvents', data: {...} });

// Background → Response
return { success: true, data: {...} };
```

### 認証フロー
1. ユーザーがサインインクリック
2. Background がOAuthウィンドウを開く（500x700ポップアップ）
3. バックエンドが /auth/callback にリダイレクト
4. Background がURL変化を監視、session proofを待機
5. Session proof を chrome.storage.local に保存
6. 全APIリクエストに `X-Session-Proof` ヘッダーとして含める

## 開発ワークフロー

### 重要: ビルドプロセスなし
- **package.json なし** - npmスクリプト、webpack、babelなし
- **デプロイ**: ソースファイルを直接使用
- **コード状態**: 既に圧縮済み（デバッグが困難）

### 拡張機能の読み込み
1. Chrome で `chrome://extensions` を開く
2. 「デベロッパーモード」を有効化
3. 「パッケージ化されていない拡張機能を読み込む」
4. このディレクトリを選択

### デバッグ方法
- **Background Service Worker**: chrome://extensions → "Service Worker" リンク
- **Popup**: ポップアップ上で右クリック → 「検証」
- **Content Script**: calendar.google.com でDevTools → Sourcesタブ
- **Options Page**: 設定ページで右クリック → 「検証」

### テスト
- **手動テスト**: calendar.google.com でイベント編集/完了を試す
- **認証テスト**: サインイン/サインアウトフロー
- **サブスクリプションテスト**: トライアル開始、アップグレード
- **自動テストなし** - 手動QAのみ

## 重要なコーディングパターン

### レート制限処理
```javascript
// Backend が HTTP 429 を返す場合
{
  error: true,
  message: "Rate limit exceeded",
  retryAfterSeconds: 60
}
// UI はカウントダウンタイマーを表示
```

### エラーハンドリング
- 認証エラー → サインインビューにリダイレクト
- APIエラー → ユーザーフレンドリーな通知
- セッション無効化 → ストレージクリア、再認証促す
- ネットワークエラー → 可能な限りキャッシュデータ使用

### DOM Mutation Observer（contentScript.js）
```javascript
// イベントダイアログの出現を監視
const observer = new MutationObserver(callback);
observer.observe(document.body, { childList: true, subtree: true });
```

### Sentry統合
- **バージョン**: 7.100.1（バンドル済み）
- **DSN**: o4503916873777152.ingest.sentry.io
- **ブレッドクラム**: プライバシーフィルタリング適用
- **有効化**: ユーザー設定 `enable-reporting` で制御

## プレミアム/無料機能の切り分け

### 無料機能
- イベント編集ページからの完了マーク
- 絵文字/取り消し線カスタマイズ
- 説明文の拡張

### プレミアム機能（hasActiveSubscription チェック）
- ポップアップイベントダッシュボード
- イベント詳細ダイアログのクイック完了ボタン
- 複数カレンダーサポート
- 任意のブラウザタブからイベント完了

### サブスクリプション層
1. **無料**: 基本機能のみ
2. **カードレストライアル**: 14日間プレミアム（クレカ不要）
3. **Stripeサブスクリプション**: フルプレミアムアクセス

## 主要ファイル

| ファイル | 目的 | 重要ポイント |
|---------|------|-------------|
| manifest.json | 拡張機能設定 | Manifest V3、権限、エントリーポイント |
| background.js | APIクライアント | ApiClientクラス、メッセージハンドラー |
| contentScript.js | DOM注入 | Mutation Observer、UI要素追加 |
| popup.js | メインUI | ビューコントローラー、状態管理 |
| popup.html | UI構造 | インラインスタイル大量（CSSファイルなし） |
| options.js | 設定永続化 | chrome.storage.sync使用 |

## 注意事項

### セキュリティ
- 最小限の権限（`storage`のみ）
- ホスト権限: Google Calendarのみ
- 外部接続: calcheckr.comのみ
- HTTPS必須

### コード変更時の考慮点
1. **圧縮済みコード**: すべてのJSファイルは既に圧縮済み。変更する場合は読みやすさを犠牲にする
2. **バックエンド依存**: APIエンドポイントとの密結合。変更時は互換性に注意
3. **ストレージキー**: 既存のストレージキーを変更すると既存ユーザーに影響
4. **メッセージアクション名**: content script/popup/backgroundで一貫性が必要

### デバッグのヒント
- Sentry を有効化してエラーを追跡
- `chrome.storage.local.get(null, console.log)` で全ストレージ確認
- Background のログは Service Worker コンソールで確認
- Content script のログは calendar.google.com のDevToolsで確認

## Gemini CLI 連携

### トリガー
ユーザーが「Geminiと相談しながら進めて」（または類似表現）とリクエストした場合、Claude は Gemini CLI と協業します。

### 協業時の Claude の役割
- **批判的評価者**: Gemini の提案を鵜呑みにせず、必ず検証・評価する
- **統合責任者**: 複数の視点を統合し、最終判断を行う
- **品質管理者**: 実装の実現可能性、保守性、パフォーマンスを評価

### 協業ワークフロー
1. **PROMPT 準備**: 最新の要件と議論要約を `$PROMPT` に格納
2. **Gemini 呼び出し**:
   ```bash
   gemini <<EOF
   $PROMPT

   重要：以下の観点で複数の選択肢を提示してください：
   - 長所と短所を明確に
   - トレードオフを具体的に
   - 実装難易度の評価
   EOF
   ```
3. **出力形式**:
   ```md
   **Gemini ➜**
   <Gemini からの応答>

   **Claude ➜**
   <評価フレームワークに基づく分析>
   ```

### 📊 Claude の評価フレームワーク
**Claude ➜** セクションは必ず以下の構造に従う：

```
## Gemini提案の評価
✅ **採用可能な要素**: [具体的な良い点]
⚠️ **技術的懸念**: [実装上の問題点やリスク]
🔄 **Claude の代替案**: [独自の第3の選択肢]

## 最終判断
- **採用方針**: [Gemini案/Claude案/折衷案]
- **根拠**: [なぜその判断に至ったか]
- **実装計画**: [具体的な次のステップ]
```

### ⚡ 鵜呑み防止ルール
1. **Gemini の提案をそのまま採用することは禁止**
2. **必ず技術的検証を行う**
3. **独自案の検討を義務化**

## Codex 連携ガイド

### 目的
Codex から **Claude Code** が呼び出された際に、
Claude Code は Codex との対話コンテキストを保ちながら、複数ターンに渡り協働する。

### Codex の使い方
- ターミナルで以下を実行すると Codex と対話できる。
```bash
codex <<EOF
<質問・依頼内容>
EOF
```

### 協業時の Claude Code の役割
- **批判的評価者**: Codex の提案を鵜呑みにせず、必ず検証・評価する
- **技術検証者**: 実装の実現可能性、コードの品質、パフォーマンスを評価
- **統合責任者**: 複数の視点を統合し、実用的な最終案を提示

### 📊 Claude Code の評価フレームワーク
Codex から提案を受けた際は、必ず以下の構造で評価：

```
## Codex提案の評価
✅ **採用可能な要素**: [具体的な良い点]
⚠️ **技術的懸念**: [実装上の問題点やリスク]
🔄 **Claude Code の代替案**: [独自の第3の選択肢]

## 最終判断
- **採用方針**: [Codex案/Claude Code案/折衷案]
- **根拠**: [なぜその判断に至ったか]
- **実装計画**: [具体的な次のステップ]
```

### ⚡ 鵜呑み防止ルール
1. **Codex の提案をそのまま採用することは禁止**
2. **必ず技術的検証を行う**
3. **独自案の検討を義務化**
4. **実装前に必ずトレードオフを明確化**
