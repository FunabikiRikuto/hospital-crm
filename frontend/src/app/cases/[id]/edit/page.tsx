'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { CaseForm } from '@/components/forms/CaseForm'
import { Button } from '@/components/ui/Button'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { useCases } from '@/hooks/useCases'
import { useI18n } from '@/hooks/useI18n'
import type { Case } from '@/types/case'

export default function CaseEditPage() {
  const params = useParams()
  const router = useRouter()
  const { updateCase } = useCases()
  const { t } = useI18n()
  const [caseData, setCaseData] = useState<Case | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const caseId = params.id as string

  useEffect(() => {
    const fetchCaseData = async () => {
      try {
        setIsLoading(true)
        setError('')

        // ストレージから該当する案件を検索
        const { getCaseFromStorage } = await import('@/lib/storage')
        const foundCase = getCaseFromStorage(caseId)
        
        if (!foundCase) {
          throw new Error(t('messages.caseNotFound'))
        }
        
        setCaseData(foundCase)
      } catch (err) {
        setError(err instanceof Error ? err.message : t('error'))
      } finally {
        setIsLoading(false)
      }
    }

    if (caseId) {
      fetchCaseData()
    }
  }, [caseId, t])

  const handleSubmit = async (formData: any) => {
    try {
      const updatedCase = await updateCase(caseId, formData)
      router.push(`/cases/${updatedCase.id}`)
    } catch (error) {
      throw error // CaseFormで処理される
    }
  }

  const handleCancel = () => {
    router.push(`/cases/${caseId}`)
  }

  if (isLoading) {
    return (
      <ProtectedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
          <span className="ml-2 text-gray-600">読み込み中...</span>
        </div>
      </ProtectedLayout>
    )
  }

  if (error || !caseData) {
    return (
      <ProtectedLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href="/cases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                案件一覧へ戻る
              </Button>
            </Link>
          </div>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error || '案件が見つかりません'}
          </div>
        </div>
      </ProtectedLayout>
    )
  }

  // CaseFormに渡すためのデータ変換
  const initialData = {
    id: caseData.id,
    // 患者情報
    patientName: caseData.patientName,
    patientNameOriginal: caseData.patientNameOriginal,
    age: caseData.age,
    gender: caseData.gender,
    nationality: caseData.nationality,
    passportNumber: caseData.passportNumber,
    
    // 連絡先
    email: caseData.email,
    phone: caseData.phone,
    wechatId: caseData.wechatId,
    
    // 診療情報
    treatmentType: caseData.treatmentType,
    hospitalName: caseData.hospitalName,
    doctorName: caseData.doctorName,
    department: caseData.department,
    preferredDate: caseData.preferredDate,
    confirmedDate: caseData.confirmedDate,
    
    // 医療情報
    companions: caseData.companions,
    allergies: caseData.allergies,
    medicalHistory: caseData.medicalHistory,
    
    // 金額・その他
    estimatedAmount: caseData.estimatedAmount,
    confirmedAmount: caseData.confirmedAmount,
    currency: caseData.currency,
    urgency: caseData.urgency,
    
    // エージェント情報
    agentName: caseData.agentName,
    agentCompany: caseData.agentCompany,
    agentContact: caseData.agentContact,
    
    // メモ・説明
    description: caseData.description,
    requirements: caseData.requirements,
    hospitalNotes: caseData.hospitalNotes,
    rejectionReason: caseData.rejectionReason,
    
    // 案件管理
    status: caseData.status,
    assignedTo: caseData.assignedTo,
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href={`/cases/${caseId}`}>
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              詳細へ戻る
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">案件編集</h1>
            <p className="text-gray-600">案件ID: {caseId} • {caseData.treatmentType}</p>
          </div>
        </div>

        {/* Edit Form */}
        <CaseForm
          initialData={initialData}
          mode="edit"
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </ProtectedLayout>
  )
}