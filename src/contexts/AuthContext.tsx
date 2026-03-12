'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName: string | null
  suffix: string | null
  phone: string | null
  avatar: string | null
  role: 'SUPER_ADMIN' | 'LGU_ADMIN' | 'DEPARTMENT_HEAD' | 'STAFF' | 'BARANGAY_OFFICIAL' | 'CITIZEN'
  isActive: boolean
  departmentId: string | null
  barangayId: string | null
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
  hasPermission: (permission: string) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' }
      }

      setUser(data.user)
      return { success: true }
    } catch {
      return { success: false, error: 'An error occurred during login' }
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const refreshUser = async () => {
    await fetchUser()
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    const permissions: Record<string, string[]> = {
      SUPER_ADMIN: ['all'],
      LGU_ADMIN: [
        'manage_users', 'manage_departments', 'manage_barangays', 'manage_residents',
        'manage_requests', 'manage_complaints', 'manage_permits', 'manage_announcements',
        'view_reports', 'view_audit_logs',
      ],
      DEPARTMENT_HEAD: [
        'manage_residents', 'manage_requests', 'manage_complaints', 'manage_permits',
        'manage_announcements', 'view_reports',
      ],
      STAFF: [
        'manage_residents', 'manage_requests', 'manage_complaints', 'view_reports',
      ],
      BARANGAY_OFFICIAL: [
        'manage_residents', 'manage_requests', 'manage_complaints', 'manage_announcements', 'view_reports',
      ],
      CITIZEN: ['view_own_records', 'submit_requests', 'submit_complaints'],
    }

    const userPermissions = permissions[user.role] || []
    return userPermissions.includes('all') || userPermissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
