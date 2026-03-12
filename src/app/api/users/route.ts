import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hashPassword, hasPermission } from '@/lib/auth'
import { userCreateSchema, paginationSchema } from '@/lib/validators'
import { UserRole } from '@prisma/client'

// GET /api/users - List users with pagination
export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageUsers') && currentUser.role !== 'SUPER_ADMIN') {
      // Allow users to see their own data only
      const users = await prisma.user.findMany({
        where: { id: currentUser.id },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          suffix: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          departmentId: true,
          barangayId: true,
          createdAt: true,
          department: { select: { id: true, name: true, shortName: true } },
          barangay: { select: { id: true, name: true, code: true } },
        },
      })
      return NextResponse.json({ users, total: users.length })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') as UserRole | null
    const isActive = searchParams.get('isActive')

    const where = {
      ...(search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } },
        ],
      }),
      ...(role && { role }),
      ...(isActive !== null && { isActive: isActive === 'true' }),
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          middleName: true,
          suffix: true,
          phone: true,
          avatar: true,
          role: true,
          isActive: true,
          departmentId: true,
          barangayId: true,
          createdAt: true,
          lastLoginAt: true,
          department: { select: { id: true, name: true, shortName: true } },
          barangay: { select: { id: true, name: true, code: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.user.count({ where }),
    ])

    return NextResponse.json({
      users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageUsers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = userCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validation.data.email.toLowerCase() },
    })
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(validation.data.password)

    const user = await prisma.user.create({
      data: {
        ...validation.data,
        email: validation.data.email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        middleName: true,
        suffix: true,
        phone: true,
        role: true,
        isActive: true,
        departmentId: true,
        barangayId: true,
        createdAt: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'User',
        entityId: user.id,
        newValues: JSON.stringify(user),
      },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error('Create user error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
