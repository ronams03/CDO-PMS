import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { residentUpdateSchema } from '@/lib/validators'

// GET /api/residents/[id] - Get resident by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageResidents')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    const resident = await prisma.resident.findUnique({
      where: { id },
      include: {
        barangay: { select: { id: true, name: true, code: true, district: true } },
        household: { select: { id: true, householdNumber: true, addressLine1: true } },
        user: { select: { id: true, email: true, role: true } },
      },
    })

    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    return NextResponse.json({ resident })
  } catch (error) {
    console.error('Get resident error:', error)
    return NextResponse.json({ error: 'Failed to fetch resident' }, { status: 500 })
  }
}

// PUT /api/residents/[id] - Update resident
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageResidents')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = residentUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingResident = await prisma.resident.findUnique({ where: { id } })
    if (!existingResident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    const updateData = { ...validation.data }
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate) as any
    }

    const resident = await prisma.resident.update({
      where: { id },
      data: updateData,
      include: {
        barangay: { select: { id: true, name: true, code: true } },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Resident',
        entityId: resident.id,
        oldValues: JSON.stringify(existingResident),
        newValues: JSON.stringify(resident),
      },
    })

    return NextResponse.json({ resident })
  } catch (error) {
    console.error('Update resident error:', error)
    return NextResponse.json({ error: 'Failed to update resident' }, { status: 500 })
  }
}

// DELETE /api/residents/[id] - Delete resident
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageResidents')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    const resident = await prisma.resident.findUnique({ where: { id } })
    if (!resident) {
      return NextResponse.json({ error: 'Resident not found' }, { status: 404 })
    }

    await prisma.resident.delete({ where: { id } })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'DELETE',
        entityType: 'Resident',
        entityId: id,
        oldValues: JSON.stringify(resident),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete resident error:', error)
    return NextResponse.json({ error: 'Failed to delete resident' }, { status: 500 })
  }
}
