'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginForm } from '@/components/auth/LoginForm'
import { StatCard } from '@/components/dashboard/StatCard'
import { 
  RequestsChart, 
  ComplaintsChart, 
  MonthlyTrendsChart, 
  BarangayChart 
} from '@/components/dashboard/DashboardCharts'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  FileCheck, 
  Building2, 
  MapPin,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  Plus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Loader2,
  RefreshCw,
  UserCog,
  Shield,
  Megaphone,
  Calendar,
  History,
  Settings,
} from 'lucide-react'
import { api } from '@/hooks/use-api'
import { ROLE_LABELS, STATUS_LABELS, COMPLAINT_CATEGORIES } from '@/lib/constants'
import { formatDistanceToNow, format } from 'date-fns'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Types
interface DashboardData {
  counts: {
    residents: number
    users: number
    barangays: number
    departments: number
    requests: number
    pendingRequests: number
    complaints: number
    pendingComplaints: number
    permits: number
    activePermits: number
  }
  recent: {
    requests: any[]
    complaints: any[]
    announcements: any[]
  }
  charts: {
    requestsByStatus: { status: string; count: number }[]
    complaintsByStatus: { status: string; count: number }[]
    residentsByBarangay: { barangayName: string; count: number }[]
    monthlyTrends: { month: string; count: number }[]
  }
}

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  middleName: string | null
  role: string
  isActive: boolean
  department?: { name: string }
  barangay?: { name: string }
  createdAt: string
  lastLoginAt?: string
}

interface Resident {
  id: string
  firstName: string
  lastName: string
  middleName: string | null
  gender?: string
  civilStatus?: string
  phone?: string
  email?: string
  barangay?: { name: string }
  createdAt: string
}

interface ServiceRequest {
  id: string
  referenceNumber: string
  purpose: string
  status: string
  priority: string
  service?: { name: string }
  creator?: { firstName: string; lastName: string }
  createdAt: string
}

interface Complaint {
  id: string
  referenceNumber: string
  title: string
  category: string
  status: string
  priority: string
  barangay?: { name: string }
  creator?: { firstName: string; lastName: string }
  createdAt: string
}

