'use client'

/**
 * DayPicker Component
 * 
 * A dropdown for selecting days (1-31).
 * Automatically adjusts max days based on the selected month.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface DayPickerProps {
  value?: number // 1-31
  month?: number // 1-12 (used to determine max days)
  year?: number // For leap year calculation
  onChange: (day: number) => void
  disabled?: boolean
  placeholder?: string
}

/**
 * Get the number of days in a specific month
 */
function getDaysInMonth(month?: number, year?: number): number {
  if (!month) return 31 // Default to 31 if no month selected
  
  const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]
  let days = daysInMonth[month - 1] || 31
  
  // Check for leap year if February and year is provided
  if (month === 2 && year) {
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)
    days = isLeapYear ? 29 : 28
  }
  
  return days
}

export function DayPicker({ value, month, year, onChange, disabled, placeholder = 'Select day' }: DayPickerProps) {
  const maxDays = getDaysInMonth(month, year)
  const days = Array.from({ length: maxDays }, (_, i) => i + 1)
  
  // If current value exceeds max days for selected month, reset it
  if (value && value > maxDays) {
    onChange(maxDays)
  }

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(parseInt(val))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {value}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-[300px]">
        {days.map((day) => (
          <SelectItem key={day} value={day.toString()}>
            {day}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Export utility function for use in validation
export { getDaysInMonth }

