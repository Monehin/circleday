'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { fadeIn, slideUp, scaleIn, successCheck } from '@/lib/animations/variants'

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
      setError('That didn\'t work—check your email and try again.')
      console.error('Magic link error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/5 to-accent/5 p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-accent/10 blur-3xl animate-pulse delay-1000" />
      </div>

      <AnimatePresence mode="wait">
        {isSent ? (
          // Success state
          <motion.div
            key="success"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={scaleIn}
            className="relative z-10"
          >
            <Card className="w-full max-w-md shadow-floating border-primary/20 bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <motion.div 
                  className="mx-auto mb-4 h-20 w-20 rounded-full bg-success/10 flex items-center justify-center"
                  variants={successCheck}
                  initial="initial"
                  animate="animate"
                >
                  <motion.span 
                    className="text-4xl"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    📧
                  </motion.span>
                </motion.div>
                <CardTitle className="text-2xl font-bold bg-gradient-to-r from-success to-success/70 bg-clip-text text-transparent">
                  Check your email
                </CardTitle>
                <CardDescription className="text-base">
                  We sent a magic link to <strong className="text-foreground">{email}</strong>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <motion.div
                  className="rounded-lg bg-success/10 border border-success/20 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <p className="text-sm text-success-foreground/80 text-center">
                    Click the link in your email to sign in. It'll expire in 15 minutes.
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setIsSent(false)}
                  >
                    Use a different email
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          // Login form
          <motion.div
            key="form"
            initial="initial"
            animate="animate"
            exit="exit"
            variants={fadeIn}
            className="relative z-10"
          >
            <Card className="w-full max-w-md shadow-floating border-border/50 bg-card/95 backdrop-blur-sm">
              <CardHeader className="text-center space-y-2 pb-6">
                <motion.div
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.3 }}
                  className="mx-auto mb-2"
                >
                  <span className="text-5xl">🎉</span>
                </motion.div>
                <CardTitle className="font-display text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Welcome to CircleDay
                </CardTitle>
                <CardDescription className="text-base">
                  Sign in with your email—no password needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <motion.div 
                    className="space-y-2"
                    variants={slideUp}
                  >
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
                      className="h-11 transition-all duration-200 focus:ring-2 focus:ring-ring"
                    />
                  </motion.div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="rounded-lg bg-destructive/10 border border-destructive/20 p-3"
                      >
                        <p className="text-sm text-destructive flex items-center gap-2">
                          <span>⚠️</span>
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      className="w-full h-11 text-base shadow-lifted hover:shadow-floating transition-all duration-200"
                      disabled={isLoading || !email}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <motion.span
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          >
                            ⏳
                          </motion.span>
                          Sending magic link...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          ✨ Send magic link
                        </span>
                      )}
                    </Button>
                  </motion.div>

                  <p className="text-xs text-center text-muted-foreground">
                    We'll email you a secure link to sign in. No password required.
                  </p>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

