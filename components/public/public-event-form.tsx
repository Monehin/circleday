'use client'

/**
 * Public Event Form Component
 * 
 * Form for members to add their own events via invite link.
 * No authentication required.
 */

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus, Trash2, Check } from 'lucide-react'
import { submitEventsViaToken } from '@/lib/actions/event-invite-tokens'
import { format, parseISO } from 'date-fns'

interface PublicEventFormProps {
  token: string
  contactName: string
  groupId: string
  existingEvents: Array<{
    type: string
    title?: string | null
    date: Date
    yearKnown: boolean
  }>
}

interface EventFormData {
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM'
  title?: string
  date: string
  yearKnown: boolean
  notes?: string
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function PublicEventForm({ token, contactName, groupId, existingEvents }: PublicEventFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Initialize form with existing events if they exist
  const existingBirthday = existingEvents.find(e => e.type === 'BIRTHDAY')
  const existingAnniversary = existingEvents.find(e => e.type === 'ANNIVERSARY')
  const existingCustom = existingEvents.filter(e => e.type === 'CUSTOM')

  const [birthday, setBirthday] = useState<Partial<EventFormData>>({
    type: 'BIRTHDAY',
    date: existingBirthday ? existingBirthday.date.toISOString() : '',
    yearKnown: existingBirthday?.yearKnown ?? true,
  })

  const [anniversary, setAnniversary] = useState<Partial<EventFormData>>({
    type: 'ANNIVERSARY',
    date: existingAnniversary ? existingAnniversary.date.toISOString() : '',
    yearKnown: existingAnniversary?.yearKnown ?? true,
  })

  const [customEvents, setCustomEvents] = useState<Partial<EventFormData>[]>(
    existingCustom.map(e => ({
      type: 'CUSTOM' as const,
      title: e.title || '',
      date: e.date.toISOString(),
      yearKnown: e.yearKnown,
    }))
  )

  const [keepAgePrivate, setKeepAgePrivate] = useState(false)

  const addCustomEvent = () => {
    setCustomEvents([
      ...customEvents,
      {
        type: 'CUSTOM',
        yearKnown: true,
      },
    ])
  }

  const removeCustomEvent = (index: number) => {
    setCustomEvents(customEvents.filter((_, i) => i !== index))
  }

  const updateCustomEvent = (index: number, updates: Partial<EventFormData>) => {
    setCustomEvents(
      customEvents.map((event, i) => (i === index ? { ...event, ...updates } : event))
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Collect all events
      const events: Array<{
        type: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM'
        title?: string
        date: string
        yearKnown: boolean
        notes?: string
      }> = []

      // Add birthday if provided
      if (birthday.date) {
        events.push({
          type: 'BIRTHDAY',
          date: birthday.date,
          yearKnown: keepAgePrivate ? false : (birthday.yearKnown ?? true),
          notes: birthday.notes,
        })
      }

      // Add anniversary if provided
      if (anniversary.date) {
        events.push({
          type: 'ANNIVERSARY',
          date: anniversary.date,
          yearKnown: anniversary.yearKnown ?? true,
          notes: anniversary.notes,
        })
      }

      // Add custom events with valid data
      customEvents.forEach((event) => {
        if (event.date && event.title) {
          events.push({
            type: 'CUSTOM',
            title: event.title,
            date: event.date,
            yearKnown: event.yearKnown ?? true,
            notes: event.notes,
          })
        }
      })

      if (events.length === 0) {
        alert('Please add at least one event')
        setLoading(false)
        return
      }

      // Submit via token
      const result = await submitEventsViaToken({
        token,
        events,
      })

      if (result.success) {
        setSubmitted(true)
      } else {
        alert(result.error || 'Failed to save events. Please try again.')
      }
    } catch (error) {
      console.error('Failed to submit events:', error)
      alert('Failed to save events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="flex justify-center mb-6">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-green-900 mb-3">
              Thank You! 🎉
            </h2>
            <p className="text-lg text-green-700 mb-6">
              Your special days have been saved successfully.
            </p>
            <p className="text-green-600 mb-8">
              Your group will now be able to celebrate with you!
            </p>
            <Button
              variant="outline"
              onClick={() => router.push('/')}
              className="bg-white"
            >
              Close
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Card className="border-violet-200 shadow-xl">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl mb-3">Add Your Special Days</CardTitle>
          <CardDescription className="text-base">
            Hi <strong>{contactName}</strong>! 👋
            <br />
            Please share your important dates so we can celebrate together.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Birthday Section */}
            <div className="space-y-4 p-6 bg-violet-50 rounded-xl border-2 border-violet-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🎂</span>
                <div>
                  <h3 className="text-xl font-semibold text-violet-900">Birthday</h3>
                  <p className="text-sm text-violet-700">When do you celebrate your birthday?</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="birthday-date" className="text-base">Date</Label>
                  <Input
                    id="birthday-date"
                    type="date"
                    value={birthday.date ? format(parseISO(birthday.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value)
                        setBirthday({ ...birthday, date: date.toISOString() })
                      } else {
                        setBirthday({ ...birthday, date: '' })
                      }
                    }}
                    className="h-12 text-base"
                  />
                </div>

                {birthday.date && (
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-violet-100 transition-colors">
                    <input
                      type="checkbox"
                      checked={keepAgePrivate}
                      onChange={(e) => setKeepAgePrivate(e.target.checked)}
                      className="h-5 w-5 text-violet-600 rounded"
                    />
                    <span className="text-sm text-violet-900">
                      Keep my age private (only show month and day)
                    </span>
                  </label>
                )}

                <div>
                  <Label htmlFor="birthday-notes" className="text-base">Notes (optional)</Label>
                  <Input
                    id="birthday-notes"
                    placeholder="e.g., Favorite cake flavor, gift ideas"
                    value={birthday.notes || ''}
                    onChange={(e) => setBirthday({ ...birthday, notes: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Anniversary Section */}
            <div className="space-y-4 p-6 bg-pink-50 rounded-xl border-2 border-pink-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💍</span>
                <div>
                  <h3 className="text-xl font-semibold text-pink-900">Anniversary</h3>
                  <p className="text-sm text-pink-700">When is your anniversary?</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="anniversary-date" className="text-base">Date</Label>
                  <Input
                    id="anniversary-date"
                    type="date"
                    value={anniversary.date ? format(parseISO(anniversary.date), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        const date = new Date(e.target.value)
                        setAnniversary({ ...anniversary, date: date.toISOString() })
                      } else {
                        setAnniversary({ ...anniversary, date: '' })
                      }
                    }}
                    className="h-12 text-base"
                  />
                </div>

                <div>
                  <Label htmlFor="anniversary-notes" className="text-base">Notes (optional)</Label>
                  <Input
                    id="anniversary-notes"
                    placeholder="e.g., Wedding anniversary, first date"
                    value={anniversary.notes || ''}
                    onChange={(e) => setAnniversary({ ...anniversary, notes: e.target.value })}
                    className="h-11"
                  />
                </div>
              </div>
            </div>

            {/* Custom Events Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">✨</span>
                  <div>
                    <h3 className="text-xl font-semibold text-neutral-900">Other Special Days</h3>
                    <p className="text-sm text-neutral-600">Graduation, work anniversary, etc.</p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomEvent}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </div>

              {customEvents.map((event, index) => (
                <div
                  key={index}
                  className="space-y-3 p-6 bg-blue-50 rounded-xl border-2 border-blue-200 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomEvent(index)}
                    className="absolute top-3 right-3 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-base">Event Name</Label>
                      <Input
                        placeholder="e.g., Graduation Day"
                        value={event.title || ''}
                        onChange={(e) =>
                          updateCustomEvent(index, { title: e.target.value })
                        }
                        className="h-11"
                      />
                    </div>

                    <div>
                      <Label className="text-base">Date</Label>
                      <Input
                        type="date"
                        value={event.date ? format(parseISO(event.date), 'yyyy-MM-dd') : ''}
                        onChange={(e) => {
                          if (e.target.value) {
                            const date = new Date(e.target.value)
                            updateCustomEvent(index, { date: date.toISOString() })
                          } else {
                            updateCustomEvent(index, { date: '' })
                          }
                        }}
                        className="h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-base">Notes (optional)</Label>
                    <Input
                      placeholder="Add any special notes..."
                      value={event.notes || ''}
                      onChange={(e) =>
                        updateCustomEvent(index, { notes: e.target.value })
                      }
                      className="h-11"
                    />
                  </div>
                </div>
              ))}

              {customEvents.length === 0 && (
                <div className="text-center py-8 text-neutral-500 text-sm italic">
                  No custom events yet. Click "Add Event" to add one.
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-14 text-lg bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Saving Your Events...
                  </>
                ) : (
                  <>Submit My Events 🎉</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

