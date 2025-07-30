export interface Comment {
  id: string
  caseId: string
  userId: string
  userName: string
  userRole: 'hospital' | 'agent'
  content: string
  createdAt: string
  updatedAt?: string
  isInternal: boolean // 病院内部メモか、エージェントと共有するコメントか
}

export interface CreateCommentInput {
  caseId: string
  content: string
  isInternal: boolean
}

export interface UpdateCommentInput {
  id: string
  content: string
}