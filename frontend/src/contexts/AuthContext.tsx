'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, LoginCredentials, AuthContextType } from '@/types/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!token

  // デモモード: 自動的に認証済み状態にする
  useEffect(() => {
    const initializeAuth = async () => {
      // デモユーザーを自動設定
      const demoUser: User = {
        id: 'demo-user',
        email: 'demo@hospital-crm.com',
        name: 'デモユーザー',
        role: 'system_admin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setUser(demoUser)
      setToken('demo-token')
      setIsLoading(false)
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    // デモモード: 任意の認証情報でログイン成功
    setIsLoading(true)
    
    const demoUser: User = {
      id: 'demo-user',
      email: credentials.email,
      name: 'デモユーザー',
      role: 'system_admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setTimeout(() => {
      setUser(demoUser)
      setToken('demo-token')
      setIsLoading(false)
    }, 500) // ローディング感を演出
  }

  const logout = async () => {
    // デモモード: 簡単なログアウト
    setIsLoading(true)
    setTimeout(() => {
      setUser(null)
      setToken(null)
      setIsLoading(false)
    }, 300)
  }

  const register = async () => {
    // 登録機能は将来実装
    throw new Error('Registration not implemented yet')
  }

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
    register,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}