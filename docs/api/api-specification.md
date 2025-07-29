# Hospital CRM - API仕様書

**プロジェクト**: 医療ツーリズム向けCRMシステム  
**作成日**: 2025年7月29日  
**バージョン**: v1.0  
**Base URL**: `https://api.hospital-crm.com/v1`

---

## 1. 認証

### 1.1 ログイン
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "doctor@hospital.com",
  "password": "securePassword123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-v4",
      "email": "doctor@hospital.com",
      "firstName": "田中",
      "lastName": "太郎",
      "role": "doctor",
      "department": "内科"
    }
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "メールアドレスまたはパスワードが正しくありません"
  }
}
```

### 1.2 ログアウト
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "message": "ログアウトしました"
}
```

### 1.3 トークンリフレッシュ
```http
POST /auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 1.4 ユーザー情報取得
```http
GET /auth/me
Authorization: Bearer {accessToken}
```

---

## 2. 患者管理 API

### 2.1 患者一覧取得
```http
GET /patients?page=1&limit=25&search=山田&gender=male&ageMin=20&ageMax=65
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `page` (number): ページ番号 (default: 1)
- `limit` (number): 1ページあたりの件数 (default: 25, max: 100)
- `search` (string): 名前・ID・電話番号での検索
- `gender` (string): 性別フィルタ (`male`/`female`)
- `ageMin`, `ageMax` (number): 年齢範囲フィルタ
- `nationality` (string): 国籍フィルタ
- `sortBy` (string): ソート項目 (`createdAt`/`lastName`/`age`)
- `sortOrder` (string): ソート順 (`asc`/`desc`)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "patient-uuid-1",
        "patientId": "P0001",
        "firstName": "太郎",
        "lastName": "山田",
        "firstNameKana": "タロウ",
        "lastNameKana": "ヤマダ",
        "dateOfBirth": "1980-03-15",
        "age": 45,
        "gender": "male",
        "nationality": "Japan",
        "phone": "090-****-5678",
        "email": "yamada@example.com",
        "lastVisit": "2025-07-25T10:30:00Z",
        "status": "active",
        "createdAt": "2025-01-15T09:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 1234,
      "totalPages": 50
    }
  }
}
```

### 2.2 患者詳細取得
```http
GET /patients/{patientId}
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "patient-uuid-1",
    "patientId": "P0001",
    "firstName": "太郎",
    "lastName": "山田",
    "firstNameKana": "タロウ",
    "lastNameKana": "ヤマダ",
    "dateOfBirth": "1980-03-15",
    "age": 45,
    "gender": "male",
    "nationality": "Japan",
    "phone": "090-1234-5678",
    "email": "yamada@example.com",
    "address": {
      "postalCode": "150-0001",
      "prefecture": "東京都",
      "city": "渋谷区",
      "addressLine": "神宮前1-1-1",
      "building": "サンプルビル101"
    },
    "emergencyContact": {
      "name": "山田花子",
      "relationship": "配偶者",
      "phone": "090-1234-5679"
    },
    "insuranceInfo": {
      "insuranceType": "health_insurance",
      "insuranceNumber": "12345678",
      "expiryDate": "2026-03-31"
    },
    "medicalHistory": [
      {
        "condition": "高血圧",
        "diagnosedDate": "2020-05-10",
        "status": "ongoing"
      }
    ],
    "allergies": ["ペニシリン", "エビ"],
    "status": "active",
    "createdAt": "2025-01-15T09:00:00Z",
    "updatedAt": "2025-07-20T14:30:00Z"
  }
}
```

### 2.3 患者登録
```http
POST /patients
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "firstName": "太郎",
  "lastName": "山田",
  "firstNameKana": "タロウ",
  "lastNameKana": "ヤマダ",
  "dateOfBirth": "1980-03-15",
  "gender": "male",
  "nationality": "Japan",
  "phone": "090-1234-5678",
  "email": "yamada@example.com",
  "address": {
    "postalCode": "150-0001",
    "prefecture": "東京都",
    "city": "渋谷区",
    "addressLine": "神宮前1-1-1",
    "building": "サンプルビル101"
  },
  "emergencyContact": {
    "name": "山田花子",
    "relationship": "配偶者",
    "phone": "090-1234-5679"
  },
  "insuranceInfo": {
    "insuranceType": "health_insurance",
    "insuranceNumber": "12345678",
    "expiryDate": "2026-03-31"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "patient-uuid-new",
    "patientId": "P1235",
    "message": "患者が正常に登録されました"
  }
}
```

### 2.4 患者情報更新
```http
PUT /patients/{patientId}
Authorization: Bearer {accessToken}
```

### 2.5 患者削除（論理削除）
```http
DELETE /patients/{patientId}
Authorization: Bearer {accessToken}
```

---

## 3. 診療記録 API

### 3.1 診療記録一覧取得
```http
GET /patients/{patientId}/medical-records?page=1&limit=10
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "records": [
      {
        "id": "record-uuid-1",
        "patientId": "patient-uuid-1",
        "doctorId": "doctor-uuid-1",
        "doctorName": "田中医師",
        "visitDate": "2025-07-25T10:30:00Z",
        "department": "内科",
        "chiefComplaint": "腰痛が続いている",
        "diagnosis": "急性腰痛症 (M54.5)",
        "treatment": "物理療法、安静指導",
        "medications": [
          {
            "name": "ロキソニン錠60mg",
            "dosage": "1日3回食後",
            "duration": "7日間"
          }
        ],
        "nextAppointment": "2025-08-15T14:00:00Z",
        "status": "completed",
        "createdAt": "2025-07-25T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "totalPages": 5
    }
  }
}
```

### 3.2 診療記録詳細取得
```http
GET /medical-records/{recordId}
Authorization: Bearer {accessToken}
```

### 3.3 診療記録作成
```http
POST /patients/{patientId}/medical-records
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "visitDate": "2025-07-29T14:30:00Z",
  "department": "内科",
  "chiefComplaint": "頭痛が続いている",
  "presentIllness": "約3日前から頭痛が続いており...",
  "physicalExamination": "血圧: 130/80, 脈拍: 72/分",
  "diagnosis": "緊張型頭痛 (G44.2)",
  "treatment": "安静、ストレス管理指導",
  "medications": [
    {
      "name": "カロナール錠300mg",
      "dosage": "1日3回食後",
      "duration": "5日間"
    }
  ],
  "notes": "ストレス要因についてカウンセリング推奨",
  "nextAppointment": "2025-08-20T15:00:00Z"
}
```

### 3.4 診療記録更新
```http
PUT /medical-records/{recordId}
Authorization: Bearer {accessToken}
```

---

## 4. 予約管理 API

### 4.1 予約一覧取得
```http
GET /appointments?date=2025-07-29&doctorId=doctor-uuid-1&status=scheduled
Authorization: Bearer {accessToken}
```

**Query Parameters:**
- `date` (string): 特定日の予約 (YYYY-MM-DD)
- `dateFrom`, `dateTo` (string): 期間指定
- `doctorId` (string): 担当医師フィルタ
- `patientId` (string): 患者フィルタ
- `status` (string): ステータスフィルタ (`scheduled`/`completed`/`cancelled`)
- `department` (string): 診療科フィルタ

**Response (200):**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appointment-uuid-1",
        "patientId": "patient-uuid-1",
        "patientName": "山田太郎",
        "doctorId": "doctor-uuid-1",
        "doctorName": "田中医師",
        "appointmentDate": "2025-07-29T14:30:00Z",
        "duration": 30,
        "type": "定期健診",
        "department": "内科",
        "status": "scheduled",
        "notes": "血圧測定希望",
        "createdAt": "2025-07-20T10:00:00Z"
      }
    ],
    "summary": {
      "totalAppointments": 12,
      "scheduled": 8,
      "completed": 3,
      "cancelled": 1
    }
  }
}
```

