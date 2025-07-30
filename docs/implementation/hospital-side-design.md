# 病院側システム実装設計書

## 概要
医療ツーリズムCRMシステムの病院側機能の実装設計書。エージェント側のフローを考慮し、病院スタッフが効率的に案件を管理できるシステムを構築する。

## システム全体図

```
┌─────────────────────────┐     ┌─────────────────────────┐
│   エージェント側        │     │     病院側システム       │
│  (WeChat Mini App)     │     │    (Next.js + API)      │
├─────────────────────────┤     ├─────────────────────────┤
│ - 患者情報入力         │ --> │ - 新規案件受信・通知    │
│ - 書類アップロード     │     │ - 案件審査・判断        │
│ - 進捗確認             │ <-- │ - 追加資料要求          │
│ - 通知受信             │     │ - 見積作成              │
└─────────────────────────┘     │ - 診療管理              │
                                │ - 請求管理              │
                                └─────────────────────────┘
```

## 主要機能一覧

### 1. 案件管理機能
- **新規案件受信・通知**
  - WeChat/メール通知受信
  - 案件一覧表示（未対応/対応中/完了）
  - 優先度・緊急度表示
  
- **案件審査機能**
  - 患者情報閲覧（自動翻訳済み）
  - 医療記録・検査結果表示
  - 添付ファイル閲覧
  - 受け入れ可否判断
  
- **追加資料要求**
  - 不足情報リスト作成
  - エージェントへの自動通知
  - 追加資料受信・確認

### 2. エージェント管理機能
- エージェント登録・管理
- 契約情報・手数料率設定
- 実績・評価管理
- コミュニケーション履歴

### 3. 診療管理機能
- 予約スケジュール管理
- 診療記録作成
- 検査結果登録
- 診断書発行

### 4. 請求管理機能
- 診療費登録
- 手数料自動計算
- 月次請求書自動生成
- 支払い状況管理

## データモデル設計

### Cases（案件）
```typescript
interface Case {
  id: string;
  agentId: string;
  patientInfo: {
    name: string;
    nameJa: string; // 自動翻訳後
    age: number;
    gender: string;
    nationality: string;
    passportNumber: string;
    wechatId?: string;
  };
  medicalInfo: {
    department: string;
    chiefComplaint: string;
    chiefComplaintJa: string; // 自動翻訳後
    medicalHistory: string;
    medicalHistoryJa: string; // 自動翻訳後
    allergies: string[];
    attachments: Attachment[];
  };
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected' | 'additional_info_required' | 'scheduled' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reviewHistory: ReviewHistory[];
  quote?: Quote;
  appointment?: Appointment;
  billing?: Billing;
  createdAt: Date;
  updatedAt: Date;
}

interface Attachment {
  id: string;
  filename: string;
  fileType: string;
  url: string;
  uploadedAt: Date;
}

interface ReviewHistory {
  reviewerId: string;
  action: string;
  comment?: string;
  timestamp: Date;
}
```

### Agents（エージェント）
```typescript
interface Agent {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  wechatId: string;
  contractInfo: {
    commissionRate: number; // 手数料率（%）
    contractStartDate: Date;
    contractEndDate?: Date;
  };
  performance: {
    totalCases: number;
    completedCases: number;
    totalRevenue: number;
    averageRating: number;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
}
```

### Billing（請求）
```typescript
interface Billing {
  id: string;
  caseId: string;
  medicalFee: number;
  insuranceCovered: number;
  commission: number; // (medicalFee - insuranceCovered) * commissionRate
  paymentStatus: 'pending' | 'invoiced' | 'paid';
  invoiceDate?: Date;
  paymentDate?: Date;
}
```

## API設計

