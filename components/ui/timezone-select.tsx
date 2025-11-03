'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TimezoneSelectProps {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  className?: string
}

// Common timezones grouped by region
const TIMEZONE_OPTIONS = [
  { label: 'UTC (Coordinated Universal Time)', value: 'UTC' },
  
  // North America
  { label: 'Eastern Time (US & Canada)', value: 'America/New_York' },
  { label: 'Central Time (US & Canada)', value: 'America/Chicago' },
  { label: 'Mountain Time (US & Canada)', value: 'America/Denver' },
  { label: 'Pacific Time (US & Canada)', value: 'America/Los_Angeles' },
  { label: 'Alaska', value: 'America/Anchorage' },
  { label: 'Hawaii', value: 'Pacific/Honolulu' },
  
  // Europe
  { label: 'London (GMT/BST)', value: 'Europe/London' },
  { label: 'Paris, Berlin, Rome', value: 'Europe/Paris' },
  { label: 'Athens, Istanbul', value: 'Europe/Athens' },
  { label: 'Moscow', value: 'Europe/Moscow' },
  
  // Asia
  { label: 'Dubai', value: 'Asia/Dubai' },
  { label: 'Mumbai', value: 'Asia/Kolkata' },
  { label: 'Bangkok', value: 'Asia/Bangkok' },
  { label: 'Singapore', value: 'Asia/Singapore' },
  { label: 'Hong Kong', value: 'Asia/Hong_Kong' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Seoul', value: 'Asia/Seoul' },
  
  // Australia & Pacific
  { label: 'Sydney, Melbourne', value: 'Australia/Sydney' },
  { label: 'Brisbane', value: 'Australia/Brisbane' },
  { label: 'Adelaide', value: 'Australia/Adelaide' },
  { label: 'Perth', value: 'Australia/Perth' },
  { label: 'Auckland', value: 'Pacific/Auckland' },
  
  // South America
  { label: 'Buenos Aires', value: 'America/Argentina/Buenos_Aires' },
  { label: 'São Paulo', value: 'America/Sao_Paulo' },
  
  // Africa
  { label: 'Lagos', value: 'Africa/Lagos' },
  { label: 'Cairo', value: 'Africa/Cairo' },
  { label: 'Johannesburg', value: 'Africa/Johannesburg' },
]

export function TimezoneSelect({ value, onChange, disabled, className }: TimezoneSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {TIMEZONE_OPTIONS.map((tz) => (
        <option key={tz.value} value={tz.value}>
          {tz.label}
        </option>
      ))}
    </select>
  )
}

