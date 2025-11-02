'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { authClient } from '@/lib/auth/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader } from '@/components/ui/loader'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 }
}

function VerifyContent() {
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/dashboard'
  
  const [isSent, setIsSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError: setFormError,
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
    },
  })

  const onSubmit = async (data: LoginInput) => {
    try {
      await authClient.signIn.magicLink({
        email: data.email,
        callbackURL: redirectTo,
      })
      
      setSentEmail(data.email)
      setIsSent(true)
    } catch (err) {
      setFormError('root', {
        type: 'manual',
        message: 'Something went wrong. Please try again.',
      })
      console.error('Magic link error:', err)
    }
  }

  if (isSent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/[0.02] to-background p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={scaleIn}
          className="w-full max-w-md"
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader className="text-center pb-4">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", duration: 0.5, delay: 0.2 }}
                className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center"
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.4, delay: 0.3 }}
                  className="h-8 w-8 rounded-full bg-success"
                />
              </motion.div>
              <CardTitle className="text-2xl font-bold">
                Check your email
              </CardTitle>
              <CardDescription className="text-base">
                We sent a secure link to <span className="font-medium text-foreground">{sentEmail}</span>
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
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register('email')}
                  disabled={isSubmitting}
                  className="h-11"
                  aria-invalid={errors.email ? 'true' : 'false'}
                />
                <AnimatePresence>
                  {errors.email && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm text-destructive"
                    >
                      {errors.email.message}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              <AnimatePresence>
                {errors.root && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 overflow-hidden"
                  >
                    <p className="text-sm text-destructive">{errors.root.message}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full h-11 relative"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size="sm" variant="primary" />
                    Sending link...
                  </span>
                ) : (
                  'Continue with email'
                )}
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
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader size="lg" /></div>}>
      <VerifyContent />
    </Suspense>
  )
}
