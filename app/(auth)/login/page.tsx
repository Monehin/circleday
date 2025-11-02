'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

function VerifyContent() {
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
      setError('Something went wrong. Please try again.')
      console.error('Magic link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/[0.02] to-background p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center">
                <div className="h-8 w-8 rounded-full bg-success/20" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <CardDescription className="text-base">
                We sent a secure link to <span className="font-medium text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-success/5 border border-success/10 p-4">
                <p className="text-sm text-center text-muted-foreground">
                  Click the link in your email to sign in. The link expires in 15 minutes.
                </p>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setIsSent(false)}
              >
                Use different email
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/[0.02] to-background p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <Card className="border-border/50 shadow-lifted">
          <CardHeader className="text-center space-y-2 pb-6">
            <CardTitle className="text-3xl font-bold text-foreground">
              Welcome to CircleDay
            </CardTitle>
            <CardDescription className="text-base">
              Sign in with your email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-11"
                />
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading || !email}
              >
                {isLoading ? 'Sending link...' : 'Continue with email'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                We'll send you a secure link to sign in. No password required.
              </p>
            </form>
          </CardContent>
        </Card>

      </motion.div>
    </div>
  )
}

export default function LoginPage() {
  return <VerifyContent />
}
