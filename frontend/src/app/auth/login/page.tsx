'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Eye, EyeOff, LogIn, Copy, Check } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedField, setCopiedField] = useState<string | null>(null)

  const { login } = useAuth()
  const router = useRouter()

  // デモアカウント情報
  const demoAccounts = [
    {
      type: '病院管理者',
      email: 'admin@hospital.com',
      password: 'password123',
      description: '全機能にアクセス可能'
    },
    {
      type: 'エージェント',
      email: 'agent@travel.com',
      password: 'password123',
      description: '患者情報登録・案件確認'
    },
    {
      type: '病院スタッフ',
      email: 'staff@hospital.com',
      password: 'password123',
      description: '案件管理・患者情報閲覧'
    }
  ]

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const fillDemoAccount = (account: typeof demoAccounts[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await login({ email, password })
      router.push('/') // ダッシュボードにリダイレクト
    } catch (err) {
      console.error('Login failed:', err)
      
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('ログインに失敗しました。もう一度お試しください。')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* ヘッダー */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Hospital CRM
          </h1>
          <h2 className="text-xl font-semibold text-gray-900">
            システムにログイン
          </h2>
          <p className="text-gray-600 mt-2">
            医療ツーリズム向けCRMシステム
          </p>
        </div>

        {/* ログインフォーム */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <LogIn className="h-5 w-5 mr-2 text-green-600" />
              ログイン
            </CardTitle>
            <CardDescription>
              アカウント情報を入力してください
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* エラーメッセージ */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                  {error}
                </div>
              )}

              {/* メールアドレス */}
              <Input
                label="メールアドレス"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                required
                disabled={isLoading}
              />

              {/* パスワード */}
              <div className="relative">
                <Input
                  label="パスワード"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="パスワードを入力"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>

              {/* ログインボタン */}
              <Button
                type="submit"
                className="w-full"
                loading={isLoading}
                disabled={isLoading}
              >
                {isLoading ? 'ログイン中...' : 'ログイン'}
              </Button>
            </form>

            {/* デモ用アカウント情報 */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="text-sm font-medium text-blue-800 mb-3">
                デモアカウント
              </h3>
              <div className="space-y-3">
                {demoAccounts.map((account, index) => (
                  <div key={index} className="bg-white p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-blue-800">{account.type}</h4>
                        <p className="text-xs text-gray-600">{account.description}</p>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fillDemoAccount(account)}
                        className="text-xs"
                      >
                        使用
                      </Button>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Email:</span>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {account.email}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(account.email, `email-${index}`)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedField === `email-${index}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Password:</span>
                        <div className="flex items-center space-x-2">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                            {account.password}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(account.password, `password-${index}`)}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            {copiedField === `password-${index}` ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-gray-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* フッター */}
        <div className="text-center text-sm text-gray-500">
          <p>&copy; 2025 株式会社yolidoli. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}