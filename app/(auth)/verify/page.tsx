'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader, PageLoader } from '@/components/ui/loader'

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
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')

  useEffect(() => {
    // Better Auth handles the token verification automatically
    // This page is shown during the process
    const timer = setTimeout(() => {
      setStatus('success')
      setTimeout(() => {
        router.push('/dashboard')
      }, 1500)
    }, 1000)

    return () => clearTimeout(timer)
  }, [router])

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
                  The link may have expired or is invalid.
                </CardDescription>
              </motion.div>
            )}
          </AnimatePresence>
        </CardHeader>
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

