'use client'

/**
 * EventTypeSelector Component
 * 
 * Displays event type buttons and templates for quick event creation.
 * Provides intuitive visual selection of event types.
 */

import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export interface EventTemplate {
  id: string
  name: string
  icon: string
  type: 'BIRTHDAY' | 'ANNIVERSARY' | 'CUSTOM'
  recurring: boolean
  requiresYear: boolean
  color: string
  description?: string
}

export const EVENT_TEMPLATES: EventTemplate[] = [
  {
    id: 'birthday',
    name: 'Birthday',
    icon: '🎂',
    type: 'BIRTHDAY',
    recurring: true,
    requiresYear: false,
    color: 'violet',
    description: 'Celebrate every year',
  },
  {
    id: 'anniversary',
    name: 'Anniversary',
    icon: '💍',
    type: 'ANNIVERSARY',
    recurring: true,
    requiresYear: false,
    color: 'pink',
    description: 'Wedding or relationship anniversary',
  },
  {
    id: 'work-anniversary',
    name: 'Work Anniversary',
    icon: '💼',
    type: 'CUSTOM',
    recurring: true,
    requiresYear: true,
    color: 'blue',
    description: 'First day at work',
  },
  {
    id: 'graduation',
    name: 'Graduation',
    icon: '🎓',
    type: 'CUSTOM',
    recurring: false,
    requiresYear: true,
    color: 'green',
    description: 'One-time celebration',
  },
  {
    id: 'retirement',
    name: 'Retirement',
    icon: '🏖️',
    type: 'CUSTOM',
    recurring: false,
    requiresYear: true,
    color: 'orange',
    description: 'Last day at work',
  },
  {
    id: 'custom',
    name: 'Custom Event',
    icon: '✨',
    type: 'CUSTOM',
    recurring: true,
    requiresYear: false,
    color: 'neutral',
    description: 'Any special day',
  },
]

interface EventTypeSelectorProps {
  onSelect: (template: EventTemplate) => void
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.05,
    },
  },
}

export function EventTypeSelector({ onSelect }: EventTypeSelectorProps) {
  // Main event types (featured)
  const mainTypes = EVENT_TEMPLATES.filter(t => 
    ['birthday', 'anniversary', 'custom'].includes(t.id)
  )
  
  // Quick templates
  const quickTemplates = EVENT_TEMPLATES.filter(t => 
    !['birthday', 'anniversary', 'custom'].includes(t.id)
  )

  const getColorClasses = (color: string) => {
    const colors: Record<string, string> = {
      violet: 'bg-violet-50 hover:bg-violet-100 border-violet-200 text-violet-900',
      pink: 'bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-900',
      blue: 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-900',
      green: 'bg-green-50 hover:bg-green-100 border-green-200 text-green-900',
      orange: 'bg-orange-50 hover:bg-orange-100 border-orange-200 text-orange-900',
      neutral: 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-900',
    }
    return colors[color] || colors.neutral
  }

  return (
    <div className="space-y-6">
      {/* Main Event Types */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-neutral-900">
          What would you like to add?
        </h3>
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-3 gap-3"
        >
          {mainTypes.map((template) => (
            <motion.div key={template.id} variants={fadeIn}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onSelect(template)}
                className={`w-full h-auto py-6 flex flex-col items-center gap-2 border-2 transition-all ${getColorClasses(template.color)}`}
              >
                <span className="text-4xl">{template.icon}</span>
                <span className="text-sm font-semibold">{template.name}</span>
                {template.description && (
                  <span className="text-xs opacity-75">
                    {template.description}
                  </span>
                )}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Quick Templates */}
      <div>
        <h4 className="text-sm font-medium mb-3 text-neutral-700">
          Quick Templates:
        </h4>
        <div className="space-y-2">
          {quickTemplates.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => onSelect(template)}
              className="w-full text-left px-4 py-3 rounded-lg border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 transition-colors flex items-center gap-3"
            >
              <span className="text-2xl">{template.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-neutral-900">
                  {template.name}
                </p>
                {template.description && (
                  <p className="text-xs text-neutral-600">
                    {template.description}
                  </p>
                )}
              </div>
              {!template.recurring && (
                <span className="text-xs px-2 py-1 rounded-full bg-neutral-100 text-neutral-600">
                  One-time
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

