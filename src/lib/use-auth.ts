import React, { createContext, useContext } from 'react'

export type UserRole = 'ADMIN' | 'ASSESSOR' | 'VIEWER' | 'ENTERPRISE'

export interface User {
  id: string
  email: string
  role: UserRole
  name: string
}

export interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
