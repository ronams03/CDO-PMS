import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { barangayCreateSchema } from '@/lib/validators'

// GET /api/barangays - List all barangays
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const district = searchParams.get('district')

    const where = {
      ...(search && {
        OR: [
          { name: { contains: search } },
          { code: { contains: search } },
        ],
      }),
      ...(district && { district }),
    }

    const barangays = await prisma.barangay.findMany({
      where,
      include: {
        _count: {
          select: { residents: true, households: true, users: true },
        },
      },
      orderBy: [{ district: 'asc' }, { code: 'asc' }],
    })

    return NextResponse.json({ barangays })
  } catch (error) {
    console.error('Get barangays error:', error)
    return NextResponse.json({ error: 'Failed to fetch barangays' }, { status: 500 })
  }
}

// POST /api/barangays - Create new barangay
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageBarangays')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = barangayCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Check code uniqueness
    const existingBarangay = await prisma.barangay.findUnique({
      where: { code: validation.data.code },
    })
    
    if (existingBarangay) {
      return NextResponse.json({ error: 'Barangay code already exists' }, { status: 400 })
    }

    const barangay = await prisma.barangay.create({
      data: validation.data,
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Barangay',
        entityId: barangay.id,
        newValues: JSON.stringify(barangay),
      },
    })

    return NextResponse.json({ barangay }, { status: 201 })
  } catch (error) {
    console.error('Create barangay error:', error)
    return NextResponse.json({ error: 'Failed to create barangay' }, { status: 500 })
  }
}
