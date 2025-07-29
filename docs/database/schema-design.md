# Hospital CRM - データベース設計書

**プロジェクト**: 医療ツーリズム向けCRMシステム  
**作成日**: 2025年7月29日  
**バージョン**: v1.0  
**データベース**: PostgreSQL 15+

---

## 1. 概要

### データベース構成
- **メインDB**: PostgreSQL（トランザクション処理、マスタデータ）
- **キャッシュ**: Redis（セッション、一時データ）
- **ファイル**: AWS S3 / Azure Blob Storage（画像、文書）

### 設計原則
- UUID主キー採用（セキュリティ・スケーラビリティ）
- 論理削除による履歴保持
- 多言語対応（JSONB活用）
- 監査ログ記録
- 個人情報暗号化

---

## 2. ER図

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   patients  │    │   staff     │    │appointments │
│             │    │             │    │             │
│ id (PK)     │◄──┤ id (PK)     │◄──┤ id (PK)     │
│ patient_id  │   │ email       │   │ patient_id  │
│ first_name  │   │ first_name  │   │ staff_id    │
│ last_name   │   │ last_name   │   │ appt_date   │
│ ...         │   │ ...         │   │ ...         │
└─────────────┘   └─────────────┘   └─────────────┘
       │                                    │
       │          ┌─────────────┐          │
       └─────────►│med_records  │◄─────────┘
                  │             │
                  │ id (PK)     │
                  │ patient_id  │
                  │ doctor_id   │
                  │ visit_date  │
                  │ ...         │
                  └─────────────┘
```

---

## 3. テーブル設計

### 3.1 patients（患者）

```sql
CREATE TABLE patients (
    -- 基本キー
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id VARCHAR(20) UNIQUE NOT NULL, -- P0001, P0002...
    
    -- 基本情報
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_kana VARCHAR(100),
    last_name_kana VARCHAR(100),
    
    -- 個人情報
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
    nationality VARCHAR(50) DEFAULT 'Japan',
    
    -- 連絡先（暗号化対象）
    phone VARCHAR(20),
    email VARCHAR(255),
    address JSONB, -- 多言語対応住所
    
    -- 緊急連絡先
    emergency_contact JSONB,
    
    -- 保険情報
    insurance_info JSONB,
    
    -- 医療履歴
    medical_history JSONB, -- 既往歴・アレルギー等
    
    -- ステータス・メタデータ
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'deleted')),
    notes TEXT,
    
    -- 監査情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES staff(id),
    updated_by UUID REFERENCES staff(id),
    
    -- インデックス用
    search_vector TSVECTOR
);

-- インデックス
CREATE INDEX idx_patients_patient_id ON patients(patient_id);
CREATE INDEX idx_patients_name ON patients(last_name, first_name);
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_email ON patients(email);
CREATE INDEX idx_patients_status ON patients(status);
CREATE INDEX idx_patients_search ON patients USING GIN(search_vector);

-- 全文検索用トリガー
CREATE TRIGGER patients_search_vector_update
    BEFORE INSERT OR UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION
    tsvector_update_trigger(search_vector, 'pg_catalog.simple', 
                           first_name, last_name, first_name_kana, last_name_kana);
```

### 3.2 staff（スタッフ）

```sql
CREATE TABLE staff (
    -- 基本キー
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 認証情報
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- 基本情報
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    first_name_kana VARCHAR(100),
    last_name_kana VARCHAR(100),
    
    -- 職員情報
    employee_id VARCHAR(20) UNIQUE,
    role VARCHAR(50) NOT NULL CHECK (role IN ('doctor', 'nurse', 'admin', 'receptionist')),
    department VARCHAR(100),
    specialization VARCHAR(100), -- 専門分野
    license_number VARCHAR(50), -- 医師免許番号等
    
    -- 連絡先
    phone VARCHAR(20),
    
    -- 勤務情報
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    
    -- セキュリティ
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- 監査情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES staff(id),
    updated_by UUID REFERENCES staff(id)
);

