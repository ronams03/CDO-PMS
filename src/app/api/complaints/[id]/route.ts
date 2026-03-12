import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { complaintUpdateSchema } from '@/lib/validators'

// GET /api/complaints/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        barangay: { select: { id: true, name: true, code: true, captainName: true } },
        resident: { select: { id: true, firstName: true, lastName: true, phone: true } },
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        handler: { select: { id: true, firstName: true, lastName: true } },
        attachments: true,
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    })

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    return NextResponse.json({ complaint })
  } catch (error) {
    console.error('Get complaint error:', error)
    return NextResponse.json({ error: 'Failed to fetch complaint' }, { status: 500 })
  }
}

// PUT /api/complaints/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageComplaints')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = complaintUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingComplaint = await prisma.complaint.findUnique({ where: { id } })
    if (!existingComplaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 })
    }

    const updateData: any = { ...validation.data }
    
    if (validation.data.status === 'RESOLVED') {
      updateData.resolvedAt = new Date()
    }
    if (validation.data.status === 'CLOSED') {
      updateData.closedAt = new Date()
    }

    const complaint = await prisma.complaint.update({
      where: { id },
      data: updateData,
    })

    // Create status history
    if (validation.data.status && validation.data.status !== existingComplaint.status) {
      await prisma.complaintStatusHistory.create({
        data: {
          complaintId: id,
          status: validation.data.status,
          changedById: currentUser.id,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Complaint',
        entityId: id,
        oldValues: JSON.stringify(existingComplaint),
        newValues: JSON.stringify(complaint),
      },
    })

    return NextResponse.json({ complaint })
  } catch (error) {
    console.error('Update complaint error:', error)
    return NextResponse.json({ error: 'Failed to update complaint' }, { status: 500 })
  }
}
