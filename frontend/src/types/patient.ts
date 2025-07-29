export interface Patient {
  id: string
  name: string
  nameOriginal?: string // 原語での名前
  age: number
  gender: 'male' | 'female' | 'other'
  nationality: string
  passportNumber: string
  email?: string
  phone?: string
  wechatId?: string
  companions?: number // 同行者数
  allergies?: string
  medicalHistory?: string
  createdAt: string
  updatedAt: string
}

export interface CreatePatientInput {
  name: string
  nameOriginal?: string
  age: number
  gender: Patient['gender']
  nationality: string
  passportNumber: string
  email?: string
  phone?: string
  wechatId?: string
  companions?: number
  allergies?: string
  medicalHistory?: string
}

export interface UpdatePatientInput extends Partial<CreatePatientInput> {
  id: string
}

export interface PatientFilters {
  search?: string
  nationality?: string
  gender?: Patient['gender']
  ageRange?: {
    min: number
    max: number
  }
  dateRange?: {
    start: string
    end: string
  }
}