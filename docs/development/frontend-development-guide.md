# Hospital CRM フロントエンド開発手順書

**プロジェクト**: 医療ツーリズム向けCRMシステム  
**作成日**: 2025年7月29日  
**対象**: フロントエンド開発チーム  

---

## 目次
1. [プロジェクト概要とフロントエンド要件](#1-プロジェクト概要とフロントエンド要件)
2. [技術スタック選定](#2-技術スタック選定)
3. [開発環境セットアップ](#3-開発環境セットアップ)
4. [プロジェクト構造設計](#4-プロジェクト構造設計)
5. [コンポーネント設計](#5-コンポーネント設計)
6. [画面別実装手順](#6-画面別実装手順)
7. [デザインシステム実装](#7-デザインシステム実装)
8. [国際化・多言語対応](#8-国際化多言語対応)
9. [開発フロー・規約](#9-開発フロー規約)
10. [テスト戦略](#10-テスト戦略)
11. [デプロイ・運用準備](#11-デプロイ運用準備)

---

## 1. プロジェクト概要とフロントエンド要件

### 1.1 プロダクト概要
医療ツーリズム向けCRMシステムのフロントエンド開発。外国人患者受け入れ業務の効率化を目的とする。

### 1.2 対象ユーザー
- **病院スタッフ**: PC環境での管理業務
- **エージェント**: モバイル（WeChat内ブラウザ）での患者情報入力
- **システム管理者**: 全体管理・監視

### 1.3 主要機能要件
#### 必須機能（MVP）
- **患者情報管理**: 登録・編集・閲覧
- **案件管理**: ステータス管理・進捗追跡
- **ダッシュボード**: 案件一覧・統計表示
- **ファイル管理**: アップロード・表示・ダウンロード
- **通知システム**: リアルタイム通知・履歴
- **権限管理**: ロールベースアクセス制御

#### 非機能要件
- **レスポンシブ対応**: PC・タブレット・モバイル
- **多言語対応**: 日本語・中国語（簡体字）
- **パフォーマンス**: 初回読み込み3秒以内
- **アクセシビリティ**: WCAG 2.1 AA準拠
- **SEO対応**: SSR・メタタグ最適化

### 1.4 画面構成
```
├── 認証系
│   ├── ログイン
│   ├── パスワードリセット
│   └── 多要素認証
├── ダッシュボード
│   ├── 統計サマリー
│   ├── 案件一覧
│   └── 通知センター
├── 患者管理
│   ├── 患者一覧
│   ├── 患者詳細
│   └── 患者登録・編集
├── 案件管理
│   ├── 案件一覧
│   ├── 案件詳細
│   ├── 案件作成・編集
│   └── ステータス管理
├── ファイル管理
│   ├── アップロード
│   ├── ファイル一覧
│   └── プレビュー
├── 設定・管理
│   ├── ユーザー管理
│   ├── 病院設定
│   └── システム設定
└── エージェント向け（モバイル）
    ├── 患者情報入力フォーム
    ├── 案件確認
    └── ファイルアップロード
```

---

## 2. 技術スタック選定

### 2.1 推奨技術スタック

#### フロントエンドフレームワーク
```json
{
  "framework": "Next.js 14 (App Router)",
  "reasoning": [
    "TypeScript完全サポート",
    "SSR/SSG対応でSEO最適化",
    "ファイルベースルーティング",
    "APIルート機能",
    "画像最適化機能内蔵"
  ]
}
```

#### スタイリング
```json
{
  "primary": "Tailwind CSS 3.x",
  "components": "Headless UI / Radix UI",
  "icons": "Lucide React",
  "reasoning": [
    "ユーティリティファースト",
    "カスタマイズ性が高い",
    "パフォーマンス最適化",
    "デザインシステム構築しやすい"
  ]
}
```

#### 状態管理
```json
{
  "global": "Zustand",
  "server": "TanStack Query (React Query)",
  "forms": "React Hook Form + Zod",
  "reasoning": [
    "軽量で学習コストが低い",
    "TypeScript完全対応",
    "サーバー状態管理の最適化"
  ]
}
```

#### 開発・ビルドツール
```json
{
  "package_manager": "pnpm",
  "linting": "ESLint + Prettier",
  "type_checking": "TypeScript 5.x",
  "testing": "Vitest + Testing Library",
  "e2e": "Playwright"
}
```

### 2.2 依存関係一覧
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.4.0",
    "@headlessui/react": "^1.7.0",
    "lucide-react": "^0.300.0",
    "zustand": "^4.4.0",
    "@tanstack/react-query": "^5.0.0",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "next-intl": "^3.0.0",
    "@next/bundle-analyzer": "^14.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.0.0",
    "eslint": "^8.57.0",
    "prettier": "^3.1.0",
    "vitest": "^1.0.0",
    "@testing-library/react": "^14.0.0",
    "playwright": "^1.40.0",
    "tailwindcss-animate": "^1.0.7"
  }
}
```

---

## 3. 開発環境セットアップ

### 3.1 前提条件
```bash
# 必要なツール
- Node.js 18.17.0 以上
- pnpm 8.0.0 以上
- Git 2.40.0 以上
- VS Code（推奨エディタ）
```

### 3.2 プロジェクト初期化
```bash
# 1. プロジェクトディレクトリ作成
cd /path/to/hospital-crm
mkdir frontend && cd frontend

# 2. Next.js プロジェクト作成
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 3. 追加パッケージインストール
pnpm add @headlessui/react lucide-react zustand @tanstack/react-query react-hook-form zod next-intl

# 4. 開発依存関係インストール
pnpm add -D @types/node @testing-library/react vitest playwright tailwindcss-animate

# 5. 開発サーバー起動確認
pnpm dev
```

### 3.3 設定ファイル作成

#### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/hooks/*": ["./src/hooks/*"],
      "@/types/*": ["./src/types/*"],
      "@/store/*": ["./src/store/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### `tailwind.config.js`
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // モノクロベース + 緑アクセント
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
        green: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          300: '#86EFAC',
          400: '#4ADE80',
          500: '#10B981', // メイン緑
          600: '#059669',
          700: '#047857',
          800: '#065F46',
          900: '#064E3B',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans JP', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('tailwindcss-animate'),
  ],
}
```

#### `next.config.js`
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@tanstack/react-query'],
  },
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  // 国際化設定
  i18n: {
    locales: ['ja', 'zh-CN'],
    defaultLocale: 'ja',
  },
  // セキュリティヘッダー
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

---

## 4. プロジェクト構造設計

### 4.1 ディレクトリ構成
```
frontend/
├── public/
│   ├── icons/
│   ├── images/
│   └── locales/
│       ├── ja/
│       │   └── common.json
│       └── zh-CN/
│           └── common.json
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/
│   │   │   ├── dashboard/
│   │   │   ├── patients/
│   │   │   ├── cases/
│   │   │   └── files/
│   │   ├── api/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Card.tsx
│   │   │   └── Modal.tsx
│   │   ├── forms/
│   │   │   ├── PatientForm.tsx
│   │   │   └── CaseForm.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── features/
│   │       ├── auth/
│   │       ├── dashboard/
│   │       ├── patients/
│   │       └── cases/
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── usePatients.ts
│   │   └── useCases.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── utils.ts
│   │   └── validations.ts
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── patientStore.ts
│   │   └── caseStore.ts
│   ├── types/
│   │   ├── auth.ts
│   │   ├── patient.ts
│   │   └── case.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── __mocks__/
│   ├── components/
│   ├── pages/
│   └── utils/
├── docs/
├── .env.local
├── .env.example
├── .gitignore
├── package.json
├── pnpm-lock.yaml
├── tailwind.config.js
├── tsconfig.json
├── next.config.js
├── vitest.config.ts
└── README.md
```

### 4.2 命名規則
- **コンポーネント**: PascalCase (`PatientCard.tsx`)
- **ファイル**: kebab-case (`patient-form.tsx`)
- **ディレクトリ**: kebab-case (`patient-management/`)
- **フック**: camelCase with use prefix (`usePatientData.ts`)
- **型定義**: PascalCase with Type/Interface suffix (`PatientType.ts`)

---

## 5. コンポーネント設計

### 5.1 コンポーネント階層
```
App Layout
├── Header
│   ├── Logo
│   ├── Navigation
│   ├── UserMenu
│   └── NotificationCenter
├── Sidebar
│   ├── NavigationMenu
│   └── QuickActions
└── MainContent
    ├── PageHeader
    ├── Breadcrumb
    └── PageContent
        ├── DataTable
        ├── Forms
        ├── Cards
        └── Modals
```

### 5.2 基本UIコンポーネント

#### `Button.tsx`
```typescript
import { forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-green-500 text-white hover:bg-green-600',
        secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

export { Button, buttonVariants }
```

#### `Input.tsx`
```typescript
import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helper, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-medium text-gray-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <input
          className={cn(
            'flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {helper && !error && <p className="text-sm text-gray-500">{helper}</p>}
      </div>
    )
  }
)

export { Input }
```

### 5.3 レイアウトコンポーネント

#### `Layout.tsx`
```typescript
'use client'

import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { useAuth } from '@/hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      Loading...
    </div>
  }

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
```

---

## 6. 画面別実装手順

### 6.1 実装優先順位

#### Phase 1: 認証・基盤（Week 1-2）
1. **ログイン画面**
   - フォームバリデーション
   - エラーハンドリング
   - リダイレクト機能

2. **レイアウト構築**
   - Header/Sidebar実装
   - レスポンシブ対応
   - ナビゲーション

3. **ダッシュボード（基本版）**
   - 統計表示
   - 案件一覧
   - クイックアクション

#### Phase 2: 主要機能（Week 3-5）
1. **患者管理**
   - 患者一覧（検索・フィルタ）
   - 患者詳細・編集
   - 新規患者登録

2. **案件管理**
   - 案件一覧・詳細
   - ステータス管理
   - 進捗追跡

3. **ファイル管理**
   - アップロード機能
   - ファイル一覧・プレビュー
   - ダウンロード機能

#### Phase 3: 高度機能（Week 6-8）
1. **通知システム**
   - リアルタイム通知
   - 通知履歴
   - 設定管理

2. **権限管理**
   - ユーザー管理
   - ロール設定
   - アクセス制御

3. **レポート・分析**
   - 統計ダッシュボード
   - データエクスポート
   - グラフ・チャート

### 6.2 実装テンプレート

#### 新規ページ作成手順
```bash
# 1. ページディレクトリ作成
mkdir -p src/app/(dashboard)/new-feature

# 2. 基本ファイル作成
touch src/app/(dashboard)/new-feature/page.tsx
touch src/app/(dashboard)/new-feature/loading.tsx
touch src/app/(dashboard)/new-feature/error.tsx

# 3. コンポーネント作成
mkdir -p src/components/features/new-feature
touch src/components/features/new-feature/NewFeatureList.tsx
touch src/components/features/new-feature/NewFeatureForm.tsx

# 4. 型定義作成
touch src/types/new-feature.ts

# 5. API フック作成
touch src/hooks/useNewFeature.ts

# 6. テストファイル作成
touch tests/components/new-feature.test.tsx
```

#### ページコンポーネントテンプレート
```typescript
// src/app/(dashboard)/patients/page.tsx
import { Suspense } from 'react'
import { PatientList } from '@/components/features/patients/PatientList'
import { PatientListSkeleton } from '@/components/features/patients/PatientListSkeleton'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'

export default function PatientsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="患者管理"
        description="患者情報の登録・管理・編集を行います"
        action={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            新規患者登録
          </Button>
        }
      />
      
      <Suspense fallback={<PatientListSkeleton />}>
        <PatientList />
      </Suspense>
    </div>
  )
}
```

---

## 7. デザインシステム実装

### 7.1 デザイントークン実装
```css
/* src/styles/design-tokens.css */
:root {
  /* Colors */
  --color-primary-50: #F0FDF4;
  --color-primary-500: #10B981;
  --color-primary-600: #059669;
  
  /* Typography */
  --font-size-xs: 0.75rem;
  --font-size-sm: 0.875rem;
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  
  /* Spacing */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  
  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 1px 3px 0 rgb(0 0 0 / 0.1);
  --shadow-lg: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

### 7.2 カスタムフック例
```typescript
// src/hooks/usePatients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Patient, CreatePatientInput } from '@/types/patient'
import * as patientApi from '@/lib/api/patients'

export function usePatients() {
  return useQuery({
    queryKey: ['patients'],
    queryFn: patientApi.getPatients,
  })
}

export function usePatient(id: string) {
  return useQuery({
    queryKey: ['patients', id],
    queryFn: () => patientApi.getPatient(id),
    enabled: !!id,
  })
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: patientApi.createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] })
    },
  })
}
```

---

## 8. 国際化・多言語対応

### 8.1 Next-intl セットアップ
```typescript
// src/i18n.config.ts
export const locales = ['ja', 'zh-CN'] as const
export const defaultLocale = 'ja' as const

export type Locale = typeof locales[number]
```

### 8.2 翻訳ファイル構成
```json
// public/locales/ja/common.json
{
  "navigation": {
    "dashboard": "ダッシュボード",
    "patients": "患者管理",
    "cases": "案件管理",
    "files": "ファイル管理",
    "settings": "設定"
  },
  "actions": {
    "save": "保存",
    "cancel": "キャンセル",
    "delete": "削除",
    "edit": "編集",
    "create": "作成"
  },
  "status": {
    "new": "新規",
    "in_progress": "進行中",
    "completed": "完了",
    "cancelled": "キャンセル"
  }
}
```

---

## 9. 開発フロー・規約

### 9.1 Git ワークフロー
```bash
# ブランチ命名規則
feature/patient-management    # 新機能
bugfix/login-error-handling  # バグ修正
hotfix/security-patch        # 緊急修正

# コミットメッセージ
feat: 患者一覧画面を実装
fix: ログインエラーの修正
docs: README更新
style: ESLintエラー修正
refactor: コンポーネント構造改善
test: 患者フォームのテスト追加
```

### 9.2 コードレビューチェックリスト
- [ ] TypeScriptエラーがない
- [ ] ESLint/Prettierルールに準拠
- [ ] アクセシビリティ対応
- [ ] レスポンシブデザイン対応
- [ ] パフォーマンス最適化
- [ ] セキュリティ考慮
- [ ] テストコード作成
- [ ] 適切なエラーハンドリング

### 9.3 開発規約
- **コンポーネント**: 単一責任の原則
- **カスタムフック**: ビジネスロジック分離
- **型安全性**: any型の禁止
- **パフォーマンス**: React.memo適切使用
- **アクセシビリティ**: aria属性適切設定

---

## 10. テスト戦略

### 10.1 テスト構成
```bash
tests/
├── unit/                 # 単体テスト
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/          # 結合テスト
│   ├── api/
│   └── features/
└── e2e/                 # E2Eテスト
    ├── auth.spec.ts
    ├── patient-management.spec.ts
    └── case-management.spec.ts
```

### 10.2 テスト例
```typescript
// tests/components/Button.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    await userEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

---

## 11. デプロイ・運用準備

### 11.1 環境変数設定
```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### 11.2 ビルド・デプロイ
```bash
# 本番ビルド
pnpm build

# ビルド確認
pnpm start

# 静的解析
pnpm lint
pnpm type-check

# テスト実行
pnpm test
pnpm test:e2e
```

### 11.3 パフォーマンス最適化
- **画像最適化**: Next.js Image コンポーネント使用
- **コード分割**: 動的インポート活用
- **バンドルサイズ**: Bundle Analyzer で監視
- **キャッシュ戦略**: SWR/React Query適切設定

---

## まとめ

この手順書に従って段階的に開発を進めることで、保守性が高く、スケーラブルなフロントエンド アプリケーションを構築できます。

**次のステップ**: 
1. 開発環境セットアップ
2. 基本コンポーネント実装
3. 認証機能実装
4. 主要機能の段階的実装

各フェーズ完了時にはレビューとテストを実施し、品質を担保しながら開発を進めてください。