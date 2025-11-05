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
import { getContactEvents } from '@/lib/actions/events'
import { Loader2 } from 'lucide-react'
import { EventSummaryList, type SavedEvent } from '@/components/events/event-summary-list'
import { EVENT_TEMPLATES } from '@/components/ui/event-type-selector'

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
    }
  }, [isOpen])

  const loadEvents = async () => {
    setLoading(true)
    try {
      const result = await getContactEvents(contact.id)
      if (result.success && result.events) {
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
              title={`All Events (${events.length})`}
              variant="info"
              readonly={true}
            />
          )}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t">
          <Button onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

