export interface Billing {
  id: string;
  caseId: string;
  agentId: string;
  medicalFee: number;
  insuranceCovered: number;
  netAmount: number; // medicalFee - insuranceCovered
  commissionRate: number; // %
  commission: number; // netAmount * commissionRate
  paymentStatus: 'pending' | 'invoiced' | 'paid';
  invoiceNumber?: string;
  invoiceDate?: string;
  paymentDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlyInvoice {
  id: string;
  agentId: string;
  year: number;
  month: number;
  billings: Billing[];
  totalMedicalFee: number;
  totalCommission: number;
  invoiceNumber: string;
  status: 'draft' | 'sent' | 'paid';
  generatedAt: string;
  sentAt?: string;
  paidAt?: string;
}

export interface CreateBillingInput {
  caseId: string;
  medicalFee: number;
  insuranceCovered: number;
  notes?: string;
}