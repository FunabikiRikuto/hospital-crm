# Hospital CRM - デプロイメントガイド

**プロジェクト**: 医療ツーリズム向けCRMシステム  
**作成日**: 2025年7月29日  
**バージョン**: v1.0  

---

## 1. インフラ構成

### 1.1 推奨環境（AWS）

```
┌─────────────────────────────────────┐
│           ALB (Load Balancer)       │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│        ECS Cluster (Fargate)        │
│  ┌─────────────┐ ┌─────────────────┐│
│  │  Frontend   │ │   Backend API   ││
│  │  (React)    │ │  (Node.js)      ││
│  └─────────────┘ └─────────────────┘│
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│         RDS (PostgreSQL)            │
│  ┌─────────────┐ ┌─────────────────┐│
│  │   Primary   │ │   Read Replica  ││
│  └─────────────┘ └─────────────────┘│
└─────────────────────────────────────┘
              │
┌─────────────▼───────────────────────┐
│     ElastiCache (Redis Cluster)     │
└─────────────────────────────────────┘
```

### 1.2 Azure対応構成

```
┌─────────────────────────────────────┐
│      Azure Load Balancer            │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│    Container Instances (ACI)        │
│  ┌─────────────┐ ┌─────────────────┐│
│  │  Frontend   │ │   Backend API   ││
│  └─────────────┘ └─────────────────┘│
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│    Azure Database for PostgreSQL    │
└─────────────┬───────────────────────┘
              │
┌─────────────▼───────────────────────┐
│      Azure Cache for Redis          │
└─────────────────────────────────────┘
```

---

## 2. 環境構成

### 2.1 開発環境（Development）

**目的**: 機能開発・単体テスト  
**構成**: Docker Compose（ローカル）

```yaml
# docker-compose.dev.yml
version: '3.8'
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - REACT_APP_API_URL=http://localhost:3001/api

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.dev
    ports:
      - "3001:3001"
    volumes:
      - ./backend:/app
      - /app/node_modules
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/hospital_crm_dev
      - REDIS_URL=redis://redis:6379
      - JWT_SECRET=dev_jwt_secret
    depends_on:
      - db
      - redis

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=hospital_crm_dev
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_dev_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_dev_data:
```

### 2.2 ステージング環境（Staging）

**目的**: 統合テスト・受け入れテスト  
**構成**: AWS ECS Fargate

```yaml
# ecs-staging.yml
version: 1
services:
  frontend:
    image: hospital-crm-frontend:staging
    cpu: 256
    memory: 512
    environment:
      - NODE_ENV=staging
      - REACT_APP_API_URL=https://api-staging.hospital-crm.com

  backend:
    image: hospital-crm-backend:staging
    cpu: 512
    memory: 1024
    environment:
      - NODE_ENV=staging
      - DATABASE_URL=${STAGING_DATABASE_URL}
      - REDIS_URL=${STAGING_REDIS_URL}
      - JWT_SECRET=${STAGING_JWT_SECRET}
```

### 2.3 本番環境（Production）

**目的**: 本番運用  
**構成**: AWS ECS Fargate + RDS + ElastiCache

---

## 3. Docker設定

### 3.1 Frontend Dockerfile

```dockerfile
# frontend/Dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# nginxの設定
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 3.2 Backend Dockerfile

```dockerfile
# backend/Dockerfile
FROM node:18-alpine

# 必要なパッケージをインストール
RUN apk add --no-cache postgresql-client

WORKDIR /app

# 依存関係のインストール
COPY package*.json ./
RUN npm ci --only=production

# アプリケーションコードをコピー
COPY . .

# TypeScriptのビルド
RUN npm run build

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

EXPOSE 3001

# アプリケーション起動
CMD ["npm", "start"]
```

### 3.3 nginx設定

```nginx
# frontend/nginx.conf
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    # gzip圧縮
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        # React Router対応
        location / {
            try_files $uri $uri/ /index.html;
        }

        # セキュリティヘッダー
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;

        # キャッシュ設定
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

---

## 4. CI/CD パイプライン

### 4.1 GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

env:
  AWS_REGION: ap-northeast-1
  ECS_CLUSTER: hospital-crm-cluster
  FRONTEND_SERVICE: hospital-crm-frontend
  BACKEND_SERVICE: hospital-crm-backend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: |
          cd backend && npm ci
          cd ../frontend && npm ci
          
      - name: Run tests
        run: |
          cd backend && npm test
          cd ../frontend && npm test -- --coverage --watchAll=false
          
      - name: Run security scan
        run: |
          cd backend && npm audit
          cd ../frontend && npm audit

  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
          
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
        
      - name: Build and push frontend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: hospital-crm-frontend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd frontend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          
      - name: Build and push backend image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          ECR_REPOSITORY: hospital-crm-backend
          IMAGE_TAG: ${{ github.sha }}
        run: |
          cd backend
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          
      - name: Deploy to ECS
        run: |
          # ECSタスク定義の更新とデプロイ
          aws ecs update-service --cluster $ECS_CLUSTER --service $FRONTEND_SERVICE --force-new-deployment
          aws ecs update-service --cluster $ECS_CLUSTER --service $BACKEND_SERVICE --force-new-deployment
