const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// APIクライアントの基本設定
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API request failed');
      }

      const data = await response.json();
      return data.data || data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // 案件関連API
  async getCases() {
    return this.request('/cases');
  }

  async getCase(id: string) {
    return this.request(`/cases/${id}`);
  }

  async createCase(data: any) {
    return this.request('/cases/receive', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCaseStatus(id: string, status: string, data?: any) {
    return this.request(`/cases/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, ...data }),
    });
  }

  async uploadAttachment(caseId: string, file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request(`/cases/${caseId}/attachments`, {
      method: 'POST',
      headers: {},
      body: formData,
    });
  }

  // エージェント関連API
  async getAgents() {
    return this.request('/agents');
  }

  async getAgent(id: string) {
    return this.request(`/agents/${id}`);
  }

  async createAgent(data: any) {
    return this.request('/agents', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAgent(id: string, data: any) {
    return this.request(`/agents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getAgentPerformance(id: string, startDate?: string, endDate?: string) {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return this.request(`/agents/${id}/performance?${params.toString()}`);
  }
}

// シングルトンインスタンス
export const api = new ApiClient(API_BASE_URL);

// エージェント向けの案件投稿用関数
export async function submitCaseFromAgent(caseData: {
  // 患者情報
  patientName: string;
  patientNameOriginal?: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  nationality: string;
  passportNumber: string;
  
  // 連絡先
  email?: string;
  phone?: string;
  wechatId?: string;
  patientWechatId?: string;
  
  // 診療情報
  treatmentType: string;
  hospitalName: string;
  department?: string;
  preferredDate: string;
  
  // 医療情報
  companions?: number;
  allergies?: string;
  medicalHistory?: string;
  chiefComplaint: string;
  
  // 金額・その他
  estimatedAmount: number;
  currency: 'JPY' | 'USD' | 'CNY' | 'KRW' | 'EUR';
  urgency: 'low' | 'medium' | 'high';
  description?: string;
  
  // エージェント情報
  agentId: string;
  agentName?: string;
  agentCompany?: string;
  agentContact?: string;
  
  // 添付ファイル
  attachments?: Array<{
    filename: string;
    fileType: string;
    url: string;
    size: number;
  }>;
}) {
  return api.createCase(caseData);
}