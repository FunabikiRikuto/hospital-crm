export interface Agent {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  wechatId: string;
  contractInfo: {
    commissionRate: number; // 手数料率（%）
    contractStartDate: string;
    contractEndDate?: string;
  };
  performance: {
    totalCases: number;
    completedCases: number;
    totalRevenue: number;
    averageRating: number;
  };
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentInput {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  wechatId: string;
  commissionRate: number;
  contractStartDate: string;
  contractEndDate?: string;
}

export interface UpdateAgentInput extends Partial<CreateAgentInput> {
  id: string;
  status?: 'active' | 'inactive' | 'suspended';
}