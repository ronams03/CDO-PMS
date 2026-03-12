import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate a unique reference number
export function generateReferenceNumber(prefix: string): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// Format date for display
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Format date and time for display
export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Format currency
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP'
  }).format(amount)
}

// Format number with commas
export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '-'
  return new Intl.NumberFormat('en-PH').format(num)
}

// Get initials from name
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

// Get full name
export function getFullName(firstName: string, middleName?: string | null, lastName?: string | null, suffix?: string | null): string {
  const parts = [firstName]
  if (middleName) parts.push(middleName.charAt(0) + '.')
  if (lastName) parts.push(lastName)
  if (suffix) parts.push(suffix)
  return parts.join(' ')
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Capitalize first letter
export function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

// Convert enum to title case
export function enumToTitle(text: string): string {
  return text.replace(/_/g, ' ').split(' ').map(capitalize).join(' ')
}

// Get status color
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Request Status
    PENDING: 'bg-yellow-100 text-yellow-800',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-800',
    COMPLETED: 'bg-green-100 text-green-800',
    // Complaint Status
    SUBMITTED: 'bg-yellow-100 text-yellow-800',
    ACKNOWLEDGED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-orange-100 text-orange-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
    // Permit Status
    DRAFT: 'bg-gray-100 text-gray-800',
    EXPIRED: 'bg-red-100 text-red-800',
    // Announcement Status
    PUBLISHED: 'bg-green-100 text-green-800',
    ARCHIVED: 'bg-gray-100 text-gray-800',
    // Priority
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    CRITICAL: 'bg-red-100 text-red-800'
  }
  return colors[status] || 'bg-gray-100 text-gray-800'
}

// Calculate days difference
export function daysDiff(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Check if date is past
export function isPast(date: Date | string): boolean {
  return new Date(date) < new Date()
}

// Debounce function
export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func.apply(this, args), wait)
  }
}

// Sleep function
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

// Slugify
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
