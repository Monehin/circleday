'use client'

import { useSession } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-spin">⏳</div>
          <p className="text-depth-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-depth-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-depth-900 mb-2">
            Welcome to CircleDay
          </h1>
          <p className="text-depth-600">
            Logged in as {session.user.email}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="font-semibold text-lg mb-2">Groups</h3>
            <p className="text-depth-600 text-sm">
              Create and manage your celebration groups
            </p>
            <p className="text-2xl font-bold text-celebration-600 mt-4">0</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="font-semibold text-lg mb-2">Upcoming Events</h3>
            <p className="text-depth-600 text-sm">
              Never miss a special occasion
            </p>
            <p className="text-2xl font-bold text-warmth-600 mt-4">0</p>
          </div>

          <div className="bg-white rounded-lg shadow-soft p-6">
            <h3 className="font-semibold text-lg mb-2">Reminders Sent</h3>
            <p className="text-depth-600 text-sm">
              Keeping everyone connected
            </p>
            <p className="text-2xl font-bold text-depth-600 mt-4">0</p>
          </div>
        </div>

        <div className="mt-8 p-6 bg-warmth-50 rounded-lg border border-warmth-200">
          <h2 className="font-semibold text-lg mb-2">🎉 Getting Started</h2>
          <p className="text-depth-700">
            Create your first group to start managing celebrations!
          </p>
        </div>
      </div>
    </div>
  )
}

