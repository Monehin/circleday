'use client'

/**
 * View Events Modal Component
 * 
 * Displays all events for a specific member.
 * Shows existing events in a read-only view using EventSummaryList.
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { getContactEvents, deleteEvent } from '@/lib/actions/events'
import { Loader2 } from 'lucide-react'
import { EventSummaryList, type SavedEvent } from '@/components/events/event-summary-list'
import { EVENT_TEMPLATES } from '@/components/ui/event-type-selector'
import { EditEventModal } from '@/components/dashboard/edit-event-modal'
import { toast } from 'sonner'

interface ViewEventsModalProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    name: string
  }
}

export function ViewEventsModal({ isOpen, onClose, contact }: ViewEventsModalProps) {
  const [events, setEvents] = useState<SavedEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any | null>(null)
  const [rawEvents, setRawEvents] = useState<any[]>([]) // Store raw DB events for editing

  // Load events when modal opens
  useEffect(() => {
    if (isOpen && contact.id) {
      loadEvents()
    }
  }, [isOpen, contact.id])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEvents([])
      setRawEvents([])
      setEditingEvent(null)
    }
  }, [isOpen])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const result = await getContactEvents(contact.id)
      if (result.success && result.events) {
        // Store raw events for editing
        setRawEvents(result.events)
        
        // Map database events to SavedEvent format for consistent display
        const mappedEvents: SavedEvent[] = result.events.map((event) => {
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
            id: event.id,
            template,
            title: event.title || undefined,
            month,
            day,
            year,
            recurring: event.repeat,
            notes: event.notes || undefined,
          }
        })
        setEvents(mappedEvents)
      }
    } catch (error) {
      console.error('Failed to load events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (event: SavedEvent) => {
    // Find the raw event data
    const rawEvent = rawEvents.find(e => e.id === event.id)
    if (rawEvent) {
      setEditingEvent(rawEvent)
    }
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return
    }

    try {
      const result = await deleteEvent(eventId)
      if (result.success) {
        toast.success('Event deleted successfully!')
        await loadEvents() // Reload the list
      } else {
        toast.error(result.error || 'Failed to delete event')
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {contact.name}'s Events
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            View all celebrations and special days
          </p>
        </DialogHeader>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">No Events Yet</h3>
              <p className="text-sm text-muted-foreground">
                No events have been added for {contact.name}.
              </p>
            </div>
          ) : (
            <EventSummaryList 
              events={events}
              onRemove={handleDelete}
              onEdit={handleEdit}
              title={`All Events (${events.length})`}
              variant="info"
              readonly={false}
            />
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>

      {/* Edit Event Modal */}
      {editingEvent && (
        <EditEventModal
          isOpen={true}
          onClose={() => setEditingEvent(null)}
          event={editingEvent}
          contactName={contact.name}
          onSuccess={() => {
            setEditingEvent(null)
            loadEvents()
          }}
        />
      )}
    </Dialog>
  )
}

