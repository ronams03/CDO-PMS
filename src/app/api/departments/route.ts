import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { departmentCreateSchema } from '@/lib/validators'

// GET /api/departments - List all departments
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
          { shortName: { contains: search } },
        ],
      }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
    }

    const departments = await prisma.department.findMany({
      where,
      include: {
        _count: {
          select: { users: true, services: true, permitTypes: true },
        },
      },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ departments })
  } catch (error) {
    console.error('Get departments error:', error)
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 })
  }
}

// POST /api/departments - Create new department
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageDepartments')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = departmentCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingDepartment = await prisma.department.findUnique({
      where: { code: validation.data.code },
    })
    
    if (existingDepartment) {
      return NextResponse.json({ error: 'Department code already exists' }, { status: 400 })
    }

    const department = await prisma.department.create({
      data: validation.data,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Department',
        entityId: department.id,
        newValues: JSON.stringify(department),
      },
    })

    return NextResponse.json({ department }, { status: 201 })
  } catch (error) {
    console.error('Create department error:', error)
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 })
  }
}