-- インデックス
CREATE INDEX idx_staff_email ON staff(email);
CREATE INDEX idx_staff_role ON staff(role);
CREATE INDEX idx_staff_department ON staff(department);
CREATE INDEX idx_staff_is_active ON staff(is_active);
```

### 3.3 medical_records（診療記録）

```sql
CREATE TABLE medical_records (
    -- 基本キー
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_number VARCHAR(20) UNIQUE NOT NULL, -- MR240729001
    
    -- 関連情報
    patient_id UUID NOT NULL REFERENCES patients(id),
    doctor_id UUID NOT NULL REFERENCES staff(id),
    
    -- 診療情報
    visit_date TIMESTAMP WITH TIME ZONE NOT NULL,
    department VARCHAR(100) NOT NULL,
    
    -- 診療内容
    chief_complaint TEXT, -- 主訴
    present_illness TEXT, -- 現病歴
    physical_examination TEXT, -- 身体所見
    vital_signs JSONB, -- バイタルサイン
    
    -- 診断・治療
    diagnosis TEXT NOT NULL, -- 診断名
    icd_codes VARCHAR(50)[], -- ICD-10コード
    treatment TEXT, -- 治療内容
    medications JSONB, -- 処方薬
    
    -- 検査・画像
    lab_results JSONB, -- 検査結果
    imaging_results JSONB, -- 画像検査結果
    
    -- その他
    notes TEXT, -- 医師メモ
    follow_up_plan TEXT, -- フォローアップ計画
    next_appointment TIMESTAMP WITH TIME ZONE,
    
    -- ステータス
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'completed', 'approved')),
    
    -- 監査情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    approved_by UUID REFERENCES staff(id)
);

-- インデックス
CREATE INDEX idx_medical_records_patient_id ON medical_records(patient_id);
CREATE INDEX idx_medical_records_doctor_id ON medical_records(doctor_id);
CREATE INDEX idx_medical_records_visit_date ON medical_records(visit_date);
CREATE INDEX idx_medical_records_department ON medical_records(department);
CREATE INDEX idx_medical_records_status ON medical_records(status);
```

### 3.4 appointments（予約）

```sql
CREATE TABLE appointments (
    -- 基本キー
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_number VARCHAR(20) UNIQUE NOT NULL, -- A20250729001
    
    -- 関連情報
    patient_id UUID NOT NULL REFERENCES patients(id),
    staff_id UUID NOT NULL REFERENCES staff(id), -- 担当医師・スタッフ
    
    -- 予約情報
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER DEFAULT 30, -- 分単位
    appointment_type VARCHAR(50) NOT NULL, -- 診察、検査、相談等
    department VARCHAR(100) NOT NULL,
    
    -- 詳細情報
    purpose TEXT, -- 予約目的
    notes TEXT, -- 特記事項
    
    -- ステータス管理
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (
        status IN ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show')
    ),
    cancellation_reason TEXT,
    
    -- 確認・通知
    confirmation_sent_at TIMESTAMP WITH TIME ZONE,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- 監査情報
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES staff(id),
    updated_by UUID REFERENCES staff(id)
);

