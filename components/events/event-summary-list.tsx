'use client'

/**
 * Shared Event Summary List Component
 * 
 * Displays a list of saved events ready to submit.
 * Used in both admin modal and public form.
 */

import { Button } from '@/components/ui/button'
import { Check, Trash2, Edit } from 'lucide-react'
import { format } from 'date-fns'
import type { EventTemplate } from '@/components/ui/event-type-selector'

export interface SavedEvent {
  id: string
  template: EventTemplate
  title?: string
  month: number
  day: number
  year?: number
  recurring: boolean
  notes?: string
}

interface EventSummaryListProps {
  events: SavedEvent[]
  onRemove: (id: string) => void
  onEdit?: (event: SavedEvent) => void
  title?: string
}

export function EventSummaryList({ events, onRemove, onEdit, title = 'Events Ready to Save' }: EventSummaryListProps) {
  const formatEventDate = (event: SavedEvent) => {
    if (event.recurring) {
      return `${format(new Date(2000, event.month - 1, event.day), 'MMMM d')} (every year)`
    } else {
      return format(new Date(event.year!, event.month - 1, event.day), 'MMMM d, yyyy')
    }
  }

  if (events.length === 0) {
    return null
  }

  return (
    <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Check className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold text-green-900">
          {title} ({events.length})
        </h3>
      </div>
      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-200"
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{event.template.icon}</span>
              <div className="flex-1">
                <p className="font-medium text-neutral-900">
                  {event.template.type === 'CUSTOM' ? event.title : event.template.name}
                </p>
                <p className="text-sm text-neutral-600">
                  {formatEventDate(event)}
                </p>
                {event.notes && (
                  <p className="text-xs text-neutral-500 mt-1 italic">
                    Note: {event.notes}
                  </p>
                )}
              </div>
            </div>
            <div className="flex gap-1">
              {onEdit && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(event)}
                  className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                  title="Edit event"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onRemove(event.id)}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                title="Remove event"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

