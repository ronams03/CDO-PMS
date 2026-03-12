import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { announcementUpdateSchema } from '@/lib/validators'

// GET /api/announcements/[id]
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

    const announcement = await prisma.announcement.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    })

    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Get announcement error:', error)
    return NextResponse.json({ error: 'Failed to fetch announcement' }, { status: 500 })
  }
}

// PUT /api/announcements/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageAnnouncements')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const validation = announcementUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingAnnouncement = await prisma.announcement.findUnique({ where: { id } })
    if (!existingAnnouncement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    const updateData: any = { ...validation.data }
    
    if (validation.data.status === 'PUBLISHED' && existingAnnouncement.status !== 'PUBLISHED') {
      updateData.publishedAt = new Date()
    }
    if (validation.data.expiresAt) {
      updateData.expiresAt = new Date(validation.data.expiresAt)
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'Announcement',
        entityId: id,
        oldValues: JSON.stringify(existingAnnouncement),
        newValues: JSON.stringify(announcement),
      },
    })

    return NextResponse.json({ announcement })
  } catch (error) {
    console.error('Update announcement error:', error)
    return NextResponse.json({ error: 'Failed to update announcement' }, { status: 500 })
  }
}

// DELETE /api/announcements/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageAnnouncements')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    const announcement = await prisma.announcement.findUnique({ where: { id } })
    if (!announcement) {
      return NextResponse.json({ error: 'Announcement not found' }, { status: 404 })
    }

    await prisma.announcement.delete({ where: { id } })

    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'DELETE',
        entityType: 'Announcement',
        entityId: id,
        oldValues: JSON.stringify(announcement),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete announcement error:', error)
    return NextResponse.json({ error: 'Failed to delete announcement' }, { status: 500 })
  }
}