### 案件管理API
```typescript
// 新規案件受信
POST /api/cases/receive
{
  agentId: string;
  patientInfo: {...};
  medicalInfo: {...};
}

// 案件一覧取得
GET /api/cases?status=pending&priority=high

// 案件詳細取得
GET /api/cases/:id

// 案件審査結果登録
PUT /api/cases/:id/review
{
  decision: 'accepted' | 'rejected' | 'additional_info_required';
  comment?: string;
  requiredDocuments?: string[];
  quote?: {...};
}

// 追加資料受信
POST /api/cases/:id/attachments
```

### 通知API
```typescript
// WeChat通知送信
POST /api/notifications/wechat
{
  agentId: string;
  type: 'case_reviewed' | 'info_required' | 'appointment_confirmed';
  caseId: string;
  message: string;
}
```

### 請求管理API
```typescript
// 診療完了登録
POST /api/cases/:id/complete
{
  medicalFee: number;
  insuranceCovered: number;
}

// 月次請求書生成
GET /api/billing/monthly-invoice?year=2025&month=7
```

## 画面設計

### 1. ダッシュボード
- 本日の予約一覧
- 未対応案件数（緊急度別）
- 月間実績グラフ
- 最新の通知

### 2. 案件一覧画面
```
┌─────────────────────────────────────────────────┐
│ 案件管理                          [+ フィルター] │
│                                                 │
│ ┌─────────────────────────────────────────────┐ │
│ │ 🔴 緊急 │ 田中太郎 │ 心臓手術 │ ABC社 │ 2h前│ │
│ ├─────────────────────────────────────────────┤ │
│ │ 🟡 通常 │ 李明    │ 健康診断 │ XYZ社 │ 5h前│ │
│ ├─────────────────────────────────────────────┤ │
│ │ ✅ 対応済│ 王芳    │ 歯科治療 │ DEF社 │ 昨日│ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 3. 案件詳細・審査画面
```
┌─────────────────────────────────────────────────┐
│ 案件詳細 - 田中太郎          [審査] [チャット] │
│                                                 │
│ ┌─基本情報─────────────────────────────────────┐ │
│ │ 患者名: 田中太郎 (原文: 田中太郎)             │ │
│ │ 年齢: 55歳  性別: 男性  国籍: 日本           │ │
│ │ エージェント: ABC医療ツーリズム社             │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─医療情報─────────────────────────────────────┐ │
│ │ 希望診療科: 心臓外科                         │ │
│ │ 主訴: 胸部の痛み（原文: 胸痛）               │ │
│ │ 既往歴: 高血圧、糖尿病                       │ │
│ │ 添付: [心電図.pdf] [血液検査.pdf]            │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│ ┌─審査アクション───────────────────────────────┐ │
│ │ ○ 受け入れ可  ○ 情報不足  ○ 受け入れ不可    │ │
│ │ [見積作成] [追加資料要求] [コメント入力]      │ │
│ └─────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

### 4. エージェント管理画面
- エージェント一覧
- 実績・評価表示
- 契約情報管理
- コミュニケーション履歴

### 5. 請求管理画面
- 月次請求一覧
- 請求書生成・ダウンロード
- 支払い状況管理
- 売上分析

## 実装優先順位

### Phase 1（必須機能）
1. 案件受信・一覧表示
2. 案件詳細・審査機能
3. WeChat通知連携
4. 基本的な請求管理

### Phase 2（拡張機能）
1. 自動翻訳機能統合
2. エージェント管理
3. 高度な請求書自動生成
4. 分析・レポート機能

### Phase 3（最適化）
1. AI支援による審査サポート
2. 予測分析
3. 多言語対応拡張

## 技術要件

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- React Query（データフェッチング）
- Zustand（状態管理）

### バックエンド
- Express + TypeScript
- PostgreSQL（メインDB）
- Redis（キャッシュ・セッション）
- Bull（ジョブキュー）

### 外部連携
- WeChat API（通知）
- Google Translate API（自動翻訳）
- AWS S3（ファイルストレージ）

## セキュリティ要件
- 患者情報の暗号化
- ロールベースアクセス制御
- 監査ログ
- GDPR/個人情報保護法準拠