'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

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
    <div className="flex min-h-screen items-center justify-center bg-depth-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4 text-4xl animate-spin">⏳</div>
              <CardTitle>Verifying...</CardTitle>
              <CardDescription>Please wait while we sign you in</CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto mb-4 text-4xl">✅</div>
              <CardTitle className="text-celebration-600">Success!</CardTitle>
              <CardDescription>Redirecting to your dashboard...</CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto mb-4 text-4xl">❌</div>
              <CardTitle>Verification failed</CardTitle>
              <CardDescription>
                The link may have expired or is invalid.
              </CardDescription>
            </>
          )}
        </CardHeader>
      </Card>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}

