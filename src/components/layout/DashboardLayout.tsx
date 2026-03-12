'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard,
  Users,
  Building2,
  MapPin,
  FileText,
  AlertTriangle,
  Megaphone,
  FileCheck,
  Settings,
  Bell,
  LogOut,
  Menu,
  ChevronDown,
  Shield,
  UserCog,
  History,
  Calendar,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS } from '@/lib/constants'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  permission?: string
  roles?: string[]
}

const navItems: NavItem[] = [
  { title: 'Dashboard', href: '/', icon: LayoutDashboard },
  { title: 'User Management', href: '#users', icon: UserCog, permission: 'manage_users' },
  { title: 'Residents', href: '#residents', icon: Users, permission: 'manage_residents' },
  { title: 'Departments', href: '#departments', icon: Building2, permission: 'manage_departments' },
  { title: 'Barangays', href: '#barangays', icon: MapPin, permission: 'manage_barangays' },
  { title: 'Service Requests', href: '#requests', icon: FileText, permission: 'manage_requests' },
  { title: 'Complaints', href: '#complaints', icon: AlertTriangle, permission: 'manage_complaints' },
  { title: 'Permits & Licenses', href: '#permits', icon: FileCheck, permission: 'manage_permits' },
  { title: 'Announcements', href: '#announcements', icon: Megaphone, permission: 'manage_announcements' },
  { title: 'Appointments', href: '#appointments', icon: Calendar },
  { title: 'Audit Logs', href: '#audit-logs', icon: History, permission: 'view_audit_logs' },
  { title: 'Settings', href: '#settings', icon: Settings },
]

function getUserInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getRoleBadgeColor(role: string): string {
  const colors: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    LGU_ADMIN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    DEPARTMENT_HEAD: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    STAFF: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    BARANGAY_OFFICIAL: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
    CITIZEN: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  }
  return colors[role] || colors.CITIZEN
}

// Sidebar component defined outside
interface SidebarProps {
  mobile?: boolean
  filteredNavItems: NavItem[]
  pathname: string
  user: {
    firstName: string
    lastName: string
    role: string
    avatar?: string | null
  } | null
  onNavigate?: () => void
}

function Sidebar({ mobile = false, filteredNavItems, pathname, user, onNavigate }: SidebarProps) {
  return (
    <div className={cn('flex flex-col h-full', mobile ? '' : 'w-64')}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <Shield className="w-8 h-8 text-blue-600" />
        <div className="flex flex-col">
          <span className="font-bold text-lg">CDO LGU</span>
          <span className="text-xs text-muted-foreground">Management System</span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <nav className="space-y-1">
          {filteredNavItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>

      {/* User info at bottom */}
      {user && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="bg-blue-600 text-white">
                {getUserInitials(user.firstName, user.lastName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user.firstName} {user.lastName}
              </p>
              <Badge className={cn('text-xs', getRoleBadgeColor(user.role))}>
                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
              </Badge>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, hasPermission } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const filteredNavItems = navItems.filter(item => {
    if (!item.permission) return true
    if (user?.role === 'SUPER_ADMIN') return true
    return hasPermission(item.permission)
  })

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col border-r bg-white dark:bg-gray-800">
        <Sidebar 
          filteredNavItems={filteredNavItems} 
          pathname={pathname} 
          user={user} 
        />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar 
            mobile 
            filteredNavItems={filteredNavItems} 
            pathname={pathname} 
            user={user}
            onNavigate={() => setSidebarOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between h-16 px-4 border-b bg-white dark:bg-gray-800 lg:px-6">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Title */}
          <div className="hidden lg:block">
            <h1 className="text-lg font-semibold">Cagayan de Oro City</h1>
            <p className="text-sm text-muted-foreground">Local Government Unit Management System</p>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-blue-600 text-white text-sm">
                      {getUserInitials(user.firstName, user.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user.firstName}</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Users className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
