'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { AlertTriangle, FileText } from 'lucide-react'

interface Patient {
  allergies?: string
  medicalHistory?: string
}

interface PatientMedicalInfoProps {
  patient: Patient
}

export function PatientMedicalInfo({ patient }: PatientMedicalInfoProps) {
  const hasMedicalInfo = patient.allergies || patient.medicalHistory

  if (!hasMedicalInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2 text-green-600" />
            医療情報
          </CardTitle>
          <CardDescription>
            診療に関する重要な情報
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">医療情報が登録されていません</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-green-600" />
          医療情報
        </CardTitle>
        <CardDescription>
          診療に関する重要な情報
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {patient.allergies && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h3 className="text-sm font-medium text-gray-900">アレルギー・食事制限</h3>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 whitespace-pre-wrap">
                {patient.allergies}
              </p>
            </div>
          </div>
        )}

        {patient.medicalHistory && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <h3 className="text-sm font-medium text-gray-900">既往歴・現病歴</h3>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 whitespace-pre-wrap">
                {patient.medicalHistory}
              </p>
            </div>
          </div>
        )}

        {patient.allergies && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm font-medium text-yellow-800">重要な注意事項</p>
            </div>
            <p className="text-sm text-yellow-700">
              この患者にはアレルギー情報が登録されています。診療前に必ず確認してください。
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}