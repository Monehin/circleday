'use client'

/**
 * Share Event Link Modal Component
 * 
 * Allows group admins to generate and share secure invite links
 * for members to add their own events.
 */

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { createEventInviteToken, type CreateTokenInput } from '@/lib/actions/event-invite-tokens'
import { Link2, Copy, Mail, MessageSquare, Loader2, Check } from 'lucide-react'
import { format } from 'date-fns'

interface ShareEventLinkModalProps {
  isOpen: boolean
  onClose: () => void
  contact: {
    id: string
    name: string
    email?: string | null
    phone?: string | null
  }
  groupId: string
}

type ExpirationPreset = '24h' | '7d' | '30d' | 'custom'

export function ShareEventLinkModal({ isOpen, onClose, contact, groupId }: ShareEventLinkModalProps) {
  const [loading, setLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expirationPreset, setExpirationPreset] = useState<ExpirationPreset>('7d')
  const [customExpiration, setCustomExpiration] = useState('')
  const [maxUses, setMaxUses] = useState(1)
  const [sendEmail, setSendEmail] = useState(false)
  const [sendSMS, setSendSMS] = useState(false)

  const handleGenerate = async () => {
    setLoading(true)

    try {
      const input: CreateTokenInput = {
        contactId: contact.id,
        groupId,
        expirationPreset,
        customExpiration: expirationPreset === 'custom' ? customExpiration : undefined,
        maxUses,
        sendEmail,
        sendSMS,
      }

      const result = await createEventInviteToken(input)

      if (result.success && result.data) {
        setGeneratedLink(result.data.inviteUrl)
        
        let message = 'Link generated successfully!'
        if (result.data.notifications.email) {
          message += ' Email sent.'
        }
        if (result.data.notifications.sms) {
          message += ' SMS sent.'
        }
        
        toast.success(message)
      } else {
        toast.error(result.error || 'Failed to generate link')
      }
    } catch (error) {
      console.error('Failed to generate link:', error)
      toast.error('Failed to generate link. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink)
      setCopied(true)
      toast.success('Link copied to clipboard!')
      
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy link')
    }
  }

  const handleClose = () => {
    setGeneratedLink(null)
    setCopied(false)
    setExpirationPreset('7d')
    setCustomExpiration('')
    setMaxUses(1)
    setSendEmail(false)
    setSendSMS(false)
    onClose()
  }

  const getExpirationLabel = () => {
    switch (expirationPreset) {
      case '24h':
        return '24 hours'
      case '7d':
        return '7 days'
      case '30d':
        return '30 days'
      case 'custom':
        return customExpiration ? format(new Date(customExpiration), 'MMM d, yyyy') : 'Custom'
      default:
        return '7 days'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && handleClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-violet-600" />
            Share Event Link with {contact.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!generatedLink ? (
            <>
              {/* Configuration Form */}
              <div className="space-y-4">
                {/* Expiration Options */}
                <div className="space-y-2">
                  <Label>Link Expires In:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setExpirationPreset('24h')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        expirationPreset === '24h'
                          ? 'border-violet-600 bg-violet-50 text-violet-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      24 hours
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpirationPreset('7d')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        expirationPreset === '7d'
                          ? 'border-violet-600 bg-violet-50 text-violet-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      7 days
                      <span className="ml-1 text-xs text-violet-600">●</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpirationPreset('30d')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        expirationPreset === '30d'
                          ? 'border-violet-600 bg-violet-50 text-violet-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      30 days
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpirationPreset('custom')}
                      className={`px-4 py-2 rounded-lg border-2 transition-colors ${
                        expirationPreset === 'custom'
                          ? 'border-violet-600 bg-violet-50 text-violet-900'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      Custom
                    </button>
                  </div>

                  {expirationPreset === 'custom' && (
                    <div className="mt-2">
                      <Input
                        type="datetime-local"
                        value={customExpiration}
                        onChange={(e) => setCustomExpiration(e.target.value)}
                        min={new Date().toISOString().slice(0, 16)}
                      />
                    </div>
                  )}
                </div>

                {/* Max Uses */}
                <div className="space-y-2">
                  <Label htmlFor="max-uses">Allow Multiple Submissions:</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="max-uses"
                      type="number"
                      min="1"
                      max="10"
                      value={maxUses}
                      onChange={(e) => setMaxUses(parseInt(e.target.value) || 1)}
                      className="w-24"
                    />
                    <span className="text-sm text-neutral-600">
                      {maxUses === 1 ? 'time' : 'times'}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Allows {contact.name} to update their events if needed
                  </p>
                </div>

                {/* Notification Options */}
                <div className="space-y-3 p-4 bg-neutral-50 rounded-lg border">
                  <Label className="font-semibold">Send Link Via:</Label>
                  
                  {contact.email && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sendEmail}
                        onChange={(e) => setSendEmail(e.target.checked)}
                        className="h-4 w-4 text-violet-600 rounded"
                      />
                      <Mail className="h-4 w-4 text-neutral-500 group-hover:text-violet-600" />
                      <span className="text-sm">Email ({contact.email})</span>
                    </label>
                  )}

                  {contact.phone && (
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={sendSMS}
                        onChange={(e) => setSendSMS(e.target.checked)}
                        className="h-4 w-4 text-violet-600 rounded"
                      />
                      <MessageSquare className="h-4 w-4 text-neutral-500 group-hover:text-violet-600" />
                      <span className="text-sm">SMS ({contact.phone})</span>
                    </label>
                  )}

                  {!contact.email && !contact.phone && (
                    <p className="text-sm text-neutral-500 italic">
                      No email or phone number available. You'll need to share the link manually.
                    </p>
                  )}
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button onClick={handleGenerate} disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>Generate Link</>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Generated Link Display */}
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="font-semibold text-green-900">Link Generated!</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {sendEmail && contact.email && 'Email sent to ' + contact.email}
                    {sendEmail && sendSMS && ' and '}
                    {sendSMS && contact.phone && 'SMS sent to ' + contact.phone}
                    {!sendEmail && !sendSMS && 'Share this link with ' + contact.name}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Generated Link:</Label>
                  <div className="flex gap-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCopy}
                      className="shrink-0"
                    >
                      {copied ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-lg space-y-1">
                  <p className="text-sm text-neutral-600">
                    <strong>Expires:</strong> {getExpirationLabel()}
                  </p>
                  <p className="text-sm text-neutral-600">
                    <strong>Max uses:</strong> {maxUses} {maxUses === 1 ? 'time' : 'times'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Done
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

