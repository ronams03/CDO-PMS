import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { barangayUpdateSchema } from '@/lib/validators'

// GET /api/barangays/[id]
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

    const barangay = await prisma.barangay.findUnique({
      where: { id },
      include: {
        _count: {
          select: { residents: true, households: true, users: true, complaints: true },
        },
      },
    })

    if (!barangay) {
      return NextResponse.json({ error: 'Barangay not found' }, { status: 404 })
    }

    return NextResponse.json({ barangay })
  } catch (error) {
    console.error('Get barangay error:', error)
    return NextResponse.json({ error: 'Failed to fetch barangay' }, { status: 500 })
  }
}

// PUT /api/barangays/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageBarangays')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = barangayUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingBarangay = await prisma.barangay.findUnique({ where: { id } })
    if (!existingBarangay) {
      return NextResponse.json({ error: 'Barangay not found' }, { status: 404 })
    }

    const barangay = await prisma.barangay.update({
      where: { id },
      data: validation.data,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Barangay',
        entityId: barangay.id,
        oldValues: JSON.stringify(existingBarangay),
        newValues: JSON.stringify(barangay),
      },
    })

    return NextResponse.json({ barangay })
  } catch (error) {
    console.error('Update barangay error:', error)
    return NextResponse.json({ error: 'Failed to update barangay' }, { status: 500 })
  }
}

// DELETE /api/barangays/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageBarangays')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    const barangay = await prisma.barangay.findUnique({ where: { id } })
    if (!barangay) {
      return NextResponse.json({ error: 'Barangay not found' }, { status: 404 })
    }

    // Check for related records
    const relatedCount = await prisma.resident.count({ where: { barangayId: id } })
    if (relatedCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete barangay with existing residents' },
        { status: 400 }
      )
    }

    await prisma.barangay.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'DELETE',
        entityType: 'Barangay',
        entityId: id,
        oldValues: JSON.stringify(barangay),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete barangay error:', error)
    return NextResponse.json({ error: 'Failed to delete barangay' }, { status: 500 })
  }
}