```

---

## 5. AWS環境構築

### 5.1 Terraform構成

```hcl
# infrastructure/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "hospital-crm-vpc"
  }
}

# サブネット
resource "aws_subnet" "public" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  map_public_ip_on_launch = true

  tags = {
    Name = "hospital-crm-public-${count.index + 1}"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "hospital-crm-private-${count.index + 1}"
  }
}

# RDS
resource "aws_db_instance" "main" {
  identifier = "hospital-crm-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  
  allocated_storage     = 20
  max_allocated_storage = 100
  storage_encrypted     = true
  
  db_name  = "hospital_crm"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "hospital-crm-final-snapshot"
  
  tags = {
    Name = "hospital-crm-database"
  }
}

# ElastiCache
resource "aws_elasticache_subnet_group" "main" {
  name       = "hospital-crm-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "main" {
  replication_group_id       = "hospital-crm-redis"
  description                = "Redis cluster for Hospital CRM"
  
  port                = 6379
  parameter_group_name = "default.redis7"
  
  num_cache_clusters         = 2
  node_type                 = "cache.t3.micro"
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
  
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  
  tags = {
    Name = "hospital-crm-redis"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "hospital-crm-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = {
    Name = "hospital-crm-cluster"
  }
}
```

### 5.2 ECSタスク定義

```json
{
  "family": "hospital-crm-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskExecutionRole",
  "taskRoleArn": "arn:aws:iam::ACCOUNT:role/ecsTaskRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT.dkr.ecr.REGION.amazonaws.com/hospital-crm-backend:latest",
      "portMappings": [
        {
          "containerPort": 3001,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DATABASE_URL",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/hospital-crm/database-url"
        },
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:ssm:REGION:ACCOUNT:parameter/hospital-crm/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/hospital-crm-backend",
          "awslogs-region": "ap-northeast-1",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": [
          "CMD-SHELL",
          "curl -f http://localhost:3001/health || exit 1"
        ],
        "interval": 30,
        "timeout": 5,
        "retries": 3
      }
    }
  ]
}
```

---

## 6. 本番環境設定

### 6.1 環境変数

```bash
# 本番環境変数（AWS Systems Manager Parameter Store）

# データベース
/hospital-crm/database-url = "postgresql://username:password@rds-endpoint:5432/hospital_crm"

# Redis
/hospital-crm/redis-url = "redis://elasticache-endpoint:6379"

# JWT
/hospital-crm/jwt-secret = "secure_random_string"
/hospital-crm/jwt-refresh-secret = "another_secure_random_string"

# 暗号化
/hospital-crm/encryption-key = "32_character_encryption_key"

# 外部サービス
/hospital-crm/aws-access-key-id = "AKIA..."
/hospital-crm/aws-secret-access-key = "..."
/hospital-crm/s3-bucket-name = "hospital-crm-files"

# 通知
/hospital-crm/smtp-host = "smtp.example.com"
/hospital-crm/smtp-user = "noreply@hospital-crm.com"
/hospital-crm/smtp-password = "smtp_password"
```

### 6.2 セキュリティ設定

```yaml
# security-group.yml
SecurityGroups:
  ALBSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ALB
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 80
          ToPort: 80
          CidrIp: 0.0.0.0/0
        - IpProtocol: tcp
          FromPort: 443
          ToPort: 443
          CidrIp: 0.0.0.0/0

  ECSSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for ECS tasks
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 3000
          ToPort: 3001
          SourceSecurityGroupId: !Ref ALBSecurityGroup

  RDSSecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for RDS
      VpcId: !Ref VPC
      SecurityGroupIngress:
        - IpProtocol: tcp
          FromPort: 5432
          ToPort: 5432
          SourceSecurityGroupId: !Ref ECSSecurityGroup
