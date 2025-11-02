'use client'

import { useState } from 'react'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await authClient.signIn.magicLink({
        email,
        callbackURL: '/dashboard',
      })
      
      setIsSent(true)
    } catch (err) {
      setError('Failed to send magic link. Please try again.')
      console.error('Magic link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-depth-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-4xl">📧</div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <CardDescription>
              We sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-depth-600 text-center">
              Click the link in the email to sign in. The link will expire in 15 minutes.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setIsSent(false)}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-depth-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-celebration-600">
            CircleDay
          </CardTitle>
          <CardDescription>
            Never miss a celebration 🎉
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="w-full"
              />
            </div>

            {error && (
              <div className="rounded-md bg-red-50 border border-red-200 p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Sending...' : 'Send magic link'}
            </Button>

            <p className="text-xs text-center text-depth-500">
              We'll send you a magic link to sign in without a password.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

