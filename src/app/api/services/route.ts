import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { serviceCreateSchema } from '@/lib/validators'

// GET /api/services - List all services
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')
    const isActive = searchParams.get('isActive')
    const search = searchParams.get('search') || ''

    const where = {
      ...(departmentId && { departmentId }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      }),
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        department: { select: { id: true, name: true, shortName: true } },
        _count: { select: { requests: true } },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 })
  }
}

// POST /api/services - Create new service
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
    const validation = serviceCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingService = await prisma.service.findUnique({
      where: { code: validation.data.code },
    })
    
    if (existingService) {
      return NextResponse.json({ error: 'Service code already exists' }, { status: 400 })
    }

    const service = await prisma.service.create({
      data: validation.data,
      include: {
        department: { select: { id: true, name: true, shortName: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Service',
        entityId: service.id,
        newValues: JSON.stringify(service),
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Failed to create service' }, { status: 500 })
  }
}
