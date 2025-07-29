# Hospital CRM - 技術要件定義書

**プロジェクト**: 医療ツーリズム向けCRMシステム  
**フェーズ**: 実装フェーズ  
**作成日**: 2025年7月29日  
**バージョン**: v1.0  

---

## 1. 技術スタック

### フロントエンド
- **フレームワーク**: React 18+ with TypeScript
- **UIライブラリ**: Tailwind CSS + Heroicons
- **状態管理**: React Context API / Zustand
- **ルーティング**: React Router v6
- **フォーム**: React Hook Form + Zod validation
- **HTTP クライアント**: Axios
- **多言語化**: react-i18next

### バックエンド
- **ランタイム**: Node.js 18+ LTS
- **フレームワーク**: Express.js with TypeScript
- **認証**: JWT + bcrypt
- **ORM**: Prisma
- **バリデーション**: Zod
- **API文書**: Swagger/OpenAPI 3.0
- **ログ**: Winston

### データベース
- **メイン**: PostgreSQL 15+
- **キャッシュ**: Redis（セッション・キャッシュ用）
- **ファイルストレージ**: AWS S3 / Azure Blob Storage

### 開発・デプロイメント
- **コンテナ**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **インフラ**: AWS / Azure
- **監視**: Application Insights / CloudWatch
- **環境管理**: dotenv

---

## 2. システム アーキテクチャ

### 全体構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (React App)   │◄──►│   (Express API) │◄──►│   (PostgreSQL)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                       ┌─────────────────┐
                       │   File Storage  │
                       │   (S3/Blob)     │
                       └─────────────────┘
```

### レイヤー構成
```
Frontend:
├── pages/           # ページコンポーネント
├── components/      # 再利用可能コンポーネント
├── hooks/          # カスタムフック
├── services/       # API呼び出し
├── types/          # TypeScript型定義
└── utils/          # ユーティリティ

Backend:
├── controllers/    # リクエスト処理
├── services/      # ビジネスロジック
├── repositories/  # データアクセス層
├── middleware/    # 認証・バリデーション
├── routes/        # ルーティング
└── types/         # TypeScript型定義
```

---

## 3. データベース設計

### 主要テーブル設計

#### patients (患者情報)
```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  first_name_kana VARCHAR(100),
  last_name_kana VARCHAR(100),
  date_of_birth DATE NOT NULL,
  gender VARCHAR(10),
  nationality VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(255),
  address JSONB, -- 多言語対応住所
  insurance_info JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### medical_records (診療記録)
```sql
CREATE TABLE medical_records (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  doctor_id UUID REFERENCES staff(id),
  visit_date TIMESTAMP NOT NULL,
  diagnosis TEXT,
  treatment TEXT,
  medications JSONB,
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### appointments (予約)
```sql
CREATE TABLE appointments (
  id UUID PRIMARY KEY,
  patient_id UUID REFERENCES patients(id),
  staff_id UUID REFERENCES staff(id),
  appointment_date TIMESTAMP NOT NULL,
  duration INTEGER DEFAULT 30, -- 分単位
  type VARCHAR(50), -- 診察、検査、相談など
  status VARCHAR(20) DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### staff (スタッフ)
```sql
CREATE TABLE staff (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(50) NOT NULL, -- doctor, nurse, admin
  department VARCHAR(100),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. API設計

### 認証
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

### 患者管理
```
GET    /api/patients              # 患者一覧
POST   /api/patients              # 患者登録
GET    /api/patients/:id          # 患者詳細
PUT    /api/patients/:id          # 患者情報更新
DELETE /api/patients/:id          # 患者削除
```

### 診療記録
```
GET    /api/patients/:id/records  # 患者の診療記録一覧
POST   /api/patients/:id/records  # 診療記録作成
PUT    /api/records/:id           # 診療記録更新
```

### 予約管理
```
GET    /api/appointments          # 予約一覧
POST   /api/appointments          # 予約作成
PUT    /api/appointments/:id      # 予約更新
DELETE /api/appointments/:id      # 予約キャンセル
```

---

## 5. セキュリティ要件

### 認証・認可
- JWT トークンベース認証
- リフレッシュトークン機能
- ロールベースアクセス制御（RBAC）
- セッション管理（Redis）

### データ保護
- パスワードハッシュ化（bcrypt、salt rounds: 12）
- 患者情報の暗号化（AES-256）
- HTTPS必須
- CORS設定

### 監査ログ
- 患者情報アクセスログ
- データ変更履歴
- ログイン・ログアウト記録

---

## 6. パフォーマンス要件

### レスポンス時間
- API レスポンス: < 500ms（95パーセンタイル）
- ページ読み込み: < 3秒
- データベースクエリ: < 100ms

### スケーラビリティ
- 同時ユーザー数: 100名
- 患者データ: 10,000件まで対応
- 年間診療記録: 50,000件まで対応

### 可用性
- システム稼働率: 99.5%以上
- データバックアップ: 日次自動実行
- 障害復旧時間: < 4時間

---

## 7. 多言語対応

### サポート言語
- 日本語（メイン）
- 英語
- 中国語（簡体字・繁体字）
- 韓国語

### 実装方式
- i18next による多言語リソース管理
- データベース内多言語データはJSONB形式で格納
- URL パラメータによる言語切り替え

---

## 8. 開発環境

### ローカル開発
```bash
# 必要なソフトウェア
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL 15+
- Redis

# 環境変数
DATABASE_URL=postgresql://user:pass@localhost:5432/hospital_crm
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
```

### 開発ワークフロー
1. 機能ブランチでの開発
2. Pull Request作成
3. コードレビュー
4. 自動テスト実行
5. マージ・デプロイ

---

## 9. テスト要件

### テスト種別
- **単体テスト**: Jest + React Testing Library
- **統合テスト**: Supertest（API）
- **E2Eテスト**: Playwright（主要フロー）
- **パフォーマンステスト**: k6

### カバレッジ目標
- コードカバレッジ: 80%以上
- 主要機能のE2Eテスト: 100%

---

## 10. デプロイメント

### 本番環境
- **インフラ**: AWS ECS / Azure Container Instances
- **データベース**: Amazon RDS / Azure Database
- **CDN**: CloudFront / Azure CDN
- **SSL証明書**: Let's Encrypt / Azure Key Vault

### CI/CD パイプライン
```yaml
# GitHub Actions example
name: Deploy to Production
on:
  push:
    branches: [main]
steps:
  - Build & Test
  - Security Scan
  - Build Docker Images
  - Deploy to Staging
  - E2E Tests
  - Deploy to Production
```

---

## 11. 監視・ログ

### アプリケーション監視
- ヘルスチェックエンドポイント
- エラー率・レスポンス時間監視
- リソース使用率監視

### ログ管理
- 構造化ログ（JSON形式）
- ログレベル分離
- 個人情報マスキング

---

**次のステップ**: 機能仕様書の作成