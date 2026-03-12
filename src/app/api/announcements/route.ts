import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { announcementCreateSchema } from '@/lib/validators'
import { AnnouncementStatus, ComplaintPriority } from '@prisma/client'

// GET /api/announcements - List announcements
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
    const category = searchParams.get('category')

    const where = {
      ...(search && {
        OR: [
          { title: { contains: search } },
          { content: { contains: search } },
        ],
      }),
      ...(status && { status: status as AnnouncementStatus }),
      ...(category && { category }),
    }

    const [announcements, total] = await Promise.all([
      prisma.announcement.findMany({
        where,
        include: {
          author: { select: { id: true, firstName: true, lastName: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.announcement.count({ where }),
    ])

    return NextResponse.json({
      announcements,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('Get announcements error:', error)
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 })
  }
}

// POST /api/announcements - Create new announcement
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageAnnouncements')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = announcementCreateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const announcement = await prisma.announcement.create({
      data: {
        ...validation.data,
        authorId: currentUser.id,
        publishedAt: validation.data.status === 'PUBLISHED' ? new Date() : null,
        expiresAt: validation.data.expiresAt ? new Date(validation.data.expiresAt) : null,
      },
      include: {
        author: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'CREATE',
        entityType: 'Announcement',
        entityId: announcement.id,
        newValues: JSON.stringify(announcement),
      },
    })

    return NextResponse.json({ announcement }, { status: 201 })
  } catch (error) {
    console.error('Create announcement error:', error)
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 })
  }
}
