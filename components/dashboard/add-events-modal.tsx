'use client'

/**
 * Add Events Modal Component (v2 - Improved UX)
 * 
 * Allows group admins to quickly add multiple events for a member.
 * Features:
 * - Starts with empty state (no assumptions)
 * - Event type selection with templates
 * - Smart month/day/year pickers
 * - Progressive disclosure
 * - Support for recurring and one-time events
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createBulkEvents, getContactEvents } from '@/lib/actions/events-bulk'
import { Trash2, Loader2, Plus } from 'lucide-react'
import { MonthPicker } from '@/components/ui/month-picker'
import { DayPicker } from '@/components/ui/day-picker'
import { YearToggle } from '@/components/ui/year-toggle'
import { EventTypeSelector, EVENT_TEMPLATES, type EventTemplate } from '@/components/ui/event-type-selector'

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

interface EventFormData {
  id: string // Unique ID for React keys
  template: EventTemplate
  title?: string
  month?: number
  day?: number
  hasYear: boolean
  year?: number
  recurring: boolean // User can override for custom events
  notes?: string
}

export function AddEventsModal({ isOpen, onClose, contact, groupId, onSuccess }: AddEventsModalProps) {
  const [loading, setLoading] = useState(false)
  const [showSelector, setShowSelector] = useState(true)
  const [events, setEvents] = useState<EventFormData[]>([])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setEvents([])
      setShowSelector(true)
    }
  }, [isOpen])

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
    // Must have month and day
    if (!event.month || !event.day) return false
    
    // If custom event without predefined title, must have custom title
    if (event.template.type === 'CUSTOM' && event.template.id === 'custom' && !event.title) return false
    
    // If requires year, must have year
    if (event.template.requiresYear && !event.year) return false
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate all events
    const invalidEvents = events.filter(e => !validateEvent(e))
    if (invalidEvents.length > 0) {
      toast.error('Please fill in all required fields for each event')
      return
    }

    if (events.length === 0) {
      toast.error('Please add at least one event')
      return
    }

    setLoading(true)

    try {
      // Convert to API format
      const eventsToCreate = events.map(event => {
        // Create date: always use month/day, optionally year
        const year = event.hasYear && event.year ? event.year : 2000 // Use 2000 as placeholder for recurring
        const date = new Date(year, event.month! - 1, event.day!)
        
        return {
          type: event.template.type,
          title: event.template.type === 'CUSTOM' ? (event.title || event.template.name) : undefined,
          date: date.toISOString(),
          yearKnown: event.hasYear && !!event.year,
          notes: event.notes,
        }
      })

      const result = await createBulkEvents({
        contactId: contact.id,
        groupId,
        events: eventsToCreate,
      })

      if (result.success) {
        toast.success(`Successfully added ${events.length} event(s) for ${contact.name}!`)
        onSuccess?.()
        onClose()
        setEvents([])
        setShowSelector(true)
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
            Choose event types and add details
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Event Type Selector (shown when no events or user wants to add more) */}
          {showSelector && events.length === 0 && (
            <EventTypeSelector onSelect={addEvent} />
          )}

          {/* Added Events */}
          {events.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">
                  Added Events ({events.length})
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
                            {event.recurring ? 'Repeats yearly' : 'One-time event'}
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

                    {/* Year Toggle */}
                    <YearToggle
                      hasYear={event.hasYear}
                      year={event.year}
                      onToggleChange={(hasYear) => updateEvent(event.id, { hasYear })}
                      onYearChange={(year) => updateEvent(event.id, { year })}
                      label={event.template.requiresYear ? 'Year (required)' : 'I know the year (optional)'}
                    />

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

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-neutral-600">
              {events.length === 0 ? 'No events added yet' : `${events.length} event(s) ready to save`}
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || events.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>Save {events.length > 0 ? `(${events.length})` : ''} Events</>
                )}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