### 4.2 予約詳細取得
```http
GET /appointments/{appointmentId}
Authorization: Bearer {accessToken}
```

### 4.3 予約作成
```http
POST /appointments
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "patientId": "patient-uuid-1",
  "doctorId": "doctor-uuid-1",
  "appointmentDate": "2025-08-15T14:00:00Z",
  "duration": 30,
  "type": "定期健診",
  "department": "内科",
  "notes": "血圧測定、血液検査"
}
```

### 4.4 予約更新
```http
PUT /appointments/{appointmentId}
Authorization: Bearer {accessToken}
```

### 4.5 予約キャンセル
```http
DELETE /appointments/{appointmentId}
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "reason": "患者都合によるキャンセル"
}
```

---

## 5. ダッシュボード・レポート API

### 5.1 ダッシュボード統計取得
```http
GET /dashboard/stats?period=current_month
Authorization: Bearer {accessToken}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalPatients": 1234,
    "newPatientsThisMonth": 45,
    "appointmentsToday": 12,
    "completedAppointmentsThisMonth": 234,
    "revenue": {
      "thisMonth": 12500000,
      "lastMonth": 11800000,
      "growth": 5.93
    },
    "patientSatisfaction": {
      "average": 4.2,
      "responseCount": 156
    },
    "topDepartments": [
      {"name": "内科", "count": 89},
      {"name": "整形外科", "count": 67},
      {"name": "皮膚科", "count": 45}
    ]
  }
}
```

