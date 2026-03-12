import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hasPermission } from '@/lib/auth'
import { userUpdateSchema } from '@/lib/validators'

// GET /api/users/[id] - Get user by ID
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

    const user = await prisma.user.findUnique({
      where: { id },
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
        updatedAt: true,
        lastLoginAt: true,
        department: { select: { id: true, name: true, shortName: true } },
        barangay: { select: { id: true, name: true, code: true } },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    // Allow users to update their own profile, or admins to update any user
    if (currentUser.id !== id && !hasPermission(currentUser.role, 'canManageUsers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validation = userUpdateSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check email uniqueness if changing email
    if (validation.data.email && validation.data.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: validation.data.email.toLowerCase() },
      })
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
      }
    }

    const updateData = { ...validation.data }
    if (updateData.email) {
      updateData.email = updateData.email.toLowerCase()
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
        updatedAt: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'UPDATE',
        entityType: 'User',
        entityId: user.id,
        oldValues: JSON.stringify(existingUser),
        newValues: JSON.stringify(user),
      },
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete user (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    if (!hasPermission(currentUser.role, 'canManageUsers')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { id } = await params

    if (currentUser.id === id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Soft delete
    const deletedUser = await prisma.user.update({
      where: { id },
      data: { isActive: false },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: currentUser.id,
        action: 'DELETE',
        entityType: 'User',
        entityId: id,
        oldValues: JSON.stringify(user),
        newValues: JSON.stringify(deletedUser),
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
