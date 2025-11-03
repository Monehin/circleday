'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader, Loader } from '@/components/ui/loader'
import { TimezoneSelect } from '@/components/ui/timezone-select'
import { getUserProfile, updateUserProfile, getUserStats, type UserProfile } from '@/lib/actions/profile'
import { toast } from 'sonner'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must not exceed 100 characters').trim(),
  email: z.string().email('Invalid email address'),
  defaultTimezone: z.string(),
  phone: z.string().optional(),
})

type UpdateProfileInput = z.infer<typeof updateProfileSchema>

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function ProfilePage() {
  const { data: session, isPending: sessionPending } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState({ groupsCount: 0, eventsCount: 0, contactsCount: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    reset,
    watch,
    setValue,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: '',
      email: '',
      defaultTimezone: 'UTC',
      phone: '',
    },
  })

  const timezoneValue = watch('defaultTimezone')

  useEffect(() => {
    if (!sessionPending && !session) {
      router.push('/login')
    }
  }, [session, sessionPending, router])

  useEffect(() => {
    if (session) {
      loadProfile()
      loadStats()
    }
  }, [session])

  const loadProfile = async () => {
    setIsLoading(true)
    try {
      const result = await getUserProfile()
      
      if (result.success && result.profile) {
        setProfile(result.profile)
        reset({
          name: result.profile.name || '',
          email: result.profile.email,
          defaultTimezone: result.profile.defaultTimezone || 'UTC',
          phone: result.profile.phone || '',
        })
      } else {
        toast.error(result.error || 'Failed to load profile')
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
      toast.error('Failed to load profile')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const result = await getUserStats()
      
      if (result.success && result.stats) {
        setStats(result.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const onSubmit = async (data: UpdateProfileInput) => {
    setIsUpdating(true)
    try {
      const result = await updateUserProfile(data)

      if (result.success && result.profile) {
        setProfile(result.profile)
        toast.success('Profile updated successfully')
      } else {
        setError('root', {
          type: 'manual',
          message: result.error || 'Failed to update profile',
        })
        toast.error(result.error || 'Failed to update profile')
      }
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to update profile. Please try again.',
      })
      toast.error('Failed to update profile')
    } finally {
      setIsUpdating(false)
    }
  }

  if (sessionPending || isLoading) {
    return <PageLoader message="Loading profile..." />
  }

  if (!session || !profile) {
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
          <h1 className="text-4xl font-bold text-foreground mb-2">Your Profile</h1>
          <p className="text-muted-foreground text-lg">
            Manage your account information and preferences
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid gap-6 md:grid-cols-3 mb-8"
        >
          <motion.div variants={fadeIn}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Groups
                  </p>
                  <p className="text-3xl font-bold text-primary">{stats.groupsCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-2xl">👥</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Events
                  </p>
                  <p className="text-3xl font-bold text-accent">{stats.eventsCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <span className="text-2xl">🎉</span>
                </div>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeIn}>
            <Card className="p-6 hover:shadow-lifted transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Contacts
                  </p>
                  <p className="text-3xl font-bold text-success">{stats.contactsCount}</p>
                </div>
                <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center">
                  <span className="text-2xl">📇</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Profile Form */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader>
              <CardTitle className="text-2xl">Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    {...register('name')}
                    disabled={isUpdating}
                    className="h-11"
                    aria-invalid={errors.name ? 'true' : 'false'}
                  />
                  <AnimatePresence>
                    {errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.name.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    {...register('email')}
                    disabled={isUpdating}
                    className="h-11"
                    aria-invalid={errors.email ? 'true' : 'false'}
                  />
                  {profile.emailVerified && (
                    <p className="text-xs text-success flex items-center gap-1">
                      ✓ Email verified
                    </p>
                  )}
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

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium">
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    {...register('phone')}
                    disabled={isUpdating}
                    className="h-11"
                  />
                  {profile.phone && profile.phoneVerified && (
                    <p className="text-xs text-success flex items-center gap-1">
                      ✓ Phone verified
                    </p>
                  )}
                  {profile.phone && !profile.phoneVerified && (
                    <p className="text-xs text-warning flex items-center gap-1">
                      ⚠ Phone not verified
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Required for SMS reminders
                  </p>
                </div>

                {/* Timezone */}
                <div className="space-y-2">
                  <Label htmlFor="timezone" className="text-sm font-medium">
                    Default Timezone <span className="text-destructive">*</span>
                  </Label>
                  <TimezoneSelect
                    value={timezoneValue}
                    onChange={(value) => setValue('defaultTimezone', value)}
                    disabled={isUpdating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Used for scheduling reminders and displaying event times
                  </p>
                </div>

                {/* Account Info */}
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Account Information</h3>
                  <p className="text-xs text-muted-foreground">
                    Member since {new Date(profile.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Error Message */}
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

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    type="submit"
                    className="h-11"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <span className="flex items-center gap-2">
                        <Loader size="sm" variant="primary" />
                        Saving...
                      </span>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => reset()}
                    disabled={isUpdating}
                  >
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  )
}