### 5.2 最近の活動取得
```http
GET /dashboard/recent-activities?limit=10
Authorization: Bearer {accessToken}
```

### 5.3 レポートデータ取得
```http
GET /reports/{reportType}?startDate=2025-07-01&endDate=2025-07-31
Authorization: Bearer {accessToken}
```

**Report Types:**
- `patient-demographics`: 患者層分析
- `appointment-analytics`: 予約分析
- `revenue-report`: 売上レポート
- `doctor-performance`: 医師パフォーマンス

---

## 6. スタッフ管理 API

### 6.1 スタッフ一覧取得
```http
GET /staff?role=doctor&department=内科&isActive=true
Authorization: Bearer {accessToken}
```

### 6.2 スタッフ登録
```http
POST /staff
Authorization: Bearer {accessToken}
```

**Request Body:**
```json
{
  "email": "nurse@hospital.com",
  "firstName": "花子",
  "lastName": "佐藤",
  "role": "nurse",
  "department": "内科",
  "phone": "090-9876-5432",
  "startDate": "2025-08-01"
}
```

---

## 7. 設定・マスタ管理 API

### 7.1 診療科一覧取得
```http
GET /master/departments
Authorization: Bearer {accessToken}
```

### 7.2 薬剤検索
```http
GET /master/medications?search=ロキソニン&category=pain_relief
Authorization: Bearer {accessToken}
```

---

## 8. エラーレスポンス

### 共通エラーフォーマット
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "エラーメッセージ",
    "details": {}
  }
}
```

### エラーコード一覧
- `INVALID_CREDENTIALS` (401): 認証情報が無効
- `INSUFFICIENT_PERMISSIONS` (403): 権限不足
- `RESOURCE_NOT_FOUND` (404): リソースが見つからない
- `VALIDATION_ERROR` (400): バリデーションエラー
- `DUPLICATE_RESOURCE` (409): リソースの重複
- `INTERNAL_SERVER_ERROR` (500): サーバー内部エラー

---

## 9. レート制限

### 制限内容
- 認証なし: 10リクエスト/分
- 認証あり: 1000リクエスト/分
- ファイルアップロード: 10リクエスト/分

### レスポンスヘッダー
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## 10. バージョニング

### URLベースバージョニング
- 現在バージョン: `v1`
- ベースURL: `https://api.hospital-crm.com/v1`

### 後方互換性
- マイナーバージョンアップは後方互換性を保持
- メジャーバージョンアップ時は6ヶ月の移行期間を提供

---

**この API仕様書は Swagger/OpenAPI 3.0 形式でも提供され、インタラクティブなAPIドキュメントとして利用できます。**