// Main Dashboard Content Component
function DashboardContent() {
  const { user, loading: authLoading, logout, hasPermission } = useAuth()
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeModule, setActiveModule] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    try {
      const data = await api.get<{ dashboard: DashboardData }>('/dashboard')
      setDashboard(data.dashboard)
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchDashboard()
    }
  }, [user, fetchDashboard])

  // Handle hash navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1) || null
      setActiveModule(hash)
    }
    
    handleHashChange()
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  // Render specific module based on hash
  const renderModule = () => {
    switch (activeModule) {
      case 'users':
        return <UsersModule />
      case 'residents':
        return <ResidentsModule />
      case 'departments':
        return <DepartmentsModule />
      case 'barangays':
        return <BarangaysModule />
      case 'requests':
        return <RequestsModule />
      case 'complaints':
        return <ComplaintsModule />
      case 'permits':
        return <PermitsModule />
      case 'announcements':
        return <AnnouncementsModule />
      case 'audit-logs':
        return <AuditLogsModule />
      case 'settings':
        return <SettingsModule />
      default:
        return renderDashboard()
    }
  }

  const renderDashboard = () => {
    if (loading || !dashboard) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {user.firstName}! Here&apos;s an overview of your LGU system.
            </p>
          </div>
          <Button onClick={fetchDashboard} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Residents"
            value={dashboard.counts.residents.toLocaleString()}
            icon={Users}
            description="Registered residents"
          />
          <StatCard
            title="Service Requests"
            value={dashboard.counts.requests}
            icon={FileText}
            description={`${dashboard.counts.pendingRequests} pending`}
            variant={dashboard.counts.pendingRequests > 10 ? 'warning' : 'default'}
          />
          <StatCard
            title="Complaints"
            value={dashboard.counts.complaints}
            icon={AlertTriangle}
            description={`${dashboard.counts.pendingComplaints} pending`}
            variant={dashboard.counts.pendingComplaints > 5 ? 'danger' : 'default'}
          />
          <StatCard
            title="Active Permits"
            value={dashboard.counts.activePermits}
            icon={FileCheck}
            description={`of ${dashboard.counts.permits} total`}
            variant="success"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Users"
            value={dashboard.counts.users}
            icon={UserCog}
            description="Active system users"
          />
          <StatCard
            title="Barangays"
            value={dashboard.counts.barangays}
            icon={MapPin}
            description="Registered barangays"
          />
          <StatCard
            title="Departments"
            value={dashboard.counts.departments}
            icon={Building2}
            description="Active departments"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RequestsChart data={dashboard.charts.requestsByStatus} />
          <ComplaintsChart data={dashboard.charts.complaintsByStatus} />
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrendsChart data={dashboard.charts.monthlyTrends} />
          <BarangayChart data={dashboard.charts.residentsByBarangay} />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentActivity
            title="Recent Requests"
            activities={dashboard.recent.requests.map(r => ({
              id: r.id,
              type: 'request' as const,
              title: r.service?.name || 'Service Request',
              description: r.purpose,
              status: r.status,
              createdAt: r.createdAt,
              user: r.creator,
            }))}
          />
          <RecentActivity
            title="Recent Complaints"
            activities={dashboard.recent.complaints.map(c => ({
              id: c.id,
              type: 'complaint' as const,
              title: c.title,
              description: c.barangay?.name,
              status: c.status,
              createdAt: c.createdAt,
              user: c.creator,
            }))}
          />
        </div>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Megaphone className="w-5 h-5" />
              Recent Announcements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.recent.announcements.map((a: any) => (
                <div key={a.id} className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium">{a.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{a.content}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      By {a.author?.firstName} {a.author?.lastName} • {formatDistanceToNow(new Date(a.publishedAt || a.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
              {dashboard.recent.announcements.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No announcements</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <DashboardLayout>
      {renderModule()}
    </DashboardLayout>
  )
}

// Users Module Component
function UsersModule() {
  const { hasPermission } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ users: User[]; total: number }>('/users', { 
        search, 
        page: page.toString() 
      })
      setUsers(data.users)
      setTotal(data.total)
    } catch (error) {
      toast.error('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  if (!hasPermission('manage_users')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view this module.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage system users and their roles</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{u.firstName} {u.lastName}</p>
                        {u.middleName && <p className="text-xs text-muted-foreground">{u.middleName}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}</Badge>
                    </TableCell>
                    <TableCell>{u.department?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={u.isActive ? 'default' : 'secondary'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Residents Module Component
function ResidentsModule() {
  const { hasPermission } = useAuth()
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchResidents = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ residents: Resident[]; total: number }>('/residents', {
        search,
        page: page.toString(),
      })
      setResidents(data.residents)
      setTotal(data.total)
    } catch (error) {
      toast.error('Failed to fetch residents')
    } finally {
      setLoading(false)
    }
  }, [search, page])

  useEffect(() => {
    fetchResidents()
  }, [fetchResidents])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Resident Management</h1>
          <p className="text-muted-foreground">Manage resident records and information</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Resident
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search residents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Civil Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Barangay</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {residents.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{r.firstName} {r.lastName}</p>
                        {r.middleName && <p className="text-xs text-muted-foreground">{r.middleName}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{r.gender || '-'}</TableCell>
                    <TableCell>{r.civilStatus || '-'}</TableCell>
                    <TableCell>
                      <div>
                        {r.phone && <p className="text-sm">{r.phone}</p>}
                        {r.email && <p className="text-xs text-muted-foreground">{r.email}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{r.barangay?.name || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Departments Module Component
function DepartmentsModule() {
  const [departments, setDepartments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchDepartments = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ departments: any[] }>('/departments')
      setDepartments(data.departments)
    } catch (error) {
      toast.error('Failed to fetch departments')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDepartments()
  }, [fetchDepartments])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Department Management</h1>
          <p className="text-muted-foreground">Manage city departments and offices</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Department
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : (
          departments.map((dept) => (
            <Card key={dept.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{dept.shortName}</span>
                  <Badge variant={dept.isActive ? 'default' : 'secondary'}>
                    {dept.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </CardTitle>
                <CardDescription>{dept.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{dept.description || 'No description'}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Users: {dept._count?.users || 0}</span>
                  <span className="text-muted-foreground">Services: {dept._count?.services || 0}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

// Barangays Module Component
function BarangaysModule() {
  const [barangays, setBarangays] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const fetchBarangays = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ barangays: any[] }>('/barangays', { search })
      setBarangays(data.barangays)
    } catch (error) {
      toast.error('Failed to fetch barangays')
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    fetchBarangays()
  }, [fetchBarangays])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Barangay Management</h1>
          <p className="text-muted-foreground">Manage barangays and their information</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Barangay
        </Button>
      </div>

      <Card>
        <CardHeader>
          <Input
            placeholder="Search barangays..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>Population</TableHead>
                  <TableHead>Residents</TableHead>
                  <TableHead>Captain</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {barangays.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono">{b.code}</TableCell>
                    <TableCell className="font-medium">{b.name}</TableCell>
                    <TableCell>{b.district || '-'}</TableCell>
                    <TableCell>{b.population?.toLocaleString() || '-'}</TableCell>
                    <TableCell>{b._count?.residents || 0}</TableCell>
                    <TableCell>{b.captainName || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Service Requests Module Component
function RequestsModule() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchRequests = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { search, page: page.toString() }
      if (statusFilter) params.status = statusFilter
      
      const data = await api.get<{ requests: ServiceRequest[]; total: number }>('/requests', params)
      setRequests(data.requests)
      setTotal(data.total)
    } catch (error) {
      toast.error('Failed to fetch requests')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, page])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      COMPLETED: 'bg-emerald-100 text-emerald-800',
      CANCELLED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Requests</h1>
          <p className="text-muted-foreground">Manage and process service requests</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="UNDER_REVIEW">Under Review</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-sm">{r.referenceNumber}</TableCell>
                    <TableCell>{r.service?.name || '-'}</TableCell>
                    <TableCell className="max-w-xs truncate">{r.purpose}</TableCell>
                    <TableCell>
                      {r.creator ? `${r.creator.firstName} ${r.creator.lastName}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(r.status)}>
                        {STATUS_LABELS.REQUEST[r.status as keyof typeof STATUS_LABELS.REQUEST] || r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{r.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Complaints Module Component
function ComplaintsModule() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const fetchComplaints = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { search, page: page.toString() }
      if (statusFilter) params.status = statusFilter
      if (categoryFilter) params.category = categoryFilter
      
      const data = await api.get<{ complaints: Complaint[]; total: number }>('/complaints', params)
      setComplaints(data.complaints)
      setTotal(data.total)
    } catch (error) {
      toast.error('Failed to fetch complaints')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter, categoryFilter, page])

  useEffect(() => {
    fetchComplaints()
  }, [fetchComplaints])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      ACKNOWLEDGED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      CLOSED: 'bg-gray-100 text-gray-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Complaints Management</h1>
          <p className="text-muted-foreground">Track and resolve complaints</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          File Complaint
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4 flex-wrap">
            <Input
              placeholder="Search complaints..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="ACKNOWLEDGED">Acknowledged</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {COMPLAINT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Barangay</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.referenceNumber}</TableCell>
                    <TableCell className="max-w-xs truncate font-medium">{c.title}</TableCell>
                    <TableCell>{c.category}</TableCell>
                    <TableCell>{c.barangay?.name || '-'}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(c.status)}>
                        {STATUS_LABELS.COMPLAINT[c.status as keyof typeof STATUS_LABELS.COMPLAINT] || c.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.priority}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Permits Module Component  
function PermitsModule() {
  const [permits, setPermits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchPermits = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { search }
      if (statusFilter) params.status = statusFilter
      
      const data = await api.get<{ permits: any[] }>('/permits', params)
      setPermits(data.permits)
    } catch (error) {
      toast.error('Failed to fetch permits')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchPermits()
  }, [fetchPermits])

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-yellow-100 text-yellow-800',
      UNDER_REVIEW: 'bg-blue-100 text-blue-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-orange-100 text-orange-800',
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Permits & Licenses</h1>
          <p className="text-muted-foreground">Manage business permits and licenses</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Apply for Permit
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search permits..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="SUBMITTED">Submitted</SelectItem>
                <SelectItem value="APPROVED">Approved</SelectItem>
                <SelectItem value="REJECTED">Rejected</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Permit Type</TableHead>
                  <TableHead>Business Name</TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {permits.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-sm">{p.referenceNumber}</TableCell>
                    <TableCell>{p.permitType?.name || '-'}</TableCell>
                    <TableCell>{p.businessName || '-'}</TableCell>
                    <TableCell>
                      {p.applicant ? `${p.applicant.firstName} ${p.applicant.lastName}` : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(p.status)}>
                        {STATUS_LABELS.PERMIT[p.status as keyof typeof STATUS_LABELS.PERMIT] || p.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(p.createdAt), { addSuffix: true })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Announcements Module Component
function AnnouncementsModule() {
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const fetchAnnouncements = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string> = { search }
      if (statusFilter) params.status = statusFilter
      
      const data = await api.get<{ announcements: any[] }>('/announcements', params)
      setAnnouncements(data.announcements)
    } catch (error) {
      toast.error('Failed to fetch announcements')
    } finally {
      setLoading(false)
    }
  }, [search, statusFilter])

  useEffect(() => {
    fetchAnnouncements()
  }, [fetchAnnouncements])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Announcements</h1>
          <p className="text-muted-foreground">Manage public announcements</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search announcements..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {announcements.map((a) => (
                <div key={a.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{a.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{a.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>By {a.author?.firstName} {a.author?.lastName}</span>
                        <span>{formatDistanceToNow(new Date(a.createdAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <Badge variant={a.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                      {a.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No announcements found</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Audit Logs Module Component
function AuditLogsModule() {
  const { hasPermission } = useAuth()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get<{ logs: any[] }>('/audit-logs', { page: page.toString() })
      setLogs(data.logs)
    } catch (error) {
      toast.error('Failed to fetch audit logs')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  if (!hasPermission('view_audit_logs')) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view audit logs.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      CREATE: 'bg-green-100 text-green-800',
      UPDATE: 'bg-blue-100 text-blue-800',
      DELETE: 'bg-red-100 text-red-800',
    }
    return colors[action] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track all system activities</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-sm">
                      {format(new Date(log.createdAt), 'MMM d, yyyy HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.entityType}</TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                      {log.newValues ? JSON.stringify(log.newValues).slice(0, 50) + '...' : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Settings Module Component
function SettingsModule() {
  const { user } = useAuth()
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and system settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input defaultValue={user?.firstName} />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input defaultValue={user?.lastName} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input defaultValue={user?.email} type="email" />
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input defaultValue={user?.phone || ''} />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password and security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input type="password" />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input type="password" />
            </div>
            <Button>Change Password</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure your notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email Notifications</p>
                <p className="text-sm text-muted-foreground">Receive email updates</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Request Updates</p>
                <p className="text-sm text-muted-foreground">Notify when requests are updated</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Complaint Updates</p>
                <p className="text-sm text-muted-foreground">Notify when complaints are updated</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Role</dt>
                <dd className="font-medium">{ROLE_LABELS[user?.role as keyof typeof ROLE_LABELS] || user?.role}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd>
                  <Badge variant="default">Active</Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Member Since</dt>
                <dd className="font-medium">January 2024</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Main Page Export
export default function Home() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  )
}
