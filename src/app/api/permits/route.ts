import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { permitCreateSchema } from '@/lib/validators'
import { PermitStatus } from '@prisma/client'

function generatePermitRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PMT-${timestamp}-${random}`
}

// GET /api/permits - List permits
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
    const permitTypeId = searchParams.get('permitTypeId')

    const where = {
      ...(search && {
        OR: [
          { referenceNumber: { contains: search } },
          { businessName: { contains: search } },
        ],
      }),
      ...(status && { status: status as PermitStatus }),
      ...(permitTypeId && { permitTypeId }),
      ...(currentUser.role === 'CITIZEN' && { applicantId: currentUser.id }),
    }

    const [permits, total] = await Promise.all([
      prisma.permit.findMany({
        where,
        include: {
          permitType: { select: { id: true, name: true, code: true, fee: true } },
          resident: { select: { id: true, firstName: true, lastName: true } },
          applicant: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.permit.count({ where }),
    ])

    return NextResponse.json({
      permits,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get permits error:', error)
    return NextResponse.json({ error: 'Failed to fetch permits' }, { status: 500 })
  }
}

// POST /api/permits - Create new permit application
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validation = permitCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const permit = await prisma.permit.create({
      data: {
        ...validation.data,
        referenceNumber: generatePermitRef(),
        applicantId: currentUser.id,
        status: 'DRAFT',
      },
      include: {
        permitType: { select: { id: true, name: true, code: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Permit',
        entityId: permit.id,
        newValues: JSON.stringify(permit),
      },
    })

    return NextResponse.json({ permit }, { status: 201 })
  } catch (error) {
    console.error('Create permit error:', error)
    return NextResponse.json({ error: 'Failed to create permit' }, { status: 500 })
  }
}
