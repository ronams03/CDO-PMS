import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// GET /api/dashboard - Dashboard statistics
export async function GET() {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get counts
    const [
      totalResidents,
      totalUsers,
      totalBarangays,
      totalDepartments,
      totalRequests,
      pendingRequests,
      totalComplaints,
      pendingComplaints,
      totalPermits,
      activePermits,
      recentRequests,
      recentComplaints,
      recentAnnouncements,
      requestsByStatus,
      complaintsByStatus,
      residentsByBarangay,
    ] = await Promise.all([
      // Total residents
      prisma.resident.count(),
      // Total users
      prisma.user.count({ where: { isActive: true } }),
      // Total barangays
      prisma.barangay.count(),
      // Total departments
      prisma.department.count({ where: { isActive: true } }),
      // Total requests
      prisma.serviceRequest.count(),
      // Pending requests
      prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
      // Total complaints
      prisma.complaint.count(),
      // Pending complaints
      prisma.complaint.count({ where: { status: { in: ['SUBMITTED', 'ACKNOWLEDGED', 'IN_PROGRESS'] } } }),
      // Total permits
      prisma.permit.count(),
      // Active permits
      prisma.permit.count({ where: { status: 'APPROVED' } }),
      // Recent requests
      prisma.serviceRequest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          service: { select: { name: true } },
          creator: { select: { firstName: true, lastName: true } },
        },
      }),
      // Recent complaints
      prisma.complaint.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          barangay: { select: { name: true } },
          creator: { select: { firstName: true, lastName: true } },
        },
      }),
      // Recent announcements
      prisma.announcement.findMany({
        take: 5,
        where: { status: 'PUBLISHED' },
        orderBy: { publishedAt: 'desc' },
        include: {
          author: { select: { firstName: true, lastName: true } },
        },
      }),
      // Requests by status
      prisma.serviceRequest.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Complaints by status
      prisma.complaint.groupBy({
        by: ['status'],
        _count: true,
      }),
      // Residents by barangay (top 10)
      prisma.resident.groupBy({
        by: ['barangayId'],
        _count: true,
        orderBy: { _count: { barangayId: 'desc' } },
        take: 10,
      }),
    ])

    // Get barangay names for residents by barangay
    const barangayIds = residentsByBarangay.map(r => r.barangayId).filter(Boolean) as string[]
    const barangayNames = await prisma.barangay.findMany({
      where: { id: { in: barangayIds } },
      select: { id: true, name: true },
    })
    const barangayMap = Object.fromEntries(barangayNames.map(b => [b.id, b.name]))

    const residentsByBarangayWithNames = residentsByBarangay.map(r => ({
      barangayName: barangayMap[r.barangayId || ''] || 'Unknown',
      count: r._count,
    }))

    // Get monthly request trends (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    
    const monthlyRequests = await prisma.serviceRequest.groupBy({
      by: ['createdAt'],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: true,
    })

    // Group by month
    const monthlyTrends: Record<string, number> = {}
    monthlyRequests.forEach(r => {
      const month = r.createdAt.toISOString().slice(0, 7)
      monthlyTrends[month] = (monthlyTrends[month] || 0) + r._count
    })

    const dashboard = {
      counts: {
        residents: totalResidents,
        users: totalUsers,
        barangays: totalBarangays,
        departments: totalDepartments,
        requests: totalRequests,
        pendingRequests,
        complaints: totalComplaints,
        pendingComplaints,
        permits: totalPermits,
        activePermits,
      },
      recent: {
        requests: recentRequests,
        complaints: recentComplaints,
        announcements: recentAnnouncements,
      },
      charts: {
        requestsByStatus: requestsByStatus.map(r => ({ status: r.status, count: r._count })),
        complaintsByStatus: complaintsByStatus.map(c => ({ status: c.status, count: c._count })),
        residentsByBarangay: residentsByBarangayWithNames,
        monthlyTrends: Object.entries(monthlyTrends).map(([month, count]) => ({ month, count })),
      },
    }

    return NextResponse.json({ dashboard })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}
