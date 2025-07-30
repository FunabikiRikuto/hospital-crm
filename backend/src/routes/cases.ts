import express from 'express';
import { z } from 'zod';

const router = express.Router();

// 案件受信用のスキーマ（エージェントからの投稿用）
const CreateCaseSchema = z.object({
  // 患者情報
  patientName: z.string().min(1),
  patientNameOriginal: z.string().optional(), // 中国語等の原語名
  age: z.number().int().min(0).max(150),
  gender: z.enum(['male', 'female', 'other']),
  nationality: z.string().min(1),
  passportNumber: z.string().min(1),
  
  // 連絡先
  email: z.string().email().optional(),
  phone: z.string().optional(),
  wechatId: z.string().optional(),
  patientWechatId: z.string().optional(),
  
  // 診療情報
  treatmentType: z.string().min(1),
  hospitalName: z.string().min(1),
  department: z.string().optional(),
  preferredDate: z.string(),
  
  // 医療情報
  companions: z.number().int().min(0).optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  chiefComplaint: z.string().min(1),
  
  // 金額・その他
  estimatedAmount: z.number().min(0),
  currency: z.enum(['JPY', 'USD', 'CNY', 'KRW', 'EUR']),
  urgency: z.enum(['low', 'medium', 'high']),
  description: z.string().optional(),
  
  // エージェント情報
  agentId: z.string().min(1),
  agentName: z.string().optional(),
  agentCompany: z.string().optional(),
  agentContact: z.string().optional(),
  
  // 添付ファイル
  attachments: z.array(z.object({
    filename: z.string(),
    fileType: z.string(),
    url: z.string().url(),
    size: z.number()
  })).optional()
});

// 案件一覧取得
router.get('/', async (req, res) => {
  try {
    // TODO: データベースから案件一覧を取得
    const cases = [
      {
        id: 'case-1',
        patientName: '山田太郎',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
    ];
    
    res.json({
      success: true,
      data: cases,
      total: cases.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cases'
    });
  }
});

// 新規案件受信（エージェントからの投稿）
router.post('/receive', async (req, res) => {
  try {
    // リクエストボディのバリデーション
    const validatedData = CreateCaseSchema.parse(req.body);
    
    // 案件IDを生成
    const caseId = `case-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 案件データを作成
    const newCase = {
      id: caseId,
      ...validatedData,
      status: 'pending', // 新規受信は pending
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'agent-api'
    };
    
    // TODO: データベースに保存
    
    // TODO: 病院スタッフに通知を送信
    // - メール通知
    // - システム内通知
    // - WeChat通知（設定されている場合）
    
    // レスポンス
    res.status(201).json({
      success: true,
      data: {
        caseId: caseId,
        status: 'pending',
        message: '案件を受け付けました。病院スタッフが確認後、ご連絡いたします。'
      }
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      console.error('Case creation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create case'
      });
    }
  }
});

// 案件詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: データベースから案件詳細を取得
    const caseData = {
      id: id,
      patientName: '山田太郎',
      status: 'pending',
      // ... その他のフィールド
    };
    
    res.json({
      success: true,
      data: caseData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case details'
    });
  }
});

// 案件ステータス更新
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comment, quote, requiredDocuments } = req.body;
    
    // TODO: データベースで案件ステータスを更新
    
    // TODO: エージェントに通知を送信
    // - ステータス変更通知
    // - 必要に応じて追加情報要求
    
    res.json({
      success: true,
      data: {
        caseId: id,
        status: status,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update case status'
    });
  }
});

// ファイルアップロード
router.post('/:id/attachments', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: ファイルアップロード処理
    // - S3等のストレージにアップロード
    // - データベースにファイル情報を保存
    
    res.json({
      success: true,
      data: {
        attachmentId: 'att-' + Date.now(),
        url: 'https://example.com/file.pdf'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to upload attachment'
    });
  }
});

export default router;