-- インデックス
CREATE INDEX idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX idx_appointments_staff_id ON appointments(staff_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_department ON appointments(department);

-- 重複予約防止の制約
CREATE UNIQUE INDEX idx_appointments_unique_slot 
ON appointments(staff_id, appointment_date) 
WHERE status NOT IN ('cancelled', 'no_show');
```

### 3.5 audit_logs（監査ログ）

```sql
CREATE TABLE audit_logs (
    -- 基本キー
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- 操作情報
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE', 'SELECT')),
    
    -- 変更内容
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- 実行者情報
    user_id UUID REFERENCES staff(id),
    user_email VARCHAR(255),
    user_role VARCHAR(50),
    
    -- セッション情報
    session_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    
    -- タイムスタンプ
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
```

### 3.6 sessions（セッション管理）

```sql
CREATE TABLE sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES staff(id),
    data JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);
```

---

## 4. マスタテーブル

### 4.1 departments（診療科）

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2 medications（薬剤マスタ）

```sql
CREATE TABLE medications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(20) UNIQUE NOT NULL, -- 薬価基準収載医薬品コード
    name VARCHAR(200) NOT NULL,
    generic_name VARCHAR(200),
    category VARCHAR(100),
    unit VARCHAR(20),
    dosage_forms VARCHAR(50)[],
    contraindications TEXT,
    side_effects TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3 icd_codes（ICD-10疾患分類）

```sql
CREATE TABLE icd_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(10) UNIQUE NOT NULL, -- A00.0 形式
    name VARCHAR(300) NOT NULL,
    name_en VARCHAR(300),
    category VARCHAR(100),
    parent_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true
);
```

---

## 5. JSONB構造定義

### 5.1 patients.address（住所）

```json
{
  "postalCode": "150-0001",
  "prefecture": "東京都",
  "city": "渋谷区",
  "addressLine": "神宮前1-1-1",
  "building": "サンプルビル101",
  "country": "Japan",
  "translations": {
    "en": {
      "prefecture": "Tokyo",
      "city": "Shibuya",
      "addressLine": "1-1-1 Jingumae",
      "building": "Sample Building 101"
    }
  }
}
```

### 5.2 patients.emergency_contact（緊急連絡先）

```json
{
  "name": "山田花子",
  "relationship": "配偶者",
  "phone": "090-1234-5679",
  "email": "hanako@example.com",
  "address": "同上"
}
```

### 5.3 patients.insurance_info（保険情報）

```json
{
  "type": "health_insurance",
  "provider": "協会けんぽ",
  "policyNumber": "12345678",
  "expiryDate": "2026-03-31",
  "copayRate": 30
}
```

### 5.4 medical_records.medications（処方薬）

```json
[
  {
    "medicationId": "med-uuid-1",
    "name": "ロキソニン錠60mg",
    "dosage": "1日3回食後",
    "quantity": "21錠",
    "duration": "7日間",
    "instructions": "痛みがひどい時のみ服用"
  }
]
```

### 5.5 medical_records.vital_signs（バイタルサイン）

```json
{
  "bloodPressure": {
    "systolic": 130,
    "diastolic": 80,
    "unit": "mmHg"
  },
  "pulse": {
    "rate": 72,
    "unit": "bpm"
  },
  "temperature": {
    "value": 36.5,
    "unit": "celsius"
  },
  "height": {
    "value": 170,
    "unit": "cm"
  },
  "weight": {
    "value": 70,
    "unit": "kg"
  },
  "bmi": 24.2
}
```

---

## 6. セキュリティ対策

### 6.1 データ暗号化

```sql
-- 暗号化関数（PostgreSQL + pgcrypto）
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 患者の個人情報暗号化
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(encrypt(data::bytea, 'encryption_key', 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql;

-- 復号化関数
CREATE OR REPLACE FUNCTION decrypt_pii(encrypted_data TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN convert_from(decrypt(decode(encrypted_data, 'base64'), 'encryption_key', 'aes'), 'UTF8');
END;
$$ LANGUAGE plpgsql;
```

### 6.2 行レベルセキュリティ（RLS）

```sql
-- 患者データのRLS有効化
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- 医師は担当患者のみ閲覧可能
CREATE POLICY patient_access_policy ON patients
    FOR ALL TO staff_role
    USING (
        id IN (
            SELECT DISTINCT patient_id 
            FROM medical_records 
            WHERE doctor_id = current_user_id()
        )
    );
```

### 6.3 監査トリガー

```sql
-- 監査ログ記録トリガー
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (
        table_name, record_id, action, old_values, new_values,
        user_id, created_at
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        TG_OP,
        CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP = 'INSERT' THEN row_to_json(NEW) ELSE row_to_json(NEW) END,
        current_user_id(),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 主要テーブルに監査トリガー設定
CREATE TRIGGER patients_audit_trigger
    AFTER INSERT OR UPDATE OR DELETE ON patients
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

---

## 7. パフォーマンス最適化

### 7.1 パーティショニング

```sql
-- 監査ログの月次パーティショニング
CREATE TABLE audit_logs_2025_07 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-07-01') TO ('2025-08-01');

CREATE TABLE audit_logs_2025_08 PARTITION OF audit_logs
    FOR VALUES FROM ('2025-08-01') TO ('2025-09-01');
```

### 7.2 インデックス戦略

```sql
-- 複合インデックス（よく使用される検索条件）
CREATE INDEX idx_appointments_doctor_date_status 
ON appointments(staff_id, appointment_date, status);

-- 部分インデックス（条件付き）
CREATE INDEX idx_patients_active 
ON patients(last_name, first_name) 
WHERE status = 'active';
```

---

## 8. データベース初期化

### 8.1 初期データ投入

```sql
-- 管理者ユーザー作成
INSERT INTO staff (id, email, password_hash, first_name, last_name, role) 
VALUES (
    gen_random_uuid(),
    'admin@hospital.com',
    '$2b$12$hashed_password',
    'システム',
    '管理者',
    'admin'
);

-- 診療科マスタ
INSERT INTO departments (code, name, name_en) VALUES
    ('INT', '内科', 'Internal Medicine'),
    ('SUR', '外科', 'Surgery'),
    ('ORT', '整形外科', 'Orthopedics'),
    ('DER', '皮膚科', 'Dermatology');
```

---

## 9. バックアップ・復旧戦略

### 9.1 バックアップ設定

```bash
# 日次フルバックアップ
pg_dump hospital_crm > backup_$(date +%Y%m%d).sql

# WALアーカイブによる継続バックアップ
archive_command = 'cp %p /backup/wal_archive/%f'
```

### 9.2 Point-in-Time Recovery設定

```sql
-- WALレベルの設定
wal_level = replica
archive_mode = on
max_wal_senders = 3
```

---

**このデータベース設計は医療情報システムの安全性基準（医療情報システムの安全管理に関するガイドライン）に準拠し、患者プライバシー保護と監査要件を満たしています。**