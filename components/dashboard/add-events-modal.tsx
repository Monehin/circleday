'use client'

/**
 * Add Events Modal Component (v4 - Refactored with Shared Components)
 * 
 * Clean, focused UX using shared event components.
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { createBulkEvents } from '@/lib/actions/events-bulk'
import { getContactEvents } from '@/lib/actions/events'
import { Loader2 } from 'lucide-react'
import { EventTypeSelector, EVENT_TEMPLATES } from '@/components/ui/event-type-selector'
import { EventFormCard } from '@/components/events/event-form-card'
import { EventSummaryList, type SavedEvent } from '@/components/events/event-summary-list'
import { useEventForm } from '@/lib/hooks/use-event-form'

interface AddEventsModalProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    name: string
    email?: string | null
  }
  groupId: string
  onSuccess?: () => void
}

export function AddEventsModal({ isOpen, onClose, contact, groupId, onSuccess }: AddEventsModalProps) {
  const [loading, setLoading] = useState(false)
  const [existingEvents, setExistingEvents] = useState<SavedEvent[]>([])
  const [loadingExisting, setLoadingExisting] = useState(false)
  
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
    reset,
  } = useEventForm()

  // Load existing events when modal opens
  useEffect(() => {
    if (isOpen && contact.id) {
      loadExistingEvents()
    }
  }, [isOpen, contact.id])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
      setExistingEvents([])
    }
  }, [isOpen, reset])

  const loadExistingEvents = async () => {
    setLoadingExisting(true)
    try {
      const result = await getContactEvents(contact.id)
      if (result.success && result.events) {
        // Map database events to SavedEvent format for consistent display
        const mappedEvents: SavedEvent[] = result.events.map((event, index) => {
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
            id: `existing-${event.id}`,
            template,
            title: event.title || undefined,
            month,
            day,
            year,
            recurring: event.repeat,
            notes: event.notes || undefined,
          }
        })
        setExistingEvents(mappedEvents)
      }
    } catch (error) {
      console.error('Failed to load existing events:', error)
    } finally {
      setLoadingExisting(false)
    }
  }

  const handleAddToList = () => {
    const error = addCurrentEventToList()
    if (error) {
      toast.error(error)
    } else {
      toast.success('Event added to list!')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (savedEvents.length === 0) {
      toast.error('Please add at least one event')
      return
    }

    setLoading(true)

    try {
      const eventsToCreate = savedEvents.map(event => {
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

      const result = await createBulkEvents({
        contactId: contact.id,
        groupId,
        events: eventsToCreate,
      })

      if (result.success) {
        toast.success(`Successfully added ${savedEvents.length} event(s) for ${contact.name}!`)
        reset()
        await loadExistingEvents() // Reload to show newly added events
        onSuccess?.()
      } else {
        toast.error(result.error || 'Failed to create events')
      }
    } catch (error) {
      console.error('Failed to create events:', error)
      toast.error('Failed to create events. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Add Events for {contact.name}
          </DialogTitle>
          <p className="text-sm text-neutral-600 mt-1">
            Add one event at a time for a focused experience
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Existing Events Section */}
          {loadingExisting ? (
            <div className="flex items-center justify-center py-8 text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Loading existing events...
            </div>
          ) : (
            <EventSummaryList 
              events={existingEvents}
              title="Previously Added Events"
              variant="info"
              readonly={true}
            />
          )}

          {/* New Events Section */}
          <EventSummaryList 
            events={savedEvents}
            onRemove={removeSavedEvent}
            onEdit={editSavedEvent}
            title="New Events to Add"
            variant="success"
          />

          {/* Event Type Selector */}
          {showSelector && !currentEvent && (
            <div className={savedEvents.length > 0 || existingEvents.length > 0 ? 'border-t pt-4' : ''}>
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
                : `${savedEvents.length} event(s) ready to save`}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Close
              </Button>
              <Button
                type="submit"
                disabled={loading || savedEvents.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save All ({savedEvents.length})</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
