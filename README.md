# Google Calendar Event Checker

Chrome拡張機能でGoogleカレンダーのイベントを完了マーク付きで管理できます。サーバーレスでGoogle Calendar APIを直接呼び出し、プレミアム課金不要で全機能が利用可能です。

## 特徴

- ✅ **サーバーレス**: Google Calendar APIを直接呼び出し
- 🔐 **安全な認証**: Chrome Identity APIによるOAuth2認証
- 💰 **完全無料**: プレミアム課金不要
- ⚡ **高速**: サーバー経由不要で即座に反映
- 🎨 **カスタマイズ可能**: 絵文字、打ち消し線、説明欄への記録など

## 機能

### イベント完了マーク

- **✅ チェックマーク絵文字**: イベントタイトルの先頭に追加
- **打ち消し線効果**: タイトル全体に s̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶ 効果
- **❌ クロスマーク**: 代替マーカー
- **完了日時記録**: 説明欄に完了日時を自動記録
- **元のタイトル保存**: 検索用に元のタイトルを説明欄に保存

### ワンクリック操作

Google Calendarのイベント詳細ダイアログに✅ボタンが表示され、クリックするだけでイベントを完了マークできます。

## セットアップ

### 1. 前提条件

- Google Chrome ブラウザ
- Googleアカウント
- Google Cloud Console アクセス権限

### 2. OAuth2設定

詳細な手順は [SETUP_OAUTH.md](SETUP_OAUTH.md) を参照してください。

**簡単な手順:**

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクト作成
2. Google Calendar API を有効化
3. OAuth 同意画面を設定
4. Chrome拡張機能用のOAuth2クライアントIDを作成
5. `manifest.json` に Client ID を設定

### 3. インストール

1. このリポジトリをクローン:
   ```bash
   git clone https://github.com/rumos-automatic/google-calendar-event-checker.git
   cd google-calendar-event-checker
   ```

2. `manifest.json` の `oauth2.client_id` を設定:
   ```json
   {
     "oauth2": {
       "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
       "scopes": ["https://www.googleapis.com/auth/calendar.events"]
     }
   }
   ```

3. Chromeで拡張機能を読み込み:
   - `chrome://extensions/` を開く
   - 「デベロッパーモード」を有効化
   - 「パッケージ化されていない拡張機能を読み込む」をクリック
   - このディレクトリを選択

### 4. 初回認証

1. [Google Calendar](https://calendar.google.com) を開く
2. イベントをクリック
3. ✅ボタンをクリック
4. OAuth認証ダイアログでGoogleアカウントを選択
5. 権限を許可

## 使い方

1. Google Calendarでイベントをクリック
2. イベント詳細ダイアログに表示される✅ボタンをクリック
3. イベントタイトルに✅が追加される（設定による）
4. もう一度クリックすると完了マークが解除される

## オプション設定

拡張機能のオプション画面（右クリック → オプション）で以下を設定可能:

- ✅ チェックマーク絵文字を追加
- 📝 完了日時を説明欄に記録
- 📋 元のタイトルを説明欄に保存
- ~~打ち消し線~~ 効果を適用
- ❌ クロスマークボタンを追加
- 📊 エラー報告を有効化

## 技術スタック

- **Chrome Extensions Manifest V3**
- **Google Calendar API v3**
- **Chrome Identity API** (OAuth2)
- **JavaScript** (ES6+)

## アーキテクチャ

### コンポーネント

1. **background.js**: Service Worker
   - OAuth2トークン管理
   - Google Calendar API呼び出し
   - イベント識別子の解析

2. **contentScript.js**: Google Calendarページへの注入
   - UIボタンの追加
   - イベント詳細ダイアログの検出
   - ユーザーインタラクションのハンドリング

3. **popup.js/popup.html**: 拡張機能ポップアップUI
   - イベント一覧表示
   - 設定画面へのリンク

4. **options.js/options.html**: 設定画面
   - ユーザー設定の管理

### データフロー

```
ユーザー
  ↓ (クリック)
contentScript.js
  ↓ (chrome.runtime.sendMessage)
background.js
  ↓ (chrome.identity.getAuthToken)
OAuth2トークン取得
  ↓
Google Calendar API
  ↓ (イベント更新)
完了
  ↓ (レスポンス)
contentScript.js
  ↓ (UI更新)
ユーザー
```

## トラブルシューティング

### エラー: "OAuth2 client_id is invalid"

- `manifest.json` の `client_id` が正しく設定されているか確認
- クライアントIDがChrome拡張機能用として作成されているか確認

### エラー: "Access denied"

- OAuth 同意画面でテストユーザーとして追加されているか確認
- スコープ `https://www.googleapis.com/auth/calendar.events` が設定されているか確認

### イベントが更新されない

- background.js のログを確認 (`chrome://extensions/` → service worker)
- `[CalAPI]` で始まるログでエラーを確認
- イベントの所有者があなたのGoogleアカウントか確認

## 開発

### ディレクトリ構造

```
.
├── background.js          # Service Worker
├── contentScript.js       # Content Script
├── popup.html/popup.js    # ポップアップUI
├── options.html/options.js # 設定画面
├── manifest.json          # 拡張機能マニフェスト
├── icons/                 # アイコン画像
├── SETUP_OAUTH.md        # OAuth2設定ガイド
├── CHANGELOG.md          # 変更履歴
└── README.md             # このファイル
```

### デバッグ

- **contentScript.js**: Google Calendarページのコンソール (F12)
- **background.js**: `chrome://extensions/` → service worker → Console
- **popup.js**: ポップアップを右クリック → 検証

## セキュリティ

- OAuth2フローによる安全な認証
- Chrome Identity APIを使用した安全なトークン管理
- スコープは `calendar.events` のみに制限
- Client IDは公開されても問題なし（設計上）

## ライセンス

[MIT License](LICENSE)

## 貢献

Issue、Pull Requestを歓迎します！

## 変更履歴

詳細は [CHANGELOG.md](CHANGELOG.md) を参照してください。

## クレジット

🤖 Generated with [Claude Code](https://claude.com/claude-code)

---

**注意**: この拡張機能は個人利用・開発用です。本番環境で公開する場合は、OAuth 同意画面を「公開」に設定する必要があります。
