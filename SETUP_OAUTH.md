# Google Calendar API OAuth2 設定ガイド

この拡張機能は、Google Calendar APIに直接アクセスしてイベントを更新します。
セットアップには Google Cloud Console で OAuth2 クライアントIDを取得する必要があります。

## 前提条件

- Googleアカウント
- Google Cloud Console へのアクセス権限

## セットアップ手順

### 1. Google Cloud Console でプロジェクトを作成

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. 新しいプロジェクトを作成（または既存のプロジェクトを選択）
3. プロジェクト名を入力（例: "Calendar Event Checker"）

### 2. Google Calendar API を有効化

1. 左側のメニューから「APIとサービス」→「ライブラリ」を選択
2. 検索ボックスに「Google Calendar API」と入力
3. 「Google Calendar API」を選択
4. 「有効にする」ボタンをクリック

### 3. OAuth 同意画面を設定

1. 左側のメニューから「APIとサービス」→「OAuth 同意画面」を選択
2. ユーザータイプで「外部」を選択（個人利用の場合）
3. 「作成」をクリック
4. 必須項目を入力:
   - アプリ名: `Google Calendar Event Checker`
   - ユーザーサポートメール: あなたのメールアドレス
   - デベロッパーの連絡先情報: あなたのメールアドレス
5. 「保存して次へ」をクリック
6. スコープの設定:
   - 「スコープを追加または削除」をクリック
   - `https://www.googleapis.com/auth/calendar.events` を検索して選択
   - 「更新」をクリック
7. 「保存して次へ」をクリック
8. テストユーザーを追加（開発中は自分のGoogleアカウントを追加）
9. 「保存して次へ」をクリック

### 4. OAuth2 クライアントIDを作成

1. 左側のメニューから「APIとサービス」→「認証情報」を選択
2. 上部の「認証情報を作成」→「OAuth クライアント ID」をクリック
3. アプリケーションの種類で「Chrome アプリ」を選択
   - アプリケーションID: Chrome拡張機能のID

   **重要:** Chrome拡張機能のIDは、拡張機能を一度Chromeに読み込んだ後に確認できます

   #### 拡張機能IDの確認方法:
   1. Chrome で `chrome://extensions/` を開く
   2. 右上の「デベロッパーモード」を有効にする
   3. 「パッケージ化されていない拡張機能を読み込む」をクリック
   4. このプロジェクトのディレクトリを選択
   5. 読み込まれた拡張機能のカードに表示される **ID** をコピー

4. OAuth クライアントIDの作成に戻る:
   - アプリケーションID: コピーしたIDを貼り付け
   - 「作成」をクリック

5. 作成されたクライアントIDをコピー
   - 形式: `XXXXXXXXXXXX-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`

### 5. manifest.json を更新

1. プロジェクトの `manifest.json` ファイルを開く
2. `oauth2.client_id` の値を、コピーしたクライアントIDに置き換える:

```json
{
  ...
  "oauth2": {
    "client_id": "あなたのクライアントID.apps.googleusercontent.com",
    "scopes": [
      "https://www.googleapis.com/auth/calendar.events"
    ]
  },
  ...
}
```

### 6. 拡張機能をリロード

1. Chrome で `chrome://extensions/` を開く
2. 拡張機能カードの「再読み込み」ボタンをクリック
3. エラーがないことを確認

## テスト

1. Google Calendar を開く: https://calendar.google.com
2. カレンダーイベントをクリック
3. ✅ ボタンをクリック
4. 初回は OAuth 認証ダイアログが表示されます
5. Googleアカウントでサインインし、権限を許可
6. イベントタイトルに ✅ が追加されることを確認

## トラブルシューティング

### エラー: "OAuth2 client_id is invalid"

- manifest.json の client_id が正しく設定されているか確認
- クライアントIDが Chrome拡張機能用（Chrome アプリ）として作成されているか確認

### エラー: "Access denied"

- OAuth 同意画面でテストユーザーとして自分のアカウントが追加されているか確認
- スコープ `https://www.googleapis.com/auth/calendar.events` が設定されているか確認

### 認証ダイアログが表示されない

- Chrome のコンソール（F12）でエラーメッセージを確認
- background.js のログを確認（`chrome://extensions/` → 拡張機能カード → 「service worker」リンク）

### イベントが更新されない

- background.js のログで `[CalAPI]` で始まるログを確認
- Google Calendar API が有効化されているか確認
- イベントの所有者があなたのGoogleアカウントであるか確認

## セキュリティ上の注意

- **client_id は公開しても問題ありません**（拡張機能に含まれる設計です）
- ただし、本番環境で公開する場合は、OAuth 同意画面を「公開」に設定する必要があります
- 個人利用の場合は「テスト」モードのままで問題ありません

## 参考リンク

- [Google Calendar API ドキュメント](https://developers.google.com/calendar/api/guides/overview)
- [Chrome Extension Identity API](https://developer.chrome.com/docs/extensions/reference/identity/)
- [OAuth 2.0 for Chrome Extensions](https://developer.chrome.com/docs/extensions/mv3/tut_oauth/)
