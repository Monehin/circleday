'use client'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'

interface ReminderHistoryFiltersProps {
  status: string
  channel: string
  onStatusChange: (status: string) => void
  onChannelChange: (channel: string) => void
  onRefresh: () => void
  onExport?: () => void
}

export function ReminderHistoryFilters({
  status,
  channel,
  onStatusChange,
  onChannelChange,
  onRefresh,
  onExport,
}: ReminderHistoryFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="PENDING">⏳ Pending</SelectItem>
                <SelectItem value="SENT">✅ Sent</SelectItem>
                <SelectItem value="DELIVERED">📬 Delivered</SelectItem>
                <SelectItem value="FAILED">❌ Failed</SelectItem>
                <SelectItem value="BOUNCED">⚠️ Bounced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Channel Filter */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground">
              Channel
            </label>
            <Select value={channel} onValueChange={onChannelChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All channels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Channels</SelectItem>
                <SelectItem value="EMAIL">📧 Email</SelectItem>
                <SelectItem value="SMS">📱 SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            className="w-full sm:w-auto"
          >
            🔄 Refresh
          </Button>
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="w-full sm:w-auto"
            >
              📥 Export CSV
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

