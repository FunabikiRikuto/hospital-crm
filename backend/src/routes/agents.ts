import express from 'express';
import { z } from 'zod';

const router = express.Router();

// エージェント作成スキーマ
const CreateAgentSchema = z.object({
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  wechatId: z.string().min(1),
  commissionRate: z.number().min(0).max(1),
  contractStartDate: z.string(),
  contractEndDate: z.string().optional()
});

// エージェント一覧取得
router.get('/', async (req, res) => {
  try {
    // TODO: データベースからエージェント一覧を取得
    const agents = [
      {
        id: 'agent-1',
        companyName: 'ABC医療ツーリズム株式会社',
        contactName: '田中 健一',
        email: 'tanaka@abc-medical.com',
        phone: '+81-3-1234-5678',
        wechatId: 'tanaka_abc',
        contractInfo: {
          commissionRate: 0.15,
          contractStartDate: '2024-01-01',
          contractEndDate: '2025-12-31'
        },
        performance: {
          totalCases: 45,
          completedCases: 38,
          totalRevenue: 125000000,
          averageRating: 4.8
        },
        status: 'active',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-12-15T10:30:00Z'
      }
    ];
    
    res.json({
      success: true,
      data: agents,
      total: agents.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agents'
    });
  }
});

// 新規エージェント登録
router.post('/', async (req, res) => {
  try {
    const validatedData = CreateAgentSchema.parse(req.body);
    
    const agentId = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const newAgent = {
      id: agentId,
      ...validatedData,
      contractInfo: {
        commissionRate: validatedData.commissionRate,
        contractStartDate: validatedData.contractStartDate,
        contractEndDate: validatedData.contractEndDate
      },
      performance: {
        totalCases: 0,
        completedCases: 0,
        totalRevenue: 0,
        averageRating: 0
      },
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // TODO: データベースに保存
    
    res.status(201).json({
      success: true,
      data: newAgent
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Validation error',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to create agent'
      });
    }
  }
});

// エージェント詳細取得
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // TODO: データベースからエージェント詳細を取得
    const agent = {
      id: id,
      companyName: 'ABC医療ツーリズム株式会社',
      // ... その他のフィールド
    };
    
    res.json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent details'
    });
  }
});

// エージェント情報更新
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // TODO: データベースでエージェント情報を更新
    
    res.json({
      success: true,
      data: {
        agentId: id,
        updatedAt: new Date().toISOString()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update agent'
    });
  }
});

// エージェント実績取得
router.get('/:id/performance', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    // TODO: 期間内の実績を集計
    const performance = {
      agentId: id,
      period: {
        start: startDate,
        end: endDate
      },
      totalCases: 10,
      completedCases: 8,
      totalRevenue: 25000000,
      totalCommission: 3750000,
      casesByStatus: {
        pending: 1,
        reviewing: 1,
        accepted: 0,
        rejected: 0,
        completed: 8
      }
    };
    
    res.json({
      success: true,
      data: performance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch agent performance'
    });
  }
});

export default router;