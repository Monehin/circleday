'use client'

/**
 * Add Events Modal Component
 * 
 * Allows group admins to quickly add multiple events for a member.
 * Supports birthday, anniversary, and custom events in one form.
 */

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { createBulkEvents, getContactEvents, type BulkEventInput } from '@/lib/actions/events-bulk'
import { CalendarPlus, Trash2, Plus, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

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
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM'
  title?: string
  date: string
  yearKnown: boolean
  notes?: string
}

export function AddEventsModal({ isOpen, onClose, contact, groupId, onSuccess }: AddEventsModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingExisting, setLoadingExisting] = useState(false)
  const [birthday, setBirthday] = useState<Partial<EventFormData>>({
    type: 'BIRTHDAY',
    yearKnown: true,
  })
  const [anniversary, setAnniversary] = useState<Partial<EventFormData>>({
    type: 'ANNIVERSARY',
    yearKnown: true,
  })
  const [customEvents, setCustomEvents] = useState<Partial<EventFormData>[]>([])

  // Load existing events when modal opens
  useEffect(() => {
    if (isOpen && contact.id && groupId) {
      loadExistingEvents()
    }
  }, [isOpen, contact.id, groupId])

  const loadExistingEvents = async () => {
    setLoadingExisting(true)
    try {
      const result = await getContactEvents(contact.id, groupId)
      if (result.success && result.data) {
        // Pre-populate existing events
        result.data.forEach((event) => {
          const dateStr = format(event.date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
          
          if (event.type === 'BIRTHDAY') {
            setBirthday({
              type: 'BIRTHDAY',
              date: dateStr,
              yearKnown: event.yearKnown,
              notes: event.notes || '',
            })
          } else if (event.type === 'ANNIVERSARY') {
            setAnniversary({
              type: 'ANNIVERSARY',
              date: dateStr,
              yearKnown: event.yearKnown,
              notes: event.notes || '',
            })
          } else if (event.type === 'CUSTOM') {
            setCustomEvents((prev) => [
              ...prev,
              {
                type: 'CUSTOM',
                title: event.title || '',
                date: dateStr,
                yearKnown: event.yearKnown,
                notes: event.notes || '',
              },
            ])
          }
        })
      }
    } catch (error) {
      console.error('Failed to load existing events:', error)
    } finally {
      setLoadingExisting(false)
    }
  }

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
      // Collect all events to create
      const events: BulkEventInput['events'] = []

      // Add birthday if date is provided
      if (birthday.date) {
        events.push({
          type: 'BIRTHDAY',
          date: birthday.date,
          yearKnown: birthday.yearKnown ?? true,
          notes: birthday.notes,
        })
      }

      // Add anniversary if date is provided
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
        toast.error('Please add at least one event')
        return
      }

      // Submit bulk events
      const result = await createBulkEvents({
        contactId: contact.id,
        groupId,
        events,
      })

      if (result.success) {
        toast.success(`Successfully added ${events.length} event(s) for ${contact.name}!`)
        onSuccess?.()
        onClose()
        
        // Reset form
        setBirthday({ type: 'BIRTHDAY', yearKnown: true })
        setAnniversary({ type: 'ANNIVERSARY', yearKnown: true })
        setCustomEvents([])
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
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarPlus className="h-5 w-5 text-violet-600" />
            Add Events for {contact.name}
          </DialogTitle>
        </DialogHeader>

        {loadingExisting ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Birthday Section */}
            <div className="space-y-3 p-4 bg-violet-50 rounded-lg border border-violet-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎂</span>
                <Label className="text-lg font-semibold">Birthday</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="birthday-date">Date</Label>
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
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={birthday.yearKnown ?? true}
                      onChange={(e) =>
                        setBirthday({ ...birthday, yearKnown: e.target.checked })
                      }
                      className="h-4 w-4 text-violet-600 rounded"
                    />
                    <span className="text-sm">Year known</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="birthday-notes">Notes (optional)</Label>
                <Input
                  id="birthday-notes"
                  placeholder="e.g., Favorite cake flavor"
                  value={birthday.notes || ''}
                  onChange={(e) => setBirthday({ ...birthday, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Anniversary Section */}
            <div className="space-y-3 p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💍</span>
                <Label className="text-lg font-semibold">Anniversary</Label>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="anniversary-date">Date</Label>
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
                  />
                </div>
                
                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={anniversary.yearKnown ?? true}
                      onChange={(e) =>
                        setAnniversary({ ...anniversary, yearKnown: e.target.checked })
                      }
                      className="h-4 w-4 text-pink-600 rounded"
                    />
                    <span className="text-sm">Year known</span>
                  </label>
                </div>
              </div>

              <div>
                <Label htmlFor="anniversary-notes">Notes (optional)</Label>
                <Input
                  id="anniversary-notes"
                  placeholder="e.g., Wedding anniversary"
                  value={anniversary.notes || ''}
                  onChange={(e) => setAnniversary({ ...anniversary, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Custom Events Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-lg font-semibold flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Custom Events
                </Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomEvent}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom Event
                </Button>
              </div>

              {customEvents.map((event, index) => (
                <div
                  key={index}
                  className="space-y-3 p-4 bg-blue-50 rounded-lg border border-blue-200 relative"
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCustomEvent(index)}
                    className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Event Name</Label>
                      <Input
                        placeholder="e.g., Graduation"
                        value={event.title || ''}
                        onChange={(e) =>
                          updateCustomEvent(index, { title: e.target.value })
                        }
                      />
                    </div>

                    <div>
                      <Label>Date</Label>
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
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={event.yearKnown ?? true}
                        onChange={(e) =>
                          updateCustomEvent(index, { yearKnown: e.target.checked })
                        }
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <span className="text-sm">Year known</span>
                    </label>
                  </div>

                  <div>
                    <Label>Notes (optional)</Label>
                    <Input
                      placeholder="Add any special notes..."
                      value={event.notes || ''}
                      onChange={(e) =>
                        updateCustomEvent(index, { notes: e.target.value })
                      }
                    />
                  </div>
                </div>
              ))}

              {customEvents.length === 0 && (
                <p className="text-sm text-neutral-500 italic">
                  No custom events yet. Click "Add Custom Event" to add one.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save All Events'
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

