import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from './db'
import { User, UserRole } from '@prisma/client'

const JWT_SECRET = process.env.JWT_SECRET || 'cdo-lgu-management-system-secret-key-2024'
const JWT_EXPIRES_IN = '7d'
const COOKIE_NAME = 'cdo_lgu_auth'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName: string | null
  suffix: string | null
  phone: string | null
  avatar: string | null
  role: UserRole
  isActive: boolean
  departmentId: string | null
  barangayId: string | null
}

export interface JWTPayload {
  userId: string
  email: string
  role: UserRole
  iat: number
  exp: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// Set auth cookie
export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

// Clear auth cookie
export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// Get current user from cookie
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value

    if (!token) return null

    const payload = verifyToken(token)
    if (!payload) return null

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        suffix: true,
        phone: true,
        avatar: true,
        role: true,
        isActive: true,
        departmentId: true,
        barangayId: true,
      },
    })

    if (!user || !user.isActive) return null

    return user
  } catch {
    return null
  }
}

// Login function
export async function loginUser(email: string, password: string): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      return { success: false, error: 'Invalid email or password' }
    }

    if (!user.isActive) {
      return { success: false, error: 'Account is deactivated. Please contact administrator.' }
    }

    const isValidPassword = await verifyPassword(password, user.password)
    if (!isValidPassword) {
      return { success: false, error: 'Invalid email or password' }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    await setAuthCookie(token)

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      suffix: user.suffix,
      phone: user.phone,
      avatar: user.avatar,
      role: user.role,
      isActive: user.isActive,
      departmentId: user.departmentId,
      barangayId: user.barangayId,
    }

    return { success: true, user: authUser }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
}

// Logout function
export async function logoutUser(): Promise<void> {
  await clearAuthCookie()
}

// Role-based access control
export const PERMISSIONS = {
  // Super Admin - Full access
  SUPER_ADMIN: {
    canManageUsers: true,
    canManageRoles: true,
    canManageDepartments: true,
    canManageBarangays: true,
    canManageResidents: true,
    canManageRequests: true,
    canManageComplaints: true,
    canManagePermits: true,
    canManageAnnouncements: true,
    canViewReports: true,
    canViewAuditLogs: true,
    canManageSettings: true,
  },
  // LGU Admin - Most access except system settings
  LGU_ADMIN: {
    canManageUsers: true,
    canManageRoles: false,
    canManageDepartments: true,
    canManageBarangays: true,
    canManageResidents: true,
    canManageRequests: true,
    canManageComplaints: true,
    canManagePermits: true,
    canManageAnnouncements: true,
    canViewReports: true,
    canViewAuditLogs: true,
    canManageSettings: false,
  },
  // Department Head - Department-level access
  DEPARTMENT_HEAD: {
    canManageUsers: false,
    canManageRoles: false,
    canManageDepartments: false,
    canManageBarangays: false,
    canManageResidents: true,
    canManageRequests: true,
    canManageComplaints: true,
    canManagePermits: true,
    canManageAnnouncements: true,
    canViewReports: true,
    canViewAuditLogs: false,
    canManageSettings: false,
  },
  // Staff - Limited access
  STAFF: {
    canManageUsers: false,
    canManageRoles: false,
    canManageDepartments: false,
    canManageBarangays: false,
    canManageResidents: true,
    canManageRequests: true,
    canManageComplaints: true,
    canManagePermits: false,
    canManageAnnouncements: false,
    canViewReports: true,
    canViewAuditLogs: false,
    canManageSettings: false,
  },
  // Barangay Official - Barangay-level access
  BARANGAY_OFFICIAL: {
    canManageUsers: false,
    canManageRoles: false,
    canManageDepartments: false,
    canManageBarangays: false,
    canManageResidents: true,
    canManageRequests: true,
    canManageComplaints: true,
    canManagePermits: false,
    canManageAnnouncements: true,
    canViewReports: true,
    canViewAuditLogs: false,
    canManageSettings: false,
  },
  // Citizen - Limited access
  CITIZEN: {
    canManageUsers: false,
    canManageRoles: false,
    canManageDepartments: false,
    canManageBarangays: false,
    canManageResidents: false,
    canManageRequests: false,
    canManageComplaints: false,
    canManagePermits: false,
    canManageAnnouncements: false,
    canViewReports: false,
    canViewAuditLogs: false,
    canManageSettings: false,
  },
} as const

export type Permission = keyof typeof PERMISSIONS.SUPER_ADMIN

export function hasPermission(role: UserRole, permission: Permission): boolean {
  const rolePermissions = PERMISSIONS[role as keyof typeof PERMISSIONS]
  if (!rolePermissions) return false
  return rolePermissions[permission] === true
}

export function canAccessRole(updaterRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy: UserRole[] = [
    'SUPER_ADMIN',
    'LGU_ADMIN',
    'DEPARTMENT_HEAD',
    'STAFF',
    'BARANGAY_OFFICIAL',
    'CITIZEN',
  ]
  
  const updaterIndex = roleHierarchy.indexOf(updaterRole)
  const targetIndex = roleHierarchy.indexOf(targetRole)
  
  // Can only manage users with roles lower than your own
  return updaterIndex < targetIndex
}
