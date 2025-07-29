# 医療ツーリズムCRM 業務フロー図

**文書作成日**: 2025年07月28日  
**バージョン**: 1.0  
**作成者**: 株式会社yolidoli 代表取締役 船曳陸斗

---

## 1. 案件登録から受け入れ判断まで

```mermaid
flowchart TD
    A[エージェント<br/>WeChat内で患者情報入力] --> B[システム自動チェック<br/>必須項目検証・翻訳]
    B --> C{情報完備?}
    C -->|Yes| D[病院通知<br/>メール・システム内通知]
    C -->|No| E[エラー表示<br/>再入力要求]
    E --> A
    D --> F[病院担当者<br/>案件詳細確認]
    F --> G[病院審査<br/>30分-2時間]
    G --> H{受け入れ判断}
    H -->|受け入れ可| I[見積金額入力<br/>予定日設定]
    H -->|情報不足| J[追加資料要求]
    H -->|受け入れ不可| K[理由記載<br/>案件クローズ]
    I --> L[エージェント・患者通知<br/>メール + WeChat]
    J --> M[情報不足フローへ]
    K --> N[案件終了]
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style I fill:#e8f5e8
    style K fill:#ffebee
```

## 2. 情報不足・追加資料要求フロー

```mermaid
flowchart TD
    A[病院が情報不足判断] --> B[追加資料リスト作成<br/>不足項目・期限設定]
    B --> C[エージェント通知<br/>WeChat + メール]
    C --> D[エージェント対応<br/>患者への追加資料要求]
    D --> E{追加資料取得}
    E -->|取得成功| F[追加情報入力<br/>ファイルアップロード]
    E -->|取得困難| G[患者との調整<br/>1-5日]
    G --> E
    F --> H[病院再審査<br/>追加情報確認]
    H --> I{最終判断}
    I -->|受け入れ可| J[予約確定フローへ]
    I -->|まだ不十分| K[再度追加要求]
    I -->|受け入れ不可| L[案件クローズ]
    K --> B
    
    style A fill:#fff3e0
    style C fill:#e1f5fe
    style J fill:#e8f5e8
    style L fill:#ffebee
```

## 3. 予約確定から診療実施まで

```mermaid
flowchart TD
    A[受け入れ可判断] --> B[見積提示<br/>診療費・検査費]
    B --> C[エージェント経由<br/>患者への見積送付]
    C --> D{患者承諾}
    D -->|承諾| E[予約確定<br/>日程・担当医決定]
    D -->|拒否/保留| F[条件調整<br/>or 案件終了]
    E --> G[確定通知<br/>患者・エージェント]
    G --> H[来院準備<br/>病院: 通訳手配<br/>患者: 書類準備]
    H --> I[前日リマインド<br/>自動通知]
    I --> J[来院・受付<br/>パスポート確認]
    J --> K[診療実施<br/>担当医による診察]
    K --> L[会計・診断書発行]
    L --> M[診療完了<br/>完了フローへ]
    
    style E fill:#e8f5e8
    style K fill:#f3e5f5
    style M fill:#e8f5e8
```

## 4. 診療完了から請求まで

```mermaid
flowchart TD
    A[診療完了] --> B[病院担当者<br/>完了情報登録]
    B --> C[診療費確定入力<br/>支払方法記録]
    C --> D[手数料自動計算<br/>システム処理]
    D --> E[案件ステータス<br/>完了に変更]
    E --> F[月末集計処理<br/>自動実行]
    F --> G[請求書自動生成<br/>PDF作成]
    G --> H[請求書送付<br/>毎月5日]
    H --> I[病院からの支払い<br/>30日以内]
    I --> J{支払確認}
    J -->|完了| K[入金確認<br/>案件完全終了]
    J -->|未入金| L[督促処理<br/>メール・電話]
    L --> I
    
    style D fill:#fff3e0
    style G fill:#e1f5fe
    style K fill:#e8f5e8
```

## 5. キャンセル・変更対応フロー

```mermaid
flowchart TD
    A[エージェントから<br/>キャンセル・変更要請] --> B[理由・内容入力<br/>システム登録]
    B --> C{要請タイミング}
    C -->|48時間前まで| D[病院担当者確認<br/>可否判断]
    C -->|48時間切る| E[緊急対応<br/>直接連絡]
    D --> F{病院判断}
    F -->|承認| G[ステータス更新<br/>新日程設定]
    F -->|条件付承認| H[キャンセル料等<br/>条件提示]
    F -->|拒否| I[理由説明<br/>代替案提示]
    G --> J[関係者通知<br/>自動送信]
    H --> K{患者同意}
    K -->|同意| G
    K -->|拒否| L[元の予約維持<br/>or キャンセル]
    E --> M[緊急対応処理<br/>個別調整]
    
    style A fill:#e1f5fe
    style D fill:#fff3e0
    style G fill:#e8f5e8
    style I fill:#ffebee
```

## 6. 全体俯瞰図

```mermaid
flowchart TD
    Start([案件開始]) --> A[案件登録フロー]
    A --> B{判定結果}
    B -->|情報不足| C[追加資料フロー]
    B -->|受け入れ可| D[予約確定フロー]
    B -->|受け入れ不可| End1([案件終了])
    C --> B
    D --> E[診療実施]
    E --> F[完了・請求フロー]
    F --> End2([案件完了])
    
    %% キャンセルフローは各段階から発生可能
    A -.->|キャンセル要請| G[キャンセル対応フロー]
    D -.->|キャンセル要請| G
    E -.->|キャンセル要請| G
    G --> End3([キャンセル完了])
    
    %% スタイリング
    style Start fill:#c8e6c9
    style End1 fill:#ffcdd2
    style End2 fill:#c8e6c9
    style End3 fill:#ffe0b2
    style A fill:#e1f5fe
    style C fill:#fff3e0
    style D fill:#f3e5f5
    style F fill:#e8f5e8
    style G fill:#ffecb3
```

## 凡例

```mermaid
flowchart LR
    A[エージェント作業] --> B[システム自動処理]
    B --> C[病院作業]
    C --> D[完了状態]
    E[エラー・拒否状態]
    
    style A fill:#e1f5fe
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e8
    style E fill:#ffebee
```

---

## 使用方法

1. **GitHub/GitLab**: このファイルを開くと自動的に図が表示されます
2. **VS Code**: Mermaid拡張機能をインストールすると図が表示されます
3. **オンラインツール**: [Mermaid Live Editor](https://mermaid.live/) で編集・表示可能

## 更新履歴

- v1.0 (2025/07/28): 初版作成 - 5つの主要フロー図を作成