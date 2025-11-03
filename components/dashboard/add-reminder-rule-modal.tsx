'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader } from '@/components/ui/loader'
import { createReminderRule } from '@/lib/actions/reminder-rules'
import { toast } from 'sonner'

interface AddReminderRuleModalProps {
  groupId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type ChannelConfig = {
  [offset: string]: {
    email: boolean
    sms: boolean
  }
}

const PRESET_OFFSETS = [
  { value: -7, label: '7 days before' },
  { value: -3, label: '3 days before' },
  { value: -1, label: '1 day before' },
  { value: 0, label: 'On the day' },
]

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const period = i >= 12 ? 'PM' : 'AM'
  const displayHour = i % 12 || 12
  return {
    value: i,
    label: `${displayHour}:00 ${period}`,
  }
})

export function AddReminderRuleModal({ groupId, isOpen, onClose, onSuccess }: AddReminderRuleModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedOffsets, setSelectedOffsets] = useState<number[]>([-7, -1, 0])
  const [channels, setChannels] = useState<ChannelConfig>({
    '-7': { email: true, sms: false },
    '-1': { email: true, sms: false },
    '0': { email: true, sms: true },
  })
  const [sendHour, setSendHour] = useState(9)
  const [error, setError] = useState<string>('')

  const toggleOffset = (offset: number) => {
    setSelectedOffsets(prev => {
      if (prev.includes(offset)) {
        const newOffsets = prev.filter(o => o !== offset)
        // Remove from channels
        const newChannels = { ...channels }
        delete newChannels[offset.toString()]
        setChannels(newChannels)
        return newOffsets
      } else {
        // Add to offsets and initialize channels
        setChannels(prev => ({
          ...prev,
          [offset.toString()]: { email: true, sms: false },
        }))
        return [...prev, offset]
      }
    })
  }

  const toggleChannel = (offset: number, channel: 'email' | 'sms') => {
    setChannels(prev => {
      const currentChannels = prev[offset.toString()] || { email: false, sms: false }
      return {
        ...prev,
        [offset.toString()]: {
          ...currentChannels,
          [channel]: !currentChannels[channel],
        },
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedOffsets.length === 0) {
      setError('Please select at least one reminder offset')
      return
    }

    // Validate that each offset has at least one channel
    for (const offset of selectedOffsets) {
      const offsetChannels = channels[offset.toString()]
      if (!offsetChannels?.email && !offsetChannels?.sms) {
        setError(`Please select at least one notification channel for each offset`)
        return
      }
    }

    setIsSubmitting(true)
    try {
      // Convert channels to the format expected by the server
      const formattedChannels: Record<string, ('EMAIL' | 'SMS')[]> = {}
      for (const offset of selectedOffsets) {
        const offsetChannels = channels[offset.toString()] || { email: false, sms: false }
        const channelList: ('EMAIL' | 'SMS')[] = []
        if (offsetChannels.email) channelList.push('EMAIL')
        if (offsetChannels.sms) channelList.push('SMS')
        formattedChannels[offset.toString()] = channelList
      }

      const result = await createReminderRule({
        groupId,
        offsets: selectedOffsets,
        channels: formattedChannels,
        sendHour,
      })

      if (result.success) {
        toast.success('Reminder rule created successfully')
        onSuccess()
      } else {
        setError(result.error || 'Failed to create reminder rule')
        toast.error(result.error || 'Failed to create reminder rule')
      }
    } catch (error) {
      setError('An unexpected error occurred')
      toast.error('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="bg-background rounded-lg shadow-lifted border border-border/50 w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4">
            Add Reminder Rule
          </h2>
          <p className="text-muted-foreground mb-6">
            Configure when and how you want to be reminded about celebrations
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Send Time */}
            <div className="space-y-2">
              <Label htmlFor="sendHour" className="text-sm font-medium">
                Send reminders at <span className="text-destructive">*</span>
              </Label>
              <select
                id="sendHour"
                value={sendHour}
                onChange={(e) => setSendHour(Number(e.target.value))}
                className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {HOURS.map(hour => (
                  <option key={hour.value} value={hour.value}>
                    {hour.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Choose your preferred time to receive reminders (in your timezone)
              </p>
            </div>

            {/* Offsets and Channels */}
            <div className="space-y-4">
              <Label className="text-sm font-medium">
                When to remind <span className="text-destructive">*</span>
              </Label>
              
              <div className="space-y-3">
                {PRESET_OFFSETS.map(preset => {
                  const isSelected = selectedOffsets.includes(preset.value)
                  const offsetChannels = channels[preset.value.toString()]

                  return (
                    <div
                      key={preset.value}
                      className={`rounded-lg border-2 transition-colors ${
                        isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-border/80'
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <input
                            type="checkbox"
                            id={`offset-${preset.value}`}
                            checked={isSelected}
                            onChange={() => toggleOffset(preset.value)}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <label
                            htmlFor={`offset-${preset.value}`}
                            className="text-sm font-medium text-foreground cursor-pointer"
                          >
                            {preset.label}
                          </label>
                        </div>

                        <AnimatePresence>
                          {isSelected && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="pl-7 space-y-2 overflow-hidden"
                            >
                              <p className="text-xs text-muted-foreground mb-2">
                                Notification channels:
                              </p>
                              <div className="flex gap-3">
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={offsetChannels?.email || false}
                                    onChange={() => toggleChannel(preset.value, 'email')}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className="text-sm">📧 Email</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={offsetChannels?.sms || false}
                                    onChange={() => toggleChannel(preset.value, 'sms')}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  />
                                  <span className="text-sm">💬 SMS</span>
                                </label>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 overflow-hidden"
                >
                  <p className="text-sm text-destructive">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1 h-11"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader size="sm" variant="primary" />
                    Creating...
                  </span>
                ) : (
                  'Create Reminder Rule'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="flex-1 h-11"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </>
  )
}

