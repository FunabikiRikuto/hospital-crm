# Hospital CRM - 統一デザインシステム

**プロジェクト**: 医療ツーリズム向けCRMシステム  
**更新日**: 2025年7月29日  
**バージョン**: v2.0（統合版）  

---

## 1. デザインコンセプト

### 基本方針
- **医療現場にふさわしいプロフェッショナルなデザイン**
- **シンプル・モノクロベースに緑のアクセントカラー**
- **直感的で学習コストの低いUI**
- **多言語対応を前提とした柔軟なレイアウト**

### デザインキーワード
- **Clean**（清潔感）- 医療現場らしい衛生的な印象
- **Professional**（専門性）- 医療従事者が信頼できるデザイン
- **Minimal**（ミニマル）- 情報過多を避けた整理されたUI
- **Accessible**（アクセシブル）- 高齢患者・障害者対応

---

## 2. カラーシステム

### プライマリカラー（モノクロベース）
```css
/* グレースケール（メインカラー） */
--color-gray-900: #111827    /* メインテキスト・重要ボタン */
--color-gray-800: #1F2937    /* セカンダリテキスト */
--color-gray-700: #374151    /* サブテキスト */
--color-gray-600: #4B5563    /* 無効状態・プレースホルダー */
--color-gray-500: #6B7280    /* ボーダー・分割線 */
--color-gray-400: #9CA3AF    /* 薄いボーダー */
--color-gray-300: #D1D5DB    /* 背景ボーダー */
--color-gray-200: #E5E7EB    /* カード境界 */
--color-gray-100: #F3F4F6    /* テーブルヘッダー・薄い背景 */
--color-gray-50: #F9FAFB     /* ページ背景 */
--color-white: #FFFFFF        /* カード・モーダル背景 */
```

### アクセントカラー（緑系統）
```css
--color-green-primary: #10B981    /* メインCTA・成功状態 */
--color-green-hover: #059669      /* ホバー状態 */
--color-green-light: #D1FAE5      /* 薄い背景・選択状態 */
--color-green-border: #A7F3D0     /* フォーカスボーダー */
```

### ステータスカラー（控えめ）
```css
--color-success: #10B981     /* 完了・承認 */
--color-warning: #F59E0B     /* 警告・要注意（最小限使用） */
--color-error: #EF4444       /* エラー・緊急（最小限使用） */
--color-info: #6B7280        /* 情報・中性的な通知 */
```

### カラー使用ルール
1. **1画面の色数は最大3色まで**（グレー + 緑 + 1色）
2. **背景は必ずグレー50以上**で段差表現
3. **医療現場配慮で赤色は極力避ける**
4. **高齢患者対応でコントラスト比4.5:1以上確保**

---

## 3. タイポグラフィ

### フォントファミリー
```css
font-family: 
  'Inter', 
  'Noto Sans JP', 
  'Hiragino Kaku Gothic ProN', 
  'ヒラギノ角ゴ ProN W3', 
  'メイリオ', 
  sans-serif;
```

### フォントサイズ階層
```css
--text-3xl: 32px;    /* H1・大見出し・重要数値 */
--text-2xl: 24px;    /* H1・画面タイトル */
--text-xl: 20px;     /* H2・セクション見出し */
--text-lg: 18px;     /* H3・サブセクション */
--text-base: 16px;   /* 本文・テーブル内容 */
--text-sm: 14px;     /* ラベル・タグ・注釈 */
--text-xs: 12px;     /* キャプション・ID表示 */
```

### フォントウェイト
- **Bold (700)**: H1・重要数値
- **Semibold (600)**: H2・H3
- **Medium (500)**: ボタン・ラベル
- **Regular (400)**: 本文・説明文

---

## 4. アイコンシステム

### 使用ライブラリ
```bash
npm install lucide-react
```

### 主要アイコン定義
```typescript
// 患者管理
Users2          // 患者一覧
UserPlus        // 新規患者登録
UserCheck       // 患者確認・診療完了
Calendar        // 予約管理
CalendarPlus    // 予約追加
Clock           // 時間・待機時間
Stethoscope     // 診療・医療行為

// データ・分析
BarChart3       // 分析・レポート
TrendingUp      // 改善・成長指標
FileText        // 文書・レポート
Download        // エクスポート・ダウンロード

// 操作
Search          // 検索
Filter          // フィルター
Plus            // 追加
Edit3           // 編集
Trash2          // 削除
Eye             // 詳細表示
Settings        // 設定

// ステータス
CheckCircle2    // 完了・成功
AlertCircle     // 警告・注意
Info            // 情報・ヘルプ
XCircle         // エラー（最小限使用）
```

### アイコン仕様
- **サイズ**: 16px（小）、20px（標準）、24px（大）
- **ストローク**: 1.5px統一
- **色**: グレー600（デフォルト）、緑500（アクティブ）

