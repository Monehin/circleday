'use client'

/**
 * Link Expired Component
 * 
 * Displays an error message when an invite link is invalid, expired, or over the usage limit.
 */

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Clock, Link2Off, ShieldX } from 'lucide-react'

interface LinkExpiredProps {
  errorType?: 'INVALID_FORMAT' | 'NOT_FOUND' | 'EXPIRED' | 'MAX_USES_EXCEEDED' | 'UNKNOWN'
  error?: string
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function LinkExpired({ errorType, error }: LinkExpiredProps) {
  const router = useRouter()

  const getErrorConfig = () => {
    switch (errorType) {
      case 'EXPIRED':
        return {
          icon: <Clock className="h-16 w-16 text-orange-600" />,
          title: 'Link Expired',
          message: 'This invitation link has expired.',
          description: 'Please contact the person who sent you this link to request a new one.',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          textColor: 'text-orange-900',
        }
      case 'MAX_USES_EXCEEDED':
        return {
          icon: <ShieldX className="h-16 w-16 text-red-600" />,
          title: 'Link No Longer Valid',
          message: 'This link has been used the maximum number of times.',
          description: 'If you need to update your information, please contact the group owner for a new link.',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          textColor: 'text-red-900',
        }
      case 'NOT_FOUND':
      case 'INVALID_FORMAT':
        return {
          icon: <Link2Off className="h-16 w-16 text-neutral-600" />,
          title: 'Invalid Link',
          message: 'This invitation link is not valid.',
          description: 'Please check that you copied the complete link, or request a new one.',
          bgColor: 'bg-neutral-50',
          borderColor: 'border-neutral-200',
          textColor: 'text-neutral-900',
        }
      default:
        return {
          icon: <AlertTriangle className="h-16 w-16 text-yellow-600" />,
          title: 'Something Went Wrong',
          message: error || 'Unable to validate this link.',
          description: 'Please try again or contact the person who sent you this link.',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-900',
        }
    }
  }

  const config = getErrorConfig()

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-neutral-100 flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="w-full max-w-md"
      >
        <Card className={`${config.borderColor} ${config.bgColor} border-2`}>
          <CardContent className="pt-12 pb-12 text-center">
            {/* Icon */}
            <div className="flex justify-center mb-6">
              <div className={`h-24 w-24 rounded-full ${config.bgColor} flex items-center justify-center`}>
                {config.icon}
              </div>
            </div>

            {/* Title */}
            <h1 className={`text-3xl font-bold ${config.textColor} mb-3`}>
              {config.title}
            </h1>

            {/* Message */}
            <p className="text-lg text-neutral-700 mb-4">
              {config.message}
            </p>

            {/* Description */}
            <p className="text-neutral-600 mb-8">
              {config.description}
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full bg-white"
              >
                Go to Home
              </Button>
            </div>

            {/* Help Text */}
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-sm text-neutral-500">
                Need help?{' '}
                <a
                  href="mailto:support@circleday.com"
                  className="text-violet-600 hover:text-violet-700 underline"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-neutral-500">
            Powered by CircleDay - Never miss a celebration
          </p>
        </div>
      </motion.div>
    </div>
  )
}

