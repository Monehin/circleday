'use client'

/**
 * Edit Event Modal Component
 * 
 * Allows editing of an individual event.
 * Uses EventFormCard for consistent UX.
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { updateEvent, deleteEvent } from '@/lib/actions/events'
import { Loader2, Trash2 } from 'lucide-react'
import { EventFormCard } from '@/components/events/event-form-card'
import type { SavedEvent } from '@/components/events/event-summary-list'
import { EVENT_TEMPLATES } from '@/components/ui/event-type-selector'

interface EditEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: {
    id: string
    type: string
    title?: string | null
    date: Date
    yearKnown: boolean
    repeat: boolean
    notes?: string | null
  }
  contactName: string
  onSuccess?: () => void
}

export function EditEventModal({ isOpen, onClose, event, contactName, onSuccess }: EditEventModalProps) {
  const [currentEvent, setCurrentEvent] = useState<SavedEvent | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Initialize event data when modal opens
  useEffect(() => {
    if (isOpen && event) {
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

      setCurrentEvent({
        id: event.id,
        template,
        title: event.title || undefined,
        month,
        day,
        year,
        recurring: event.repeat,
        notes: event.notes || undefined,
      })
    }
  }, [isOpen, event])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCurrentEvent(null)
      setShowDeleteConfirm(false)
    }
  }, [isOpen])

  const handleChange = (updatedEvent: any) => {
    // Preserve the id and recurring fields when updating
    if (currentEvent) {
      setCurrentEvent({
        ...updatedEvent,
        id: currentEvent.id,
        recurring: currentEvent.recurring,
      })
    }
  }

  const handleSave = async () => {
    if (!currentEvent) return

    // Validation
    if (!currentEvent.month || !currentEvent.day) {
      toast.error('Please select a month and day')
      return
    }

    if (!currentEvent.recurring && !currentEvent.year) {
      toast.error('Please provide a year for one-time events')
      return
    }

    if (currentEvent.recurring && currentEvent.year) {
      const currentYear = new Date().getFullYear()
      if (currentEvent.year > currentYear) {
        toast.error('Year cannot be in the future for recurring events')
        return
      }
    }

    if (!currentEvent.recurring && currentEvent.year) {
      const eventDate = new Date(currentEvent.year, currentEvent.month - 1, currentEvent.day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate <= today) {
        toast.error('One-time events must be in the future')
        return
      }
    }

    setLoading(true)

    try {
      const year = currentEvent.recurring ? 2000 : currentEvent.year!
      const date = new Date(year, currentEvent.month - 1, currentEvent.day)
      
      const result = await updateEvent({
        eventId: event.id,
        title: currentEvent.template.type === 'CUSTOM' ? (currentEvent.title || currentEvent.template.name) : undefined,
        date: date.toISOString(),
        yearKnown: !currentEvent.recurring && !!currentEvent.year,
        repeat: currentEvent.recurring,
        notes: currentEvent.notes,
      })

      if (result.success) {
        toast.success('Event updated successfully!')
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to update event')
      }
    } catch (error) {
      console.error('Failed to update event:', error)
      toast.error('Failed to update event. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const result = await deleteEvent(event.id)

      if (result.success) {
        toast.success('Event deleted successfully!')
        onSuccess?.()
        onClose()
      } else {
        toast.error(result.error || 'Failed to delete event')
        setShowDeleteConfirm(false)
      }
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast.error('Failed to delete event. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  if (!currentEvent) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            Edit Event for {contactName}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Update the details of this celebration
          </p>
        </DialogHeader>

        <div className="mt-4">
          {showDeleteConfirm ? (
            // Delete Confirmation
            <div className="bg-red-50 dark:bg-red-950/20 border-2 border-red-200 dark:border-red-900/50 rounded-lg p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/50 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">Delete Event?</h3>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete this event? This action cannot be undone.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Event
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            // Edit Form
            <>
              <EventFormCard
                event={currentEvent}
                onChange={handleChange}
                onAdd={handleSave}
                onCancel={onClose}
                addButtonText="Save Changes"
                cancelButtonText="Cancel"
              />

              {/* Delete Button */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  variant="destructive"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete This Event
                </Button>
              </div>
            </>
          )}
        </div>

        {loading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