---

## 5. UIコンポーネント

### ボタン
```css
/* プライマリボタン */
.btn-primary {
  background: var(--color-green-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
  font-size: 14px;
}

.btn-primary:hover {
  background: var(--color-green-hover);
}

/* セカンダリボタン */
.btn-secondary {
  background: white;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  padding: 12px 24px;
  font-weight: 500;
}

.btn-secondary:hover {
  background: var(--color-gray-50);
  border-color: var(--color-gray-400);
}

/* ゴーストボタン */
.btn-ghost {
  background: transparent;
  color: var(--color-gray-600);
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
}

.btn-ghost:hover {
  background: var(--color-gray-100);
}
```

### カード
```css
.card {
  background: white;
  border: 1px solid var(--color-gray-200);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.card-header {
  border-bottom: 1px solid var(--color-gray-200);
  padding-bottom: 16px;
  margin-bottom: 16px;
}
```

### フォーム要素
```css
.input {
  background: white;
  border: 1px solid var(--color-gray-300);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--color-gray-900);
}

.input:focus {
  border-color: var(--color-green-primary);
  box-shadow: 0 0 0 3px var(--color-green-light);
  outline: none;
}

.label {
  color: var(--color-gray-700);
  font-weight: 500;
  font-size: 14px;
  margin-bottom: 8px;
  display: block;
}
```

### ステータスタグ
```css
.status-tag {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-success {
  background: var(--color-green-light);
  color: var(--color-green-primary);
}

.status-warning {
  background: #FEF3C7;
  color: #D97706;
}

.status-neutral {
  background: var(--color-gray-100);
  color: var(--color-gray-700);
}
```

---

## 6. レイアウトシステム

### グリッドシステム
- **12カラムグリッド**
- **ガター**: 24px
- **最大幅**: 1440px
- **サイドバー**: 固定220px

### スペーシング
```css
--space-1: 4px;      /* 細かい調整 */
--space-2: 8px;      /* 小さな余白 */
--space-3: 12px;     /* 要素間 */
--space-4: 16px;     /* 標準余白 */
--space-6: 24px;     /* セクション内 */
--space-8: 32px;     /* コンポーネント間 */
--space-12: 48px;    /* 大きなセクション */
--space-16: 64px;    /* ページセクション */
```

### サイドバーナビゲーション
```css
.sidebar {
  width: 220px;
  background: var(--color-gray-50);
  border-right: 1px solid var(--color-gray-200);
}

.nav-item {
  padding: 12px 16px;
  border-radius: 8px;
  color: var(--color-gray-600);
  transition: all 150ms ease;
}

.nav-item.active {
  background: var(--color-green-light);
  color: var(--color-green-primary);
  border-left: 3px solid var(--color-green-primary);
}
```

---

## 7. 医療CRM特有の配慮

### 患者プライバシー保護
- **患者名**: 部分マスク表示（山田 ◯◯ 様）
- **患者ID**: 下4桁のみ表示
- **診療内容**: 権限レベル別表示制御

### 医療現場への配慮
- **緊急表示**: 赤色を避け、グレー系で表現
- **高齢患者対応**: 大きめフォント・高コントラスト
- **多職種対応**: 権限による画面カスタマイズ

### 操作性
- **ボタン配置**: 保存（右）、キャンセル（左）
- **確認ダイアログ**: 重要操作には必ず確認
- **ローディング状態**: 処理中の明確な表示

---

## 8. レスポンシブ対応

### ブレイクポイント
```css
/* Desktop */
@media (min-width: 1200px) { /* フルレイアウト */ }

/* Tablet */
@media (min-width: 768px) and (max-width: 1199px) { 
  /* サイドバー折りたたみ */ 
}

/* Mobile */
@media (max-width: 767px) { 
  /* モバイル専用レイアウト */ 
}
```

---

## 9. アクセシビリティ

### 必須要件
- **コントラスト比**: 4.5:1以上
- **クリック領域**: 最小44×44px
- **キーボード操作**: 全機能対応
- **スクリーンリーダー**: 適切なaria-label

### 医療現場特化
- **手袋装着時対応**: 大きめクリック領域
- **視覚障害医療従事者対応**: 音声読み上げ最適化

---

## 10. 実装優先順位

### Phase 1（即座実装）
1. カラーパレット・タイポグラフィの適用
2. Lucide Iconsの導入
3. 基本コンポーネント（ボタン・フォーム・カード）

### Phase 2（短期実装）
1. サイドバーナビゲーション
2. テーブル・リスト表示
3. ステータス表示システム

### Phase 3（中長期実装）
1. レスポンシブ対応
2. アニメーション・マイクロインタラクション
3. アクセシビリティ強化

---

**この統一デザインシステムにより、一貫性があり医療現場に適したCRMシステムを構築できます。**