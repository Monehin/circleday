'use client'

/**
 * Shared Event Form Card Component
 * 
 * Reusable UI for adding/editing a single event.
 * Used in both admin modal and public form.
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Calendar, Check } from 'lucide-react'
import { MonthPicker } from '@/components/ui/month-picker'
import { DayPicker } from '@/components/ui/day-picker'
import type { EventTemplate } from '@/components/ui/event-type-selector'

interface CurrentEvent {
  template: EventTemplate
  title?: string
  month?: number
  day?: number
  year?: number
  notes?: string
}

interface EventFormCardProps {
  event: CurrentEvent
  onChange: (event: CurrentEvent) => void
  onAdd: () => void
  onCancel: () => void
  currentYear?: number
  addButtonText?: string
  cancelButtonText?: string
}

export function EventFormCard({ 
  event, 
  onChange, 
  onAdd, 
  onCancel, 
  currentYear = new Date().getFullYear(),
  addButtonText = 'Add to List',
  cancelButtonText = 'Cancel'
}: EventFormCardProps) {
  const getColorClasses = (color: string): { bg: string; border: string; text: string } => {
    const colors: Record<string, { bg: string; border: string; text: string }> = {
      violet: { bg: 'bg-violet-50', border: 'border-violet-200', text: 'text-violet-700' },
      pink: { bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
      green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
      orange: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
      neutral: { bg: 'bg-neutral-50', border: 'border-neutral-200', text: 'text-neutral-700' },
    }
    return colors[color] || colors.neutral!
  }

  const colors = getColorClasses(event.template.color)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Adding: {event.template.name}
        </h3>
      </div>

      <div className={`p-6 rounded-xl border-2 ${colors.bg} ${colors.border} space-y-4`}>
        {/* Event Type Badge */}
        <div className="flex items-center gap-2">
          <span className="text-3xl">{event.template.icon}</span>
          <div>
            <p className={`text-sm font-medium ${colors.text}`}>
              {event.template.recurring ? '🔄 Repeats every year' : '📅 One-time event'}
            </p>
            {!event.template.recurring && (
              <p className="text-xs text-neutral-600 mt-0.5">
                Date must be in the future
              </p>
            )}
          </div>
        </div>

        {/* Custom Event Title */}
        {event.template.type === 'CUSTOM' && event.template.id === 'custom' && (
          <div>
            <Label>Event Name *</Label>
            <Input
              value={event.title || ''}
              onChange={(e) => onChange({ ...event, title: e.target.value })}
              placeholder="e.g., First Day of School"
              className="mt-1"
              autoFocus
            />
          </div>
        )}

        {/* Date Inputs - Recurring Events */}
        {event.template.recurring && (
          <div className="space-y-3">
            <Label>When does this happen each year? *</Label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm text-neutral-600">Month</Label>
                <MonthPicker
                  value={event.month}
                  onChange={(month) => onChange({ ...event, month })}
                />
              </div>
              <div>
                <Label className="text-sm text-neutral-600">Day</Label>
                <DayPicker
                  value={event.day}
                  month={event.month}
                  year={event.year}
                  onChange={(day) => onChange({ ...event, day })}
                />
              </div>
            </div>
          </div>
        )}

        {/* Date Inputs - One-Time Events */}
        {!event.template.recurring && (
          <div className="space-y-3">
            <Label>When is this event? *</Label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label className="text-sm text-neutral-600">Month</Label>
                <MonthPicker
                  value={event.month}
                  onChange={(month) => onChange({ ...event, month })}
                />
              </div>
              <div>
                <Label className="text-sm text-neutral-600">Day</Label>
                <DayPicker
                  value={event.day}
                  month={event.month}
                  year={event.year}
                  onChange={(day) => onChange({ ...event, day })}
                />
              </div>
              <div>
                <Label className="text-sm text-neutral-600">Year</Label>
                <Input
                  type="number"
                  min={currentYear}
                  max={currentYear + 50}
                  value={event.year || ''}
                  onChange={(e) => onChange({ 
                    ...event, 
                    year: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  placeholder={currentYear.toString()}
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <Label>Notes (optional)</Label>
          <Input
            value={event.notes || ''}
            onChange={(e) => onChange({ ...event, notes: e.target.value })}
            placeholder="Add any special notes..."
            className="mt-1"
          />
        </div>

        {/* Add/Cancel Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            {cancelButtonText}
          </Button>
          <Button
            type="button"
            onClick={onAdd}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Check className="mr-2 h-4 w-4" />
            {addButtonText}
          </Button>
        </div>
      </div>
    </div>
  )
}

