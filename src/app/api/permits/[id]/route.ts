import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { permitUpdateSchema } from '@/lib/validators'

// GET /api/permits/[id]
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

    const permit = await prisma.permit.findUnique({
      where: { id },
      include: {
        permitType: {
          include: { department: { select: { id: true, name: true, shortName: true } } },
        },
        resident: { select: { id: true, firstName: true, lastName: true, phone: true } },
        applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
        attachments: true,
      },
    })

    if (!permit) {
      return NextResponse.json({ error: 'Permit not found' }, { status: 404 })
    }

    return NextResponse.json({ permit })
  } catch (error) {
    console.error('Get permit error:', error)
    return NextResponse.json({ error: 'Failed to fetch permit' }, { status: 500 })
  }
}

// PUT /api/permits/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = permitUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingPermit = await prisma.permit.findUnique({ where: { id } })
    if (!existingPermit) {
      return NextResponse.json({ error: 'Permit not found' }, { status: 404 })
    }

    // Check permissions for status changes
    if (validation.data.status && ['APPROVED', 'REJECTED'].includes(validation.data.status)) {
      if (!hasPermission(currentUser.role, 'canManagePermits')) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
      }
    }

    const updateData: any = { ...validation.data }
    
    if (validation.data.validFrom) {
      updateData.validFrom = new Date(validation.data.validFrom)
    }
    if (validation.data.validUntil) {
      updateData.validUntil = new Date(validation.data.validUntil)
    }
    
    if (validation.data.status === 'APPROVED') {
      updateData.issuedAt = new Date()
    }

    const permit = await prisma.permit.update({
      where: { id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Permit',
        entityId: id,
        oldValues: JSON.stringify(existingPermit),
        newValues: JSON.stringify(permit),
      },
    })

    return NextResponse.json({ permit })
  } catch (error) {
    console.error('Update permit error:', error)
    return NextResponse.json({ error: 'Failed to update permit' }, { status: 500 })
  }
}
