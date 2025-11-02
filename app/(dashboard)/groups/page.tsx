'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { useSession } from '@/lib/auth/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageLoader } from '@/components/ui/loader'
import { getGroups } from '@/lib/actions/groups'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function GroupsPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [groups, setGroups] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      loadGroups()
    }
  }, [session])

  const loadGroups = async () => {
    setIsLoading(true)
    const result = await getGroups()
    if (result.success && result.groups) {
      setGroups(result.groups)
    }
    setIsLoading(false)
  }

  if (isPending || isLoading) {
    return <PageLoader message="Loading groups..." />
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Your Groups
            </h1>
            <p className="text-muted-foreground text-lg">
              Manage your celebration circles
            </p>
          </div>
          <Button size="lg" asChild>
            <Link href="/groups/new">
              <span className="mr-2">+</span>
              Create Group
            </Link>
          </Button>
        </motion.div>

        {/* Groups list */}
        {groups.length === 0 ? (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">👥</span>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  No groups yet
                </h2>
                <p className="text-muted-foreground mb-6">
                  Create your first celebration group to start managing birthdays, anniversaries, and special occasions for your family, friends, or team.
                </p>
                <Button size="lg" asChild>
                  <Link href="/groups/new">
                    Create Your First Group
                  </Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {groups.map((group, index) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/groups/${group.id}`}>
                  <Card className="p-6 hover:shadow-lifted transition-all cursor-pointer group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <span className="text-2xl">🎉</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {group.memberCount || 0} members
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {group.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {group.upcomingEvents || 0} upcoming events
                    </p>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  )
}

