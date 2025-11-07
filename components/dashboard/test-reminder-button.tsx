'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
// import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Send, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { sendTestReminder } from '@/lib/actions/test-reminder'

export function TestReminderButton() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  
  const [channels, setChannels] = useState({
    email: true,
    sms: false,
  })
  
  const [recipientEmail, setRecipientEmail] = useState('')
  const [recipientPhone, setRecipientPhone] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    const selectedChannels: ('EMAIL' | 'SMS')[] = []
    if (channels.email) selectedChannels.push('EMAIL')
    if (channels.sms) selectedChannels.push('SMS')

    if (selectedChannels.length === 0) {
      setResult({ success: false, message: 'Please select at least one channel' })
      setLoading(false)
      return
    }

    if (channels.email && !recipientEmail) {
      setResult({ success: false, message: 'Email is required when EMAIL channel is selected' })
      setLoading(false)
      return
    }

    if (channels.sms && !recipientPhone) {
      setResult({ success: false, message: 'Phone number is required when SMS channel is selected' })
      setLoading(false)
      return
    }

    try {
      const response = await sendTestReminder({
        channels: selectedChannels,
        recipientEmail: recipientEmail || undefined,
        recipientPhone: recipientPhone || undefined,
      })

      setResult({
        success: !!response.success,
        message: response.success 
          ? `✅ Test reminder sent! Workflow ID: ${response.workflowId}` 
          : `❌ ${response.error}`,
      })
    } catch (error) {
      setResult({
        success: false,
        message: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Send className="h-4 w-4" />
          Test Reminder
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🧪 Send Test Reminder</DialogTitle>
          <DialogDescription>
            Test your Temporal workflow by sending a reminder now. Check the Temporal UI to watch it execute!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Channel Selection */}
          <div className="space-y-3">
            <Label>Select Channels</Label>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email"
                checked={channels.email}
                onChange={(e) =>
                  setChannels({ ...channels, email: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="email" className="font-normal cursor-pointer">
                📧 Email
              </Label>
            </div>

            {channels.email && (
              <Input
                type="email"
                placeholder="your@email.com"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                required={channels.email}
                className="ml-6"
              />
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sms"
                checked={channels.sms}
                onChange={(e) =>
                  setChannels({ ...channels, sms: e.target.checked })
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="sms" className="font-normal cursor-pointer">
                📱 SMS
              </Label>
            </div>

            {channels.sms && (
              <Input
                type="tel"
                placeholder="+1234567890"
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
                required={channels.sms}
                className="ml-6"
              />
            )}
          </div>

          {/* Result Display */}
          {result && (
            <div
              className={`p-3 rounded-md text-sm ${
                result.success
                  ? 'bg-green-50 text-green-900 border border-green-200'
                  : 'bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <div className="flex items-start gap-2">
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium mb-1">
                    {result.success ? 'Success!' : 'Error'}
                  </p>
                  <p className="text-xs">{result.message}</p>
                  {result.success && (
                    <a
                      href="http://localhost:8080"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs underline mt-2 inline-block"
                    >
                      → View in Temporal UI
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Sending...' : 'Send Test'}
            </Button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-xs text-blue-900">
          <p className="font-medium mb-1">ℹ️ What happens:</p>
          <ul className="space-y-1 ml-4 list-disc">
            <li>Creates a test workflow in Temporal</li>
            <li>Sends immediately (no delay)</li>
            <li>Watch it execute in Temporal UI</li>
            <li>Check your email/phone for the message</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  )
}

