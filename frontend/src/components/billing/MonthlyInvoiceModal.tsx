'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { X, FileText, Download, Calendar, DollarSign, Building } from 'lucide-react'
import type { Billing, MonthlyInvoice } from '@/types/billing'
import type { Agent } from '@/types/agent'
import type { Case } from '@/types/case'

interface MonthlyInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  month: string
  agentId?: string
  billings: Billing[]
  agents: Agent[]
  cases: Case[]
}

export function MonthlyInvoiceModal({
  isOpen,
  onClose,
  month,
  agentId,
  billings,
  agents,
  cases
}: MonthlyInvoiceModalProps) {
  const [selectedAgent, setSelectedAgent] = useState<string>(agentId || '')
  const [invoiceData, setInvoiceData] = useState<{
    agent: Agent | null
    billings: Billing[]
    totalAmount: number
    cases: Array<Case & { billing: Billing }>
  } | null>(null)

  useEffect(() => {
    if (selectedAgent && isOpen) {
      const agent = agents.find(a => a.id === selectedAgent)
      if (!agent) return

      // 選択されたエージェントの請求データを抽出
      const agentBillings = billings.filter(b => b.agentId === selectedAgent)
      
      // 案件情報と請求情報を結合
      const casesWithBilling = agentBillings
        .map(billing => {
          const caseData = cases.find(c => c.id === billing.caseId)
          return caseData ? { ...caseData, billing } : null
        })
        .filter((item): item is Case & { billing: Billing } => item !== null)

      const totalAmount = agentBillings.reduce((sum, b) => sum + b.commission, 0)

      setInvoiceData({
        agent,
        billings: agentBillings,
        totalAmount,
        cases: casesWithBilling
      })
    }
  }, [selectedAgent, billings, agents, cases, isOpen])

  const formatCurrency = (amount: number) => {
    return `¥${amount.toLocaleString()}`
  }

  const handleGenerateInvoice = () => {
    if (!invoiceData) return

    // 請求書番号を生成
    const invoiceNumber = `INV-${month.replace('-', '')}-${selectedAgent.slice(-4).toUpperCase()}`
    
    // TODO: PDFを生成してダウンロード
    alert(`請求書 ${invoiceNumber} を生成します`)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold">月次請求書生成</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* エージェント選択 */}
          <div className="mb-6">
            <Label htmlFor="agent-select">エージェント選択</Label>
            <select
              id="agent-select"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              className="w-full mt-1 h-10 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">エージェントを選択してください</option>
              {agents.map(agent => (
                <option key={agent.id} value={agent.id}>
                  {agent.companyName} ({agent.contactName})
                </option>
              ))}
            </select>
          </div>

          {/* 請求書プレビュー */}
          {invoiceData && (
            <div className="space-y-6">
              {/* 請求書ヘッダー */}
              <Card>
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>請求書</CardTitle>
                      <CardDescription>
                        請求期間: {month}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">請求日</p>
                      <p className="font-medium">{new Date().toLocaleDateString('ja-JP')}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-6">
                    {/* 請求元（病院） */}
                    <div>
                      <h4 className="font-semibold mb-2">請求元</h4>
                      <p className="text-sm text-gray-600">○○病院</p>
                      <p className="text-sm text-gray-600">〒100-0001</p>
                      <p className="text-sm text-gray-600">東京都千代田区...</p>
                      <p className="text-sm text-gray-600">TEL: 03-1234-5678</p>
                    </div>

                    {/* 請求先（エージェント） */}
                    <div>
                      <h4 className="font-semibold mb-2">請求先</h4>
                      <p className="text-sm">{invoiceData.agent?.companyName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">担当: {invoiceData.agent?.contactName || 'N/A'}</p>
                      <p className="text-sm text-gray-600">TEL: {invoiceData.agent?.phone || 'N/A'}</p>
                      <p className="text-sm text-gray-600">Email: {invoiceData.agent?.email || 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 請求明細 */}
              <Card>
                <CardHeader>
                  <CardTitle>請求明細</CardTitle>
                  <CardDescription>
                    手数料率: {(invoiceData.agent?.contractInfo.commissionRate ? invoiceData.agent.contractInfo.commissionRate * 100 : 0).toFixed(0)}%
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 text-sm font-medium">診療日</th>
                          <th className="text-left p-3 text-sm font-medium">患者名</th>
                          <th className="text-left p-3 text-sm font-medium">治療内容</th>
                          <th className="text-right p-3 text-sm font-medium">診療費</th>
                          <th className="text-right p-3 text-sm font-medium">手数料</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoiceData.cases.map((caseWithBilling) => (
                          <tr key={caseWithBilling.id} className="border-b">
                            <td className="p-3 text-sm">
                              {caseWithBilling.confirmedDate 
                                ? new Date(caseWithBilling.confirmedDate).toLocaleDateString('ja-JP')
                                : '-'
                              }
                            </td>
                            <td className="p-3 text-sm">{caseWithBilling.patientName}</td>
                            <td className="p-3 text-sm">{caseWithBilling.treatmentType}</td>
                            <td className="p-3 text-sm text-right">
                              {formatCurrency(caseWithBilling.billing.medicalFee)}
                            </td>
                            <td className="p-3 text-sm text-right font-medium">
                              {formatCurrency(caseWithBilling.billing.commission)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={4} className="p-3 text-right font-semibold">
                            請求額合計
                          </td>
                          <td className="p-3 text-right text-lg font-bold text-green-600">
                            {formatCurrency(invoiceData.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>

              {/* 支払い情報 */}
              <Card>
                <CardHeader>
                  <CardTitle>お支払い情報</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">支払期限:</span> {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString('ja-JP')}</p>
                    <p><span className="font-medium">振込先:</span> ○○銀行 △△支店 普通 1234567</p>
                    <p><span className="font-medium">口座名義:</span> ○○病院</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button 
            onClick={handleGenerateInvoice}
            disabled={!invoiceData || invoiceData.cases.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            請求書を生成
          </Button>
        </div>
      </div>
    </div>
  )
}