# Hospital CRM - Monorepo

病院CRMシステムのモノレポ構成です。

## プロジェクト構成

```
hospital-crm/
├── frontend/          # Next.js フロントエンド
├── backend/           # Express API サーバー
└── docs/             # ドキュメント
```

## 開発環境セットアップ

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev          # http://localhost:3000
```

### Backend (Express)

```bash
cd backend
npm install
cp .env.example .env  # 環境変数を設定
npm run dev          # http://localhost:3001
```

### ヘルスチェック

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/health

## Vercelデプロイ

### フロントエンド
1. Vercelで新しいプロジェクトを作成
2. Root Directory: `app-development/hospital-crm/frontend`
3. Build Command: `npm run build`
4. Output Directory: `.next`

### バックエンド  
1. Vercelで新しいプロジェクトを作成
2. Root Directory: `app-development/hospital-crm/backend`
3. Build Command: `npm run vercel-build`
4. Output Directory: `dist`

## 技術スタック

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Zustand

### Backend
- Express.js
- TypeScript
- CORS
- Helmet
- dotenv

## API エンドポイント

### 基本
- `GET /health` - ヘルスチェック
- `GET /api` - API情報

### 今後追加予定
- `POST /api/auth/login` - ログイン
- `GET /api/patients` - 患者一覧
- `GET /api/cases` - 症例一覧
