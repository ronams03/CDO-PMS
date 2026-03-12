import { NextRequest, NextResponse } from 'next/server'
import { loginSchema } from '@/lib/validators'
import { loginUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log('Login attempt for:', body.email)
    
    const validation = loginSchema.safeParse(body)
    if (!validation.success) {
      console.log('Validation failed:', validation.error.flatten())
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.flatten() },
        { status: 400 }
      )
    }
    
    const result = await loginUser(validation.data.email, validation.data.password)
    console.log('Login result:', result.success ? 'Success' : result.error)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: result.user,
    })
  } catch (error: any) {
    console.error('Login error:', error?.message || error)
    console.error('Stack:', error?.stack)
    return NextResponse.json(
      { error: 'An error occurred during login', message: error?.message },
      { status: 500 }
    )
  }
}
