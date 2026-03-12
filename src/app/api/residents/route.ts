import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { residentCreateSchema } from '@/lib/validators'

// GET /api/residents - List residents with pagination
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageResidents')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const barangayId = searchParams.get('barangayId')
    const gender = searchParams.get('gender')
    const seniorCitizen = searchParams.get('seniorCitizen')
    const pwd = searchParams.get('pwd')

    const where = {
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
          { phone: { contains: search } },
        ],
      }),
      ...(barangayId && { barangayId }),
      ...(gender && { gender }),
      ...(seniorCitizen !== null && { seniorCitizen: seniorCitizen === 'true' }),
      ...(pwd !== null && { pwd: pwd === 'true' }),
    }

    const [residents, total] = await Promise.all([
      prisma.resident.findMany({
        where,
        include: {
          barangay: { select: { id: true, name: true, code: true } },
          household: { select: { id: true, householdNumber: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.resident.count({ where }),
    ])

    return NextResponse.json({
      residents,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get residents error:', error)
    return NextResponse.json({ error: 'Failed to fetch residents' }, { status: 500 })
  }
}

// POST /api/residents - Create new resident
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageResidents')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = residentCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const resident = await prisma.resident.create({
      data: {
        ...validation.data,
        birthDate: validation.data.birthDate ? new Date(validation.data.birthDate) : null,
      },
      include: {
        barangay: { select: { id: true, name: true, code: true } },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Resident',
        entityId: resident.id,
        newValues: JSON.stringify(resident),
      },
    })

    return NextResponse.json({ resident }, { status: 201 })
  } catch (error) {
    console.error('Create resident error:', error)
    return NextResponse.json({ error: 'Failed to create resident' }, { status: 500 })
  }
}
