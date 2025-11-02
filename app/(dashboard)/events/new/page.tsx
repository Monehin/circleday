'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSession } from '@/lib/auth/client'
import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PageLoader, Loader } from '@/components/ui/loader'
import { createEvent, getContactsForEvents } from '@/lib/actions/events'
import { format } from 'date-fns'

const createEventSchema = z.object({
  contactId: z.string().min(1, 'Please select a contact'),
  type: z.enum(['BIRTHDAY', 'ANNIVERSARY', 'CUSTOM'], {
    message: 'Please select an event type',
  }),
  title: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  yearKnown: z.boolean().default(true),
  repeat: z.boolean().default(true),
  notes: z.string().optional(),
}).refine(data => {
  // Title is required for CUSTOM events
  if (data.type === 'CUSTOM' && !data.title) {
    return false
  }
  return true
}, {
  message: 'Title is required for custom events',
  path: ['title'],
})

type CreateEventInput = z.infer<typeof createEventSchema>

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

type Contact = {
  id: string
  name: string
  email: string | null
  phone: string | null
}

export default function CreateEventPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoadingContacts, setIsLoadingContacts] = useState(true)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      contactId: '',
      type: 'BIRTHDAY' as const,
      title: '',
      date: '',
      yearKnown: true,
      repeat: true,
      notes: '',
    },
  })

  const eventType = watch('type')

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login')
    }
  }, [session, isPending, router])

  useEffect(() => {
    if (session) {
      loadContacts()
    }
  }, [session])

  const loadContacts = async () => {
    setIsLoadingContacts(true)
    const result = await getContactsForEvents()
    if (result.success && result.contacts) {
      setContacts(result.contacts)
    }
    setIsLoadingContacts(false)
  }

  if (isPending || isLoadingContacts) {
    return <PageLoader message="Loading..." />
  }

  if (!session) {
    router.push('/login')
    return null
  }

  if (contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background via-primary/[0.02] to-background">
        <DashboardHeader user={session.user} />
        <main className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
          >
            <Card className="p-8 text-center border-border/50 shadow-lifted">
              <div className="text-6xl mb-4">👥</div>
              <h2 className="text-2xl font-bold text-muted-foreground mb-4">No Contacts Yet</h2>
              <p className="text-muted-foreground mb-6">
                You need to add members to your groups before you can create events for them.
              </p>
              <Button size="lg" asChild>
                <Link href="/groups">
                  Go to Groups
                </Link>
              </Button>
            </Card>
          </motion.div>
        </main>
      </div>
    )
  }

  const onSubmit = async (data: any) => {
    setIsCreating(true)
    try {
      const result = await createEvent(data)
      
      if (result.error) {
        setError('root', {
          type: 'manual',
          message: result.error,
        })
        setIsCreating(false)
        return
      }
      
      // Redirect to events list
      router.push('/events')
    } catch (error) {
      setError('root', {
        type: 'manual',
        message: 'Failed to create event. Please try again.',
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
          variants={fadeIn}
          className="w-full"
        >
          <Card className="border-border/50 shadow-lifted">
            <CardHeader className="text-center space-y-2 pb-6">
              <CardTitle className="text-3xl font-bold text-foreground">
                Add New Event
              </CardTitle>
              <CardDescription className="text-base">
                Create a birthday, anniversary, or custom celebration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Contact Selection */}
                <div className="space-y-2">
                  <Label htmlFor="contactId" className="text-sm font-medium">
                    Who is this event for? *
                  </Label>
                  <Select onValueChange={(value) => setValue('contactId', value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select a contact" />
                    </SelectTrigger>
                    <SelectContent>
                      {contacts.map((contact) => (
                        <SelectItem key={contact.id} value={contact.id}>
                          {contact.name} {contact.email && `(${contact.email})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {errors.contactId && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.contactId.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Event Type */}
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm font-medium">
                    Event Type *
                  </Label>
                  <Select onValueChange={(value: "BIRTHDAY" | "ANNIVERSARY" | "CUSTOM") => setValue('type', value)} defaultValue="BIRTHDAY">
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BIRTHDAY">🎂 Birthday</SelectItem>
                      <SelectItem value="ANNIVERSARY">💍 Anniversary</SelectItem>
                      <SelectItem value="CUSTOM">🎉 Custom Event</SelectItem>
                    </SelectContent>
                  </Select>
                  <AnimatePresence>
                    {errors.type && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.type.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Title (only for CUSTOM events) */}
                {eventType === 'CUSTOM' && (
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Event Title *
                    </Label>
                    <Input
                      id="title"
                      type="text"
                      placeholder="e.g., Graduation Day"
                      {...register('title')}
                      disabled={isCreating}
                      className="h-11"
                    />
                    <AnimatePresence>
                      {errors.title && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="text-sm text-destructive"
                        >
                          {errors.title.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium">
                    Date *
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register('date')}
                    disabled={isCreating}
                    className="h-11"
                  />
                  <AnimatePresence>
                    {errors.date && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.date.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                {/* Year Known Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="yearKnown"
                    {...register('yearKnown')}
                    disabled={isCreating}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <Label htmlFor="yearKnown" className="text-sm font-medium cursor-pointer">
                    I know the year (show age/years)
                  </Label>
                </div>

                {/* Repeat Checkbox */}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="repeat"
                    {...register('repeat')}
                    disabled={isCreating}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    defaultChecked
                  />
                  <Label htmlFor="repeat" className="text-sm font-medium cursor-pointer">
                    Repeat annually
                  </Label>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notes <span className="text-muted-foreground text-xs">(Optional)</span>
                  </Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any special notes or gift ideas..."
                    {...register('notes')}
                    disabled={isCreating}
                    className="min-h-[100px]"
                  />
                  <AnimatePresence>
                    {errors.notes && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-sm text-destructive"
                      >
                        {errors.notes.message}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

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

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    className="flex-1 h-11"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader size="sm" variant="primary" />
                        Creating event...
                      </span>
                    ) : (
                      'Create Event'
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    className="h-11"
                    onClick={() => router.push('/events')}
                    disabled={isCreating}
                  >
                    Cancel
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

