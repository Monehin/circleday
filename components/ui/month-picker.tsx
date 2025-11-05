'use client'

/**
 * MonthPicker Component
 * 
 * A dropdown for selecting months (1-12).
 * More intuitive than a date input for recurring events.
 */

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MonthPickerProps {
  value?: number // 1-12
  onChange: (month: number) => void
  disabled?: boolean
  placeholder?: string
}

const MONTHS = [
  { value: 1, label: 'January', short: 'Jan' },
  { value: 2, label: 'February', short: 'Feb' },
  { value: 3, label: 'March', short: 'Mar' },
  { value: 4, label: 'April', short: 'Apr' },
  { value: 5, label: 'May', short: 'May' },
  { value: 6, label: 'June', short: 'Jun' },
  { value: 7, label: 'July', short: 'Jul' },
  { value: 8, label: 'August', short: 'Aug' },
  { value: 9, label: 'September', short: 'Sep' },
  { value: 10, label: 'October', short: 'Oct' },
  { value: 11, label: 'November', short: 'Nov' },
  { value: 12, label: 'December', short: 'Dec' },
]

export function MonthPicker({ value, onChange, disabled, placeholder = 'Select month' }: MonthPickerProps) {
  const selectedMonth = MONTHS.find(m => m.value === value)

  return (
    <Select
      value={value?.toString()}
      onValueChange={(val) => onChange(parseInt(val))}
      disabled={disabled}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder}>
          {selectedMonth?.label}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {MONTHS.map((month) => (
          <SelectItem key={month.value} value={month.value.toString()}>
            {month.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Export months for use in other components
export { MONTHS }

