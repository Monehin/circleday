'use client'

/**
 * Public Event Submission Page
 * 
 * Allows members to add their own events via a secure, expiring invite link.
 * No authentication required - validation via token.
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { PageLoader } from '@/components/ui/loader'
import { PublicEventForm } from '@/components/public/public-event-form'
import { LinkExpired } from '@/components/public/link-expired'
import { validateEventInviteToken } from '@/lib/actions/event-invite-tokens'

type TokenValidation = {
  isValid: boolean
  isLoading: boolean
  error?: string
  errorType?: 'INVALID_FORMAT' | 'NOT_FOUND' | 'EXPIRED' | 'MAX_USES_EXCEEDED' | 'UNKNOWN'
  data?: {
    contact: {
      id: string
      name: string
      email?: string | null
    }
    groupId: string
    expiresAt: Date
    existingEvents: Array<{
      type: string
      title?: string | null
      date: Date
      yearKnown: boolean
    }>
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function PublicEventSubmissionPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [validation, setValidation] = useState<TokenValidation>({
    isValid: false,
    isLoading: true,
  })

  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  const validateToken = async () => {
    setValidation({ isValid: false, isLoading: true })

    try {
      const result = await validateEventInviteToken({ token })

      if (result.success && result.data) {
        setValidation({
          isValid: true,
          isLoading: false,
          data: result.data,
        })
      } else {
        setValidation({
          isValid: false,
          isLoading: false,
          error: result.error,
          errorType: result.errorType,
        })
      }
    } catch (error) {
      console.error('Failed to validate token:', error)
      setValidation({
        isValid: false,
        isLoading: false,
        error: 'Failed to validate link',
        errorType: 'UNKNOWN',
      })
    }
  }

  if (validation.isLoading) {
    return <PageLoader />
  }

  if (!validation.isValid || !validation.data) {
    return (
      <LinkExpired
        errorType={validation.errorType}
        error={validation.error}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-neutral-50">
      {/* Header */}
      <motion.header
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-violet-600 to-purple-600 flex items-center justify-center">
                <span className="text-2xl">🎉</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">CircleDay</h1>
                <p className="text-sm text-neutral-600">Never miss a celebration</p>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <PublicEventForm
            token={token}
            contactName={validation.data.contact.name}
            groupId={validation.data.groupId}
            existingEvents={validation.data.existingEvents}
          />
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        transition={{ delay: 0.4 }}
        className="border-t border-neutral-200 mt-20"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center space-y-2">
            <p className="text-sm text-neutral-600">
              Your information is private and will only be shared with your group members.
            </p>
            <p className="text-xs text-neutral-400">
              Powered by CircleDay - Making celebrations memorable
            </p>
          </div>
        </div>
      </motion.footer>
    </div>
  )
}

