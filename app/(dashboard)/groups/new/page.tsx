'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { PageLoader, Loader } from '@/components/ui/loader'
import { createGroup } from '@/lib/actions/groups'

const createGroupSchema = z.object({
  name: z
    .string()
    .min(2, 'Group name must be at least 2 characters')
    .max(50, 'Group name must be less than 50 characters')
    .trim(),
  defaultTimezone: z.string().optional(),
})

type CreateGroupInput = z.infer<typeof createGroupSchema>

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function NewGroupPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm<CreateGroupInput>({
    resolver: zodResolver(createGroupSchema),
    defaultValues: {
      name: '',
      defaultTimezone: 'UTC',
    },
  })

  if (isPending) {
    return <PageLoader message="Loading..." />
  }

  if (!session) {
    router.push('/login')
    return null
  }

  const onSubmit = async (data: CreateGroupInput) => {
    setIsCreating(true)
    try {
      const result = await createGroup(data)
      
      if (result.error) {
        setError('root', {
          type: 'manual',
          message: result.error,
        })
        setIsCreating(false)
        return
      }
      
      // Redirect to groups list
      router.push('/groups')
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to create group. Please try again.',
      })
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
      <DashboardHeader user={session.user} />
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-6"
          >
            ← Back
          </Button>

          <Card className="p-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Create a New Group
              </h1>
              <p className="text-muted-foreground">
                Start managing celebrations for your family, friends, or team
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Group Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Group Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g., Family, Work Team, Friends"
                  {...register('name')}
                  disabled={isCreating}
                  className="h-11"
                  aria-invalid={errors.name ? 'true' : 'false'}
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm text-destructive"
                  >
                    {errors.name.message}
                  </motion.p>
                )}
                <p className="text-xs text-muted-foreground">
                  Choose a name that helps you identify this celebration circle
                </p>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <Label htmlFor="defaultTimezone" className="text-sm font-medium">
                  Default Timezone
                </Label>
                <select
                  id="defaultTimezone"
                  {...register('defaultTimezone')}
                  disabled={isCreating}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="America/New_York">Eastern Time (US & Canada)</option>
                  <option value="America/Chicago">Central Time (US & Canada)</option>
                  <option value="America/Denver">Mountain Time (US & Canada)</option>
                  <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
                  <option value="Europe/London">London</option>
                  <option value="Europe/Paris">Paris</option>
                  <option value="Asia/Tokyo">Tokyo</option>
                  <option value="Asia/Shanghai">Shanghai</option>
                  <option value="Australia/Sydney">Sydney</option>
                </select>
                <p className="text-xs text-muted-foreground">
                  This will be used for scheduling reminders
                </p>
              </div>

              {/* Error message */}
              {errors.root && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-3"
                >
                  <p className="text-sm text-destructive">{errors.root.message}</p>
                </motion.div>
              )}

              {/* Submit button */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isCreating}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader size="sm" />
                      Creating...
                    </span>
                  ) : (
                    'Create Group'
                  )}
                </Button>
              </div>
            </form>
          </Card>

          {/* Info card */}
          <Card className="mt-6 p-6 bg-primary/5 border-primary/20">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              <span>💡</span>
              What happens next?
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Add members to your group</li>
              <li>• Create events (birthdays, anniversaries)</li>
              <li>• Set up reminder preferences</li>
              <li>• Never miss a celebration again!</li>
            </ul>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

