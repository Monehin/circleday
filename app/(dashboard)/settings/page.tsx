'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loader'
import Link from 'next/link'

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function SettingsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  if (isPending) {
    return <PageLoader message="Loading settings..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your preferences and account settings
          </p>
        </motion.div>

        {/* Settings Cards */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="space-y-6"
        >
          {/* Profile Settings */}
          <motion.div variants={fadeIn}>
            <Link href="/profile">
              <Card className="border-border/50 shadow-lifted hover:shadow-lifted-lg transition-all cursor-pointer group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">👤</span>
                      </div>
                      <div>
                        <CardTitle className="text-xl group-hover:text-primary transition-colors">
                          Profile
                        </CardTitle>
                        <CardDescription>
                          Manage your personal information, timezone, and contact details
                        </CardDescription>
                      </div>
                    </div>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">
                      →
                    </span>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          </motion.div>

          {/* Notification Settings */}
          <motion.div variants={fadeIn}>
            <Card className="border-border/50 shadow-lifted opacity-60">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                      <span className="text-2xl">🔔</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Notifications
                        <span className="ml-2 text-xs text-muted-foreground font-normal">Coming Soon</span>
                      </CardTitle>
                      <CardDescription>
                        Configure email and SMS notification preferences
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Privacy & Security */}
          <motion.div variants={fadeIn}>
            <Card className="border-border/50 shadow-lifted opacity-60">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                      <span className="text-2xl">🔒</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Privacy & Security
                        <span className="ml-2 text-xs text-muted-foreground font-normal">Coming Soon</span>
                      </CardTitle>
                      <CardDescription>
                        Manage your privacy settings and account security
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>

          {/* Data & Export */}
          <motion.div variants={fadeIn}>
            <Card className="border-border/50 shadow-lifted opacity-60">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                      <span className="text-2xl">📦</span>
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Data & Export
                        <span className="ml-2 text-xs text-muted-foreground font-normal">Coming Soon</span>
                      </CardTitle>
                      <CardDescription>
                        Export your data or delete your account
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </motion.div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <Card className="p-6 bg-muted/30 border-border/50">
            <h3 className="font-semibold text-foreground mb-2">Need Help?</h3>
            <p className="text-sm text-muted-foreground">
              If you have questions about your account or need assistance, please contact support at{' '}
              <a href="mailto:support@circleday.app" className="text-primary hover:underline">
                support@circleday.app
              </a>
            </p>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

