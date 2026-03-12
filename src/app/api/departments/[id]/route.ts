import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { departmentUpdateSchema } from '@/lib/validators'

// GET /api/departments/[id]
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

    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        services: { where: { isActive: true }, orderBy: { name: 'asc' } },
        permitTypes: { where: { isActive: true }, orderBy: { name: 'asc' } },
        _count: {
          select: { users: true, services: true, permitTypes: true },
        },
      },
    })

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    return NextResponse.json({ department })
  } catch (error) {
    console.error('Get department error:', error)
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 })
  }
}

// PUT /api/departments/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageDepartments')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = departmentUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingDepartment = await prisma.department.findUnique({ where: { id } })
    if (!existingDepartment) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    const department = await prisma.department.update({
      where: { id },
      data: validation.data,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Department',
        entityId: department.id,
        oldValues: JSON.stringify(existingDepartment),
        newValues: JSON.stringify(department),
      },
    })

    return NextResponse.json({ department })
  } catch (error) {
    console.error('Update department error:', error)
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 })
  }
}

// DELETE /api/departments/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageDepartments')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    const department = await prisma.department.findUnique({ where: { id } })
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 })
    }

    const relatedCount = await prisma.user.count({ where: { departmentId: id } })
    if (relatedCount > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with existing users' },
        { status: 400 }
      )
    }

    await prisma.department.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'DELETE',
        entityType: 'Department',
        entityId: id,
        oldValues: JSON.stringify(department),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete department error:', error)
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 })
  }
}
