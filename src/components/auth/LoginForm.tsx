'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Loader2 } from 'lucide-react'

export function LoginForm() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await login(email, password)
      if (!result.success) {
        setError(result.error || 'Login failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-blue-600">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">CDO LGU System</CardTitle>
          <CardDescription>
            Cagayan de Oro City Management System
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-center text-muted-foreground mb-3">Demo Accounts (password: password123)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => { setEmail('superadmin@cdo.gov.ph'); setPassword('password123'); }}
              >
                Super Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => { setEmail('admin@cdo.gov.ph'); setPassword('password123'); }}
              >
                LGU Admin
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => { setEmail('staff.civilreg@cdo.gov.ph'); setPassword('password123'); }}
              >
                Staff
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                type="button"
                onClick={() => { setEmail('citizen@cdo.gov.ph'); setPassword('password123'); }}
              >
                Citizen
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
