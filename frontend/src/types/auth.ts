export interface User {
  id: string
  email: string
  name: string
  role: 'hospital_admin' | 'hospital_staff' | 'agent' | 'system_admin'
  hospitalId?: string
  agentId?: string
  createdAt: string
  updatedAt: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  role: User['role']
  hospitalId?: string
  agentId?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  register: (data: RegisterData) => Promise<void>
}