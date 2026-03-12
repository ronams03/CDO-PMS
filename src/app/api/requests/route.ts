import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { serviceRequestCreateSchema } from '@/lib/validators'

function generateReferenceNumber(prefix: string = 'REQ'): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `${prefix}-${timestamp}-${random}`
}

// GET /api/requests - List service requests
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const serviceId = searchParams.get('serviceId')
    const departmentId = searchParams.get('departmentId')

    const where = {
      ...(search && {
        OR: [
          { referenceNumber: { contains: search } },
          { purpose: { contains: search } },
        ],
      }),
      ...(status && { status }),
      ...(priority && { priority }),
      ...(serviceId && { serviceId }),
      ...(departmentId && {
        service: { departmentId },
      }),
      // Filter by user role
      ...(currentUser.role === 'CITIZEN' && { createdById: currentUser.id }),
      ...(currentUser.role === 'BARANGAY_OFFICIAL' && {
        resident: { barangayId: currentUser.barangayId },
      }),
      ...(currentUser.role === 'DEPARTMENT_HEAD' && {
        service: { departmentId: currentUser.departmentId },
      }),
      ...(currentUser.role === 'STAFF' && {
        service: { departmentId: currentUser.departmentId },
      }),
    }

    const [requests, total] = await Promise.all([
      prisma.serviceRequest.findMany({
        where,
        include: {
          service: {
            include: { department: { select: { id: true, name: true, shortName: true } } },
          },
          resident: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          processor: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.serviceRequest.count({ where }),
    ])

    return NextResponse.json({
      requests,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get requests error:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

// POST /api/requests - Create new service request
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validation = serviceRequestCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const serviceRequest = await prisma.serviceRequest.create({
      data: {
        ...validation.data,
        referenceNumber: generateReferenceNumber(),
        createdById: currentUser.id,
        priority: validation.data.priority || 'MEDIUM',
      },
      include: {
        service: {
          include: { department: { select: { id: true, name: true, shortName: true } } },
        },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'ServiceRequest',
        entityId: serviceRequest.id,
        newValues: JSON.stringify(serviceRequest),
      },
    })

    return NextResponse.json({ request: serviceRequest }, { status: 201 })
  } catch (error) {
    console.error('Create request error:', error)
    return NextResponse.json({ error: 'Failed to create request' }, { status: 500 })
  }
}
