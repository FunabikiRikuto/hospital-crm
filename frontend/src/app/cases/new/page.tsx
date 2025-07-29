'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'
import { CaseForm } from '@/components/forms/CaseForm'
import { Button } from '@/components/ui/Button'
import { ArrowLeft } from 'lucide-react'
import { useCases } from '@/hooks/useCases'
import { useI18n } from '@/hooks/useI18n'

export default function NewCasePage() {
  const router = useRouter()
  const { createCase } = useCases()
  const { t } = useI18n()

  const handleFormSubmit = async (formData: any) => {
    try {
      const newCase = await createCase(formData)
      router.push(`/cases/${newCase.id}`)
    } catch (error) {
      throw error // CaseFormで処理される
    }
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/cases">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                戻る
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">新規案件作成</h1>
              <p className="text-gray-600">新しい医療ツーリズム案件を登録してください</p>
            </div>
          </div>
        </div>

        {/* Case Form */}
        <CaseForm
          mode="create"
          onSubmit={handleFormSubmit}
          onCancel={() => router.push('/cases')}
        />
      </div>
    </ProtectedLayout>
  )
}