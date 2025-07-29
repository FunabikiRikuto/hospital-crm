import { User, LoginCredentials } from '@/types/auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

interface AuthResponse {
  user: User
  token: string
}

export class AuthService {
  private static TOKEN_KEY = 'hospital-crm-token'
  private static USER_KEY = 'hospital-crm-user'

  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('AuthService.login called with:', { 
      email: credentials.email, 
      password: credentials.password ? '***' : 'empty' 
    })

    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    console.log('Login API response status:', response.status)

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'サーバーエラー' }))
      console.error('Login API error:', error)
      throw new Error(error.message || 'ログインに失敗しました')
    }

    const data = await response.json()
    console.log('Login API success:', { user: data.user?.email, hasToken: !!data.token })
    
    // トークンとユーザー情報をローカルストレージに保存
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.TOKEN_KEY, data.token)
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user))
    }

    return data
  }

  static async logout(): Promise<void> {
    // サーバーにログアウトリクエストを送信（オプション）
    try {
      const token = this.getToken()
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      }
    } catch (error) {
      console.warn('Server logout failed:', error)
    }

    // ローカルストレージをクリア
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.TOKEN_KEY)
      localStorage.removeItem(this.USER_KEY)
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = this.getToken()
    if (!token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        this.logout()
        return null
      }

      const user = await response.json()
      
      // ユーザー情報を更新
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.USER_KEY, JSON.stringify(user))
      }

      return user
    } catch (error) {
      console.error('Failed to get current user:', error)
      this.logout()
      return null
    }
  }

  static getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(this.TOKEN_KEY)
  }

  static getStoredUser(): User | null {
    if (typeof window === 'undefined') return null
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  static isAuthenticated(): boolean {
    return !!this.getToken()
  }
}