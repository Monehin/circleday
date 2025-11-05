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
import { Loader2 } from 'lucide-react'
import { EventTypeSelector } from '@/components/ui/event-type-selector'
import { EventFormCard } from '@/components/events/event-form-card'
import { EventSummaryList } from '@/components/events/event-summary-list'
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

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

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
        onSuccess?.()
        onClose()
        reset()
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
          {/* Summary List */}
          <EventSummaryList 
            events={savedEvents}
            onRemove={removeSavedEvent}
            onEdit={editSavedEvent}
          />

          {/* Event Type Selector */}
          {showSelector && !currentEvent && (
            <EventTypeSelector onSelect={startAddingEvent} />
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
