'use client'

/**
 * Shared Event Form Hook
 * 
 * Manages event form state and validation logic.
 * Used in both admin modal and public form.
 */

import { useState } from 'react'
import type { EventTemplate } from '@/components/ui/event-type-selector'
import type { SavedEvent } from '@/components/events/event-summary-list'

export interface CurrentEvent {
  template: EventTemplate
  title?: string
  month?: number
  day?: number
  year?: number
  notes?: string
}

export function useEventForm() {
  const [showSelector, setShowSelector] = useState(true)
  const [currentEvent, setCurrentEvent] = useState<CurrentEvent | null>(null)
  const [savedEvents, setSavedEvents] = useState<SavedEvent[]>([])

  const startAddingEvent = (template: EventTemplate) => {
    setCurrentEvent({
      template,
      title: template.type === 'CUSTOM' && template.id !== 'custom' ? template.name : '',
    })
    setShowSelector(false)
  }

  const cancelCurrentEvent = () => {
    setCurrentEvent(null)
    setShowSelector(true)
  }

  const validateCurrentEvent = (): string | null => {
    if (!currentEvent) return 'No event to validate'
    
    if (!currentEvent.month || !currentEvent.day) {
      return 'Please select both month and day'
    }
    
    if (currentEvent.template.type === 'CUSTOM' && currentEvent.template.id === 'custom' && !currentEvent.title?.trim()) {
      return 'Please enter an event name'
    }
    
    if (!currentEvent.template.recurring) {
      if (!currentEvent.year) {
        return 'Please enter the year for this one-time event'
      }
      
      const eventDate = new Date(currentEvent.year, currentEvent.month - 1, currentEvent.day)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (eventDate < today) {
        return 'One-time events must be in the future'
      }
    }
    
    return null
  }

  const addCurrentEventToList = (): string | null => {
    const error = validateCurrentEvent()
    if (error) {
      return error
    }

    if (!currentEvent) return 'No event to add'

    const savedEvent: SavedEvent = {
      id: `${Date.now()}-${Math.random()}`,
      template: currentEvent.template,
      title: currentEvent.title,
      month: currentEvent.month!,
      day: currentEvent.day!,
      year: currentEvent.year,
      recurring: currentEvent.template.recurring,
      notes: currentEvent.notes,
    }

    setSavedEvents([...savedEvents, savedEvent])
    setCurrentEvent(null)
    setShowSelector(true)
    return null
  }

  const removeSavedEvent = (id: string) => {
    setSavedEvents(savedEvents.filter(e => e.id !== id))
  }

  const editSavedEvent = (event: SavedEvent) => {
    // Remove from saved list and put back into editing mode
    setSavedEvents(savedEvents.filter(e => e.id !== event.id))
    setCurrentEvent({
      template: event.template,
      title: event.title,
      month: event.month,
      day: event.day,
      year: event.year,
      notes: event.notes,
    })
    setShowSelector(false)
  }

  const initializeFromExisting = (existingEvents: SavedEvent[]) => {
    setSavedEvents(existingEvents)
  }

  const reset = () => {
    setSavedEvents([])
    setCurrentEvent(null)
    setShowSelector(true)
  }

  return {
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
    reset,
  }
}

