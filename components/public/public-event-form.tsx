'use client'

/**
 * Public Event Form Component (v4 - Refactored with Shared Components + Persistence)
 * 
 * Allows members to add/edit their events via invite link.
 * Shows existing events on reload for editing.
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Check } from 'lucide-react'
import { submitEventsViaToken } from '@/lib/actions/event-invite-tokens'
import { EventTypeSelector, EVENT_TEMPLATES } from '@/components/ui/event-type-selector'
import { EventFormCard } from '@/components/events/event-form-card'
import { EventSummaryList, type SavedEvent } from '@/components/events/event-summary-list'
import { useEventForm } from '@/lib/hooks/use-event-form'

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

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function PublicEventForm({ token, contactName, groupId, existingEvents }: PublicEventFormProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  
  const {
    showSelector,
    currentEvent,
    savedEvents,
    startAddingEvent,
    cancelCurrentEvent,
    setCurrentEvent,
    addCurrentEventToList,
    removeSavedEvent,
    editSavedEvent,
    initializeFromExisting,
  } = useEventForm()

  // Initialize with existing events
  useEffect(() => {
    if (existingEvents && existingEvents.length > 0) {
      const mappedEvents: SavedEvent[] = existingEvents.map((event, index) => {
        // Map existing event to SavedEvent format
        const date = new Date(event.date)
        const month = date.getMonth() + 1
        const day = date.getDate()
        const year = event.yearKnown ? date.getFullYear() : undefined
        
        // Find matching template
        let template = EVENT_TEMPLATES.find(t => {
          if (event.type === 'BIRTHDAY') return t.id === 'birthday'
          if (event.type === 'ANNIVERSARY') return t.id === 'anniversary'
          return t.id === 'custom'
        }) || EVENT_TEMPLATES[EVENT_TEMPLATES.length - 1]!

        return {
          id: `existing-${index}`,
          template,
          title: event.title || undefined,
          month,
          day,
          year,
          recurring: !event.yearKnown,
          notes: undefined,
        }
      })
      
      initializeFromExisting(mappedEvents)
    }
  }, [existingEvents, initializeFromExisting])

  const handleAddToList = () => {
    const error = addCurrentEventToList()
    if (error) {
      alert(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (savedEvents.length === 0) {
      alert('Please add at least one event')
      return
    }

    setLoading(true)

    try {
      const eventsToSubmit = savedEvents.map(event => {
        const year = event.recurring ? 2000 : event.year!
        const date = new Date(year, event.month - 1, event.day)
        
        return {
          type: event.template.type,
          title: event.template.type === 'CUSTOM' ? (event.title || event.template.name) : undefined,
          date: date.toISOString(),
          yearKnown: !event.recurring && !!event.year,
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
        alert(result.error || 'Failed to submit events. Please try again.')
      }
    } catch (error) {
      console.error('Failed to submit events:', error)
      alert('Failed to submit events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Success state
  if (submitted) {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <Card className="border-green-200 shadow-xl">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-neutral-900 mb-3">
              Thank You! 🎉
            </h2>
            <p className="text-lg text-neutral-600 mb-6">
              Your events have been submitted successfully.
            </p>
            <p className="text-sm text-neutral-500">
              We'll make sure to celebrate with you!
            </p>
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
            {savedEvents.length > 0 
              ? 'Review and update your events below, or add new ones.'
              : 'Share your important dates so we can celebrate together.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Summary List with Edit/Remove */}
            <EventSummaryList 
              events={savedEvents}
              onRemove={removeSavedEvent}
              onEdit={editSavedEvent}
              title="Your Events"
            />

            {/* Event Type Selector */}
            {showSelector && !currentEvent && (
              <div>
                {savedEvents.length > 0 && (
                  <p className="text-sm text-neutral-600 mb-4 text-center">
                    Want to add more events? Select one below:
                  </p>
                )}
                <EventTypeSelector onSelect={startAddingEvent} />
              </div>
            )}

            {/* Current Event Form */}
            {currentEvent && (
              <EventFormCard
                event={currentEvent}
                onChange={setCurrentEvent}
                onAdd={handleAddToList}
                onCancel={cancelCurrentEvent}
              />
            )}

            {/* Final Actions */}
            <div className="flex justify-between items-center pt-4 border-t">
              <p className="text-sm text-neutral-600">
                {savedEvents.length === 0 
                  ? 'No events added yet' 
                  : `${savedEvents.length} event(s) ready to submit`}
              </p>
              <Button
                type="submit"
                disabled={loading || savedEvents.length === 0}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>Submit All ({savedEvents.length})</>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
