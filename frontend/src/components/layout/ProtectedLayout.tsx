'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from './Layout'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

export function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  // デモモードではリダイレクトしない
  useEffect(() => {
    // コメントアウト: デモモード用
    // if (!isLoading && !isAuthenticated) {
    //   router.push('/auth/login')
    // }
  }, [isAuthenticated, isLoading, router])

  // ローディング中
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  // デモモード: 常にレイアウトを表示
  return <Layout>{children}</Layout>
}