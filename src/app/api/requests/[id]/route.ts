import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { serviceRequestUpdateSchema } from '@/lib/validators'

// GET /api/requests/[id]
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

    const serviceRequest = await prisma.serviceRequest.findUnique({
      where: { id },
      include: {
        service: {
          include: { department: { select: { id: true, name: true, shortName: true } } },
        },
        resident: { select: { id: true, firstName: true, lastName: true, phone: true } },
        creator: { select: { id: true, firstName: true, lastName: true, email: true } },
        processor: { select: { id: true, firstName: true, lastName: true } },
        attachments: true,
        statusHistory: {
          include: { changedById: true },
          orderBy: { changedAt: 'desc' },
        },
      },
    })

    if (!serviceRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    return NextResponse.json({ request: serviceRequest })
  } catch (error) {
    console.error('Get request error:', error)
    return NextResponse.json({ error: 'Failed to fetch request' }, { status: 500 })
  }
}

// PUT /api/requests/[id] - Update request status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageRequests')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = serviceRequestUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingRequest = await prisma.serviceRequest.findUnique({ where: { id } })
    if (!existingRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const updateData: any = { ...validation.data }
    
    if (validation.data.status) {
      if (validation.data.status === 'APPROVED' || validation.data.status === 'REJECTED') {
        updateData.processedAt = new Date()
        updateData.processedById = currentUser.id
      }
      if (validation.data.status === 'COMPLETED') {
        updateData.completedAt = new Date()
      }
    }

    const updatedRequest = await prisma.serviceRequest.update({
      where: { id },
      data: updateData,
    })

    // Create status history
    if (validation.data.status && validation.data.status !== existingRequest.status) {
      await prisma.requestStatusHistory.create({
        data: {
          requestId: id,
          status: validation.data.status,
          remarks: validation.data.adminRemarks,
          changedById: currentUser.id,
        },
      })
    }

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'ServiceRequest',
        entityId: id,
        oldValues: JSON.stringify(existingRequest),
        newValues: JSON.stringify(updatedRequest),
      },
    })

    return NextResponse.json({ request: updatedRequest })
  } catch (error) {
    console.error('Update request error:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
