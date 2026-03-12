import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { complaintCreateSchema } from '@/lib/validators'
import { ComplaintStatus, ComplaintPriority } from '@prisma/client'

function generateComplaintRef(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `CMP-${timestamp}-${random}`
}

// GET /api/complaints - List complaints
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
    const category = searchParams.get('category')
    const barangayId = searchParams.get('barangayId')

    const where = {
      ...(search && {
        OR: [
          { referenceNumber: { contains: search } },
          { title: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(status && { status: status as ComplaintStatus }),
      ...(priority && { priority: priority as ComplaintPriority }),
      ...(category && { category }),
      ...(barangayId && { barangayId }),
      // Role-based filtering
      ...(currentUser.role === 'CITIZEN' && { createdById: currentUser.id }),
      ...(currentUser.role === 'BARANGAY_OFFICIAL' && { barangayId: currentUser.barangayId }),
    }

    const [complaints, total] = await Promise.all([
      prisma.complaint.findMany({
        where,
        include: {
          barangay: { select: { id: true, name: true, code: true } },
          resident: { select: { id: true, firstName: true, lastName: true } },
          creator: { select: { id: true, firstName: true, lastName: true, email: true } },
          handler: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.complaint.count({ where }),
    ])

    return NextResponse.json({
      complaints,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get complaints error:', error)
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 })
  }
}

// POST /api/complaints - Create new complaint
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const validation = complaintCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const complaint = await prisma.complaint.create({
      data: {
        ...validation.data,
        referenceNumber: generateComplaintRef(),
        createdById: currentUser.id,
        incidentDate: validation.data.incidentDate ? new Date(validation.data.incidentDate) : null,
        priority: validation.data.priority || 'MEDIUM',
        barangayId: validation.data.barangayId || currentUser.barangayId,
      },
      include: {
        barangay: { select: { id: true, name: true, code: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Complaint',
        entityId: complaint.id,
        newValues: JSON.stringify(complaint),
      },
    })

    return NextResponse.json({ complaint }, { status: 201 })
  } catch (error) {
    console.error('Create complaint error:', error)
    return NextResponse.json({ error: 'Failed to create complaint' }, { status: 500 })
  }
}