```

---

## 7. 監視・ログ設定

### 7.1 CloudWatch設定

```yaml
# cloudwatch.yml
Resources:
  LogGroup:
    Type: AWS::Logs::LogGroup
    Properties:
      LogGroupName: /ecs/hospital-crm
      RetentionInDays: 30

  CPUAlarm:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: hospital-crm-high-cpu
      AlarmDescription: High CPU utilization
      MetricName: CPUUtilization
      Namespace: AWS/ECS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
      AlarmActions:
        - !Ref SNSTopic

  DatabaseConnections:
    Type: AWS::CloudWatch::Alarm
    Properties:
      AlarmName: hospital-crm-db-connections
      MetricName: DatabaseConnections
      Namespace: AWS/RDS
      Statistic: Average
      Period: 300
      EvaluationPeriods: 2
      Threshold: 80
      ComparisonOperator: GreaterThanThreshold
```

### 7.2 Application Insights

```json
{
  "applicationInsights": {
    "instrumentationKey": "YOUR_INSTRUMENTATION_KEY",
    "enableAutoCollectRequests": true,
    "enableAutoCollectPerformance": true,
    "enableAutoCollectExceptions": true,
    "enableAutoCollectDependencies": true,
    "enableAutoCollectConsole": true,
    "enableUseDiskRetryCaching": true,
    "enableAutoCollectPreAggregatedMetrics": true
  }
}
```

---

## 8. バックアップ・災害復旧

### 8.1 自動バックアップ

```bash
#!/bin/bash
# scripts/backup.sh

# データベースバックアップ
pg_dump $DATABASE_URL > /backup/hospital-crm-$(date +%Y%m%d-%H%M%S).sql

# S3にアップロード
aws s3 cp /backup/hospital-crm-*.sql s3://hospital-crm-backups/db-backups/

# ローカルファイル削除（7日以上経過）
find /backup -name "hospital-crm-*.sql" -mtime +7 -delete
```

### 8.2 復旧手順

```bash
#!/bin/bash
# scripts/restore.sh

# バックアップファイルのダウンロード
aws s3 cp s3://hospital-crm-backups/db-backups/hospital-crm-20250729.sql /tmp/

# データベース復旧
psql $DATABASE_URL < /tmp/hospital-crm-20250729.sql

# アプリケーション再起動
aws ecs update-service --cluster hospital-crm-cluster --service hospital-crm-backend --force-new-deployment
```

---

## 9. スケーリング設定

### 9.1 Auto Scaling

```yaml
# autoscaling.yml
Resources:
  ServiceAutoScalingTarget:
    Type: AWS::ApplicationAutoScaling::ScalableTarget
    Properties:
      MaxCapacity: 10
      MinCapacity: 2
      ResourceId: !Sub service/${ClusterName}/${ServiceName}
      RoleARN: !Sub arn:aws:iam::${AWS::AccountId}:role/application-autoscaling-ecs-service
      ScalableDimension: ecs:service:DesiredCount
      ServiceNamespace: ecs

  ServiceScalingPolicy:
    Type: AWS::ApplicationAutoScaling::ScalingPolicy
    Properties:
      PolicyName: hospital-crm-scaling-policy
      PolicyType: TargetTrackingScaling
      ScalingTargetId: !Ref ServiceAutoScalingTarget
      TargetTrackingScalingPolicyConfiguration:
        PredefinedMetricSpecification:
          PredefinedMetricType: ECSServiceAverageCPUUtilization
        TargetValue: 70.0
```

---

## 10. 運用手順

### 10.1 デプロイ手順

1. **事前チェック**
   ```bash
   # ヘルスチェック
   curl -f https://api.hospital-crm.com/health
   
   # データベース接続確認
   psql $DATABASE_URL -c "SELECT 1;"
   ```

2. **デプロイ実行**
   ```bash
   # GitHub Actions経由
   git push origin main
   
   # 手動デプロイ
   ./scripts/deploy.sh production
   ```

3. **デプロイ後確認**
   ```bash
   # サービス状態確認
   aws ecs describe-services --cluster hospital-crm-cluster --services hospital-crm-backend
   
   # ログ確認
   aws logs tail /ecs/hospital-crm-backend --follow
   ```

### 10.2 トラブルシューティング

**よくある問題と対処法:**

1. **データベース接続エラー**
   ```bash
   # 接続確認
   psql $DATABASE_URL -c "SELECT version();"
   
   # セキュリティグループ確認
   aws ec2 describe-security-groups --group-ids sg-xxxxx
   ```

2. **メモリ不足**
   ```bash
   # タスク定義のメモリ増量
   aws ecs register-task-definition --cli-input-json file://task-definition.json
   ```

3. **SSL証明書エラー**
   ```bash
   # 証明書の確認・更新
   aws acm describe-certificate --certificate-arn arn:aws:acm:...
   ```

---

**このデプロイメントガイドに従い、段階的に環境を構築することで、安全で拡張性のあるHospital CRMシステムを運用できます。**