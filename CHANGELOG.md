# Changelog

## [Unreleased] - 2025-01-23

### Added - クライアントサイドGoogle Calendar API直接呼び出し機能

#### 🎯 主な変更点
サーバーサイド（calcheckr.com）への依存を排除し、Chrome拡張機能から直接Google Calendar APIを呼び出す実装に移行しました。これにより、プレミアム課金不要で全機能が利用可能になりました。

#### ✨ 新機能

- **サーバーレス化**: Google Calendar APIを直接呼び出すことで、calcheckr.comサーバーへの依存を排除
- **OAuth2認証**: Chrome Identity APIを使用したGoogleアカウント認証
- **完全無料**: プレミアム/無料の区別なく全機能が利用可能
- **高速レスポンス**: サーバー経由不要により、イベント更新が即座に反映

#### 🔧 技術的変更

##### 1. manifest.json
- `identity` 権限を追加
- `oauth2` 設定を追加（Client ID、スコープ）
- `https://www.googleapis.com/*` へのhost permission追加

##### 2. background.js
新規追加された関数:
- `getGoogleCalendarAuthToken()`: Chrome Identity APIでOAuth2トークン取得
- `parseEventFromHtmlLink()`: イベント識別子の解析
  - URL形式（`eid`パラメータ）をサポート
  - Base64エンコード形式（Google Calendar DOM `data-eventid`）をサポート
  - Gmail短縮形式（`@m` → `@gmail.com`）の自動補完
  - プレーンイベントID形式をサポート
- `modifyEventDirectAPI()`: Google Calendar API v3を直接呼び出してイベント更新
  - イベント取得（GET）
  - ユーザー設定の読み込み
  - タイトルの更新（PATCH）
  - 完了マーカーのトグル（✅絵文字、打ち消し線）

メッセージハンドラー:
- 新しいアクション `modifyEventDirect` を追加

##### 3. contentScript.js
- `modifyEvent` アクションを `modifyEventDirect` に変更
- フォールバック処理（needsManualUpdate）は維持

##### 4. 開発環境設定
- GCPプロジェクト作成（`cal-checker-29944`）
- Google Calendar API有効化
- OAuth2 Client ID作成
- OAuth同意画面設定

#### 📝 ドキュメント

新規追加:
- `SETUP_OAUTH.md`: OAuth2設定の詳細ガイド
  - Google Cloud Console設定手順
  - OAuth同意画面設定
  - Chrome拡張機能ID取得方法
  - トラブルシューティング

更新:
- `CLAUDE.md`: プロジェクト概要とアーキテクチャ情報

#### 🐛 バグ修正

1. **イベント識別子のパース処理**
   - Base64デコード処理を追加
   - Gmail短縮形式（`@m`）を正しい形式（`@gmail.com`）に補完
   - 複数の形式をフォールバックでサポート

2. **カレンダーID取得**
   - Google Calendar DOMの`data-eventid`属性からカレンダーIDを正しく抽出
   - プライマリカレンダー以外のカレンダーにも対応

#### 🔒 セキュリティ

- OAuth2フローによる安全な認証
- Chrome Identity APIを使用した安全なトークン管理
- スコープは `https://www.googleapis.com/auth/calendar.events` のみに制限

#### 📊 パフォーマンス

- サーバーラウンドトリップ排除により、レスポンス時間が大幅に改善
- ネットワークホップ削減（ブラウザ → Google Calendar API 直接）

#### ⚙️ 設定要件

開発者向け:
1. Google Cloud Consoleでプロジェクト作成
2. Google Calendar API有効化
3. OAuth2 Client ID作成（Chrome拡張機能用）
4. manifest.jsonにClient ID設定

ユーザー向け:
- 初回利用時にGoogleアカウント認証が必要
- `https://www.googleapis.com/auth/calendar.events` スコープの許可が必要

#### 🎨 UI/UX

変更なし（既存のUIをそのまま維持）

#### 🧪 テスト

- ✅ Base64デコード処理の検証
- ✅ Gmail短縮形式の補完処理の検証
- ✅ イベント更新機能の動作確認
- ✅ OAuth認証フローの検証

#### 📦 依存関係

追加:
- Google Calendar API v3
- Chrome Identity API

削除:
- calcheckr.comサーバーへの依存（オプションとして維持）

#### 🚀 デプロイ

1. Chrome拡張機能をリロード
2. 初回利用時にOAuth認証を実施
3. Google Calendarでイベントをクリック→✅ボタンで動作確認

#### 🔄 後方互換性

- 既存のサーバー経由の処理（`modifyEvent`）も維持
- `modifyEventDirect`と`modifyEvent`の両方が利用可能
- 段階的な移行が可能

---

## 以前のバージョン

### [2.0.1] - 以前
- 既存機能（calcheckr.comサーバー経由）

---

## 移行ガイド

### サーバー版からクライアント版への移行

1. **OAuth2設定**
   - `SETUP_OAUTH.md`の手順に従ってOAuth2 Client IDを取得
   - `manifest.json`にClient IDを設定

2. **拡張機能のリロード**
   - `chrome://extensions/`を開く
   - 「再読み込み」ボタンをクリック

3. **初回認証**
   - Google Calendarでイベントをクリック
   - ✅ボタンをクリック
   - OAuth認証ダイアログでGoogleアカウントを選択
   - 権限を許可

4. **動作確認**
   - イベントタイトルに✅が追加されることを確認
   - ページをリロードして変更が反映されていることを確認

---

## 既知の問題

- Google Workspaceアカウントで`@m`以外の短縮形式が使われる場合、手動でparseEventFromHtmlLink関数の修正が必要な可能性があります

## 今後の予定

- [ ] Google Workspaceアカウントの完全サポート
- [ ] エラーハンドリングの改善
- [ ] オフライン対応
- [ ] 複数カレンダーの同時操作サポート
