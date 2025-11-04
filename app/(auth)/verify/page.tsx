'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader, PageLoader } from '@/components/ui/loader'
import { Button } from '@/components/ui/button'
import { authClient } from '@/lib/auth/client'

const statusTransition = {
  duration: 0.3
} as const

const springTransition = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 25
}

function VerifyContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const verifyMagicLink = async () => {
      try {
        // Check if user is already authenticated
        const session = await authClient.getSession()
        
        if (session.data?.user) {
          setStatus('success')
          setTimeout(() => {
            const redirectTo = searchParams.get('redirectTo') || '/dashboard'
            router.push(redirectTo)
          }, 1500)
          return
        }

        // If not authenticated, something went wrong
        setStatus('error')
        setErrorMessage('Unable to verify your email. The link may have expired or is invalid.')
      } catch (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage('An error occurred during verification. Please try again.')
      }
    }

    // Wait a bit for Better Auth to process the verification
    const timer = setTimeout(verifyMagicLink, 1500)

    return () => clearTimeout(timer)
  }, [router, searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-primary/[0.02] to-background p-4">
      <Card className="w-full max-w-md border-border/50 shadow-lifted">
        <CardHeader className="text-center">
          <AnimatePresence mode="wait">
            {status === 'verifying' && (
              <motion.div
                key="verifying"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={statusTransition}
              >
                <Loader size="lg" variant="primary" className="mx-auto mb-4" />
                <CardTitle>Verifying...</CardTitle>
                <CardDescription>Please wait while we sign you in</CardDescription>
              </motion.div>
            )}
            
            {status === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...springTransition, delay: 0.1 }}
                  className="mx-auto mb-4 h-16 w-16 rounded-full bg-success/10 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.2 }}
                    className="h-8 w-8 rounded-full bg-success"
                  />
                </motion.div>
                <CardTitle className="text-success">Success!</CardTitle>
                <CardDescription>Redirecting to your dashboard...</CardDescription>
              </motion.div>
            )}
            
            {status === 'error' && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={springTransition}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ ...springTransition, delay: 0.1 }}
                  className="mx-auto mb-4 h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ ...springTransition, delay: 0.2 }}
                    className="h-8 w-8 rounded-full bg-destructive"
                  />
                </motion.div>
                <CardTitle className="text-destructive">Verification failed</CardTitle>
                <CardDescription>
                  {errorMessage || 'The link may have expired or is invalid.'}
                </CardDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
        {status === 'error' && (
          <CardContent>
            <Button
              variant="default"
              className="w-full"
              onClick={() => router.push('/login')}
            >
              Try again
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-depth-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 text-4xl animate-spin">⏳</div>
            <CardTitle>Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <VerifyContent />
    </Suspense>
  )
}

