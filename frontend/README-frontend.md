# Hospital CRM Frontend

医療ツーリズム向けCRMシステムのフロントエンド実装

## 技術スタック

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **UI Components**: Headless UI
- **State Management**: Zustand (予定)
- **API Client**: TanStack Query (予定)
- **Forms**: React Hook Form + Zod (予定)

## デザインシステム

- **カラーパレット**: モノクロベース + 緑アクセント（#10B981）
- **フォント**: Inter + Noto Sans JP
- **アイコン**: Lucide Icons（統一されたストロークデザイン）

## プロジェクト構造

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx           # ダッシュボード
│   ├── patients/          # 患者管理
│   ├── cases/             # 案件管理
│   └── globals.css        # グローバルスタイル
├── components/
│   ├── ui/                # 基本UIコンポーネント
│   ├── layout/            # レイアウトコンポーネント
│   ├── forms/             # フォームコンポーネント
│   └── features/          # 機能別コンポーネント
├── lib/                   # ユーティリティ関数
├── hooks/                 # カスタムフック
├── store/                 # 状態管理
├── types/                 # TypeScript型定義
└── styles/               # スタイル関連
```

## セットアップ方法

### 1. 依存関係のインストール
```bash
npm install
```

### 2. 環境変数の設定
```bash
cp .env.example .env.local
```

必要に応じて `.env.local` の値を編集してください。

### 3. 開発サーバーの起動
```bash
npm run dev
```

アプリケーションは http://localhost:3000 で起動します。

## 利用可能なスクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - 本番ビルド
- `npm run start` - 本番サーバー起動
- `npm run lint` - ESLintによるコード検査

## 実装済み機能

### ✅ 完了済み
- [x] 基本的なプロジェクト設定
- [x] デザインシステムの実装
- [x] レイアウトコンポーネント（Header, Sidebar, Layout）
- [x] 基本UIコンポーネント（Button, Input, Card）
- [x] ダッシュボードページ
- [x] 患者管理ページ
- [x] 案件管理ページ
- [x] Lucide Iconsの統合
- [x] Tailwind CSSカスタム設定
- [x] TypeScript型定義

### 🚧 次の実装予定
- [ ] 認証システム
- [ ] フォーム処理とバリデーション
- [ ] API連携
- [ ] 状態管理の実装
- [ ] ファイルアップロード機能
- [ ] 通知システム
- [ ] 多言語対応

## デザイン仕様

### カラーパレット
- **プライマリ**: グリーン（#10B981, #059669）
- **グレースケール**: #F9FAFB から #111827
- **ステータスカラー**: 
  - 新規: ブルー（#3B82F6）
  - 審査中: オレンジ（#F59E0B）
  - 確定: グリーン（#10B981）
  - 完了: パープル（#8B5CF6）

### アイコン使用方針
- **サイズ**: 16px（小）、20px（標準）、24px（大）
- **ストローク**: 1.5px統一
- **色**: グレー600（デフォルト）、グリーン500（アクティブ）

## 貢献方法

1. フィーチャーブランチを作成
2. 変更を実装
3. コードレビューを実施
4. メインブランチにマージ

## ライセンス

株式会社yolidoli - 医療ツーリズムCRMシステム