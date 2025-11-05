'use client'

/**
 * Public Event Form Component (v2 - Improved UX)
 * 
 * Form for members to add their own events via invite link.
 * No authentication required - uses same new UX patterns as AddEventsModal.
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
import { MonthPicker } from '@/components/ui/month-picker'
import { DayPicker } from '@/components/ui/day-picker'
import { YearToggle } from '@/components/ui/year-toggle'
import { EventTypeSelector, EVENT_TEMPLATES, type EventTemplate } from '@/components/ui/event-type-selector'

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
  id: string
  template: EventTemplate
  title?: string
  month?: number
  day?: number
  hasYear: boolean
  year?: number
  recurring: boolean // User can override for custom events
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
  const [showSelector, setShowSelector] = useState(true)
  const [events, setEvents] = useState<EventFormData[]>([])

  const addEvent = (template: EventTemplate) => {
    const newEvent: EventFormData = {
      id: `${Date.now()}-${Math.random()}`,
      template,
      title: template.type === 'CUSTOM' && template.id !== 'custom' ? template.name : '',
      hasYear: template.requiresYear,
      recurring: template.recurring, // Initialize from template, but can be changed for custom events
    }
    setEvents([...events, newEvent])
    setShowSelector(false)
  }

  const removeEvent = (id: string) => {
    setEvents(events.filter(e => e.id !== id))
    if (events.length === 1) {
      setShowSelector(true)
    }
  }

  const updateEvent = (id: string, updates: Partial<EventFormData>) => {
    setEvents(events.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const getColorClasses = (color: string) => {
    const colors: Record<string, { bg: string; border: string }> = {
      violet: { bg: 'bg-violet-50', border: 'border-violet-200' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200' },
      green: { bg: 'bg-green-50', border: 'border-green-200' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200' },
      neutral: { bg: 'bg-neutral-50', border: 'border-neutral-200' },
    }
    return colors[color] || colors.neutral
  }

  const validateEvent = (event: EventFormData): boolean => {
    if (!event.month || !event.day) return false
    if (event.template.type === 'CUSTOM' && event.template.id === 'custom' && !event.title) return false
    if (event.template.requiresYear && !event.year) return false
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const invalidEvents = events.filter(e => !validateEvent(e))
    if (invalidEvents.length > 0) {
      alert('Please fill in all required fields for each event')
      return
    }

    if (events.length === 0) {
      alert('Please add at least one event')
      return
    }

    setLoading(true)

    try {
      const eventsToSubmit = events.map(event => {
        const year = event.hasYear && event.year ? event.year : 2000
        const date = new Date(year, event.month! - 1, event.day!)
        
        return {
          type: event.template.type,
          title: event.template.type === 'CUSTOM' ? (event.title || event.template.name) : undefined,
          date: date.toISOString(),
          yearKnown: event.hasYear && !!event.year,
          notes: event.notes,
        }
      })

      const result = await submitEventsViaToken({
        token,
        events: eventsToSubmit,
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
            {/* Event Type Selector */}
            {showSelector && events.length === 0 && (
              <EventTypeSelector onSelect={addEvent} />
            )}

            {/* Added Events */}
            {events.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Your Events ({events.length})
                  </h3>
                  {!showSelector && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSelector(true)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Add Another
                    </Button>
                  )}
                </div>

                {events.map((event) => {
                  const colors = getColorClasses(event.template.color) || { bg: 'bg-neutral-50', border: 'border-neutral-200' }
                  return (
                    <div
                      key={event.id}
                      className={`p-5 rounded-xl border-2 ${colors.bg} ${colors.border} relative space-y-4`}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{event.template.icon}</span>
                          <div>
                            <h4 className="font-semibold text-lg">
                              {event.template.name}
                            </h4>
                            <p className="text-sm text-neutral-600">
                              {event.recurring ? 'Repeats every year' : 'One-time event'}
                            </p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEvent(event.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Custom Event Title */}
                      {event.template.type === 'CUSTOM' && event.template.id === 'custom' && (
                        <div>
                          <Label>Event Name *</Label>
                          <Input
                            value={event.title || ''}
                            onChange={(e) => updateEvent(event.id, { title: e.target.value })}
                            placeholder="e.g., First Day of School"
                            className="mt-1"
                          />
                        </div>
                      )}

                      {/* Recurring Toggle (for custom events only) */}
                      {event.template.type === 'CUSTOM' && event.template.id === 'custom' && (
                        <div className="flex items-center gap-3 p-3 bg-white/50 rounded-lg border">
                          <div className="flex-1">
                            <Label className="text-sm font-medium">Event Type</Label>
                            <p className="text-xs text-neutral-600 mt-0.5">
                              {event.recurring ? 'This event will repeat every year' : 'This is a one-time event'}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant={event.recurring ? 'default' : 'outline'}
                              onClick={() => updateEvent(event.id, { recurring: true })}
                              className="text-xs"
                            >
                              🔄 Recurring
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant={!event.recurring ? 'default' : 'outline'}
                              onClick={() => updateEvent(event.id, { recurring: false, hasYear: true })}
                              className="text-xs"
                            >
                              📅 One-time
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Date Pickers */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label>Month *</Label>
                          <MonthPicker
                            value={event.month}
                            onChange={(month) => updateEvent(event.id, { month })}
                          />
                        </div>
                        <div>
                          <Label>Day *</Label>
                          <DayPicker
                            value={event.day}
                            month={event.month}
                            year={event.year}
                            onChange={(day) => updateEvent(event.id, { day })}
                          />
                        </div>
                      </div>

                      {/* Year Toggle - Special handling for birthdays */}
                      {event.template.type === 'BIRTHDAY' ? (
                        <YearToggle
                          hasYear={event.hasYear}
                          year={event.year}
                          onToggleChange={(hasYear) => updateEvent(event.id, { hasYear })}
                          onYearChange={(year) => updateEvent(event.id, { year })}
                          label="Include birth year (you can keep your age private by leaving this unchecked)"
                        />
                      ) : (
                        <YearToggle
                          hasYear={event.hasYear}
                          year={event.year}
                          onToggleChange={(hasYear) => updateEvent(event.id, { hasYear })}
                          onYearChange={(year) => updateEvent(event.id, { year })}
                          label={event.template.requiresYear ? 'Year (required)' : 'I know the year (optional)'}
                        />
                      )}

                      {/* Notes */}
                      <div>
                        <Label>Notes (optional)</Label>
                        <Input
                          value={event.notes || ''}
                          onChange={(e) => updateEvent(event.id, { notes: e.target.value })}
                          placeholder="Add any special notes..."
                          className="mt-1"
                        />
                      </div>
                    </div>
                  )
                })}

                {/* Add More Button (when selector is hidden) */}
                {showSelector && events.length > 0 && (
                  <EventTypeSelector onSelect={addEvent} />
                )}
              </div>
            )}

            {/* Submit Button */}
            {events.length > 0 && (
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
                    <>Submit {events.length} Event{events.length > 1 ? 's' : ''} 🎉</>
                  )}
                </Button>
                <p className="text-xs text-neutral-500 text-center mt-3">
                  By submitting, you agree to share these dates with your group.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
