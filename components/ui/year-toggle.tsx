'use client'

/**
 * YearToggle Component
 * 
 * A toggle switch with optional year input.
 * Used for events where the year is optional (birthdays, anniversaries).
 */

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface YearToggleProps {
  hasYear: boolean
  year?: number
  onToggleChange: (hasYear: boolean) => void
  onYearChange: (year: number | undefined) => void
  label?: string
  disabled?: boolean
}

export function YearToggle({
  hasYear,
  year,
  onToggleChange,
  onYearChange,
  label = 'I know the year',
  disabled,
}: YearToggleProps) {
  const currentYear = new Date().getFullYear()

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value === '') {
      onYearChange(undefined)
    } else {
      const yearNum = parseInt(value)
      if (!isNaN(yearNum) && yearNum >= 1900 && yearNum <= currentYear + 100) {
        onYearChange(yearNum)
      }
    }
  }

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={hasYear}
          onChange={(e) => onToggleChange(e.target.checked)}
          disabled={disabled}
          className="h-4 w-4 rounded border-neutral-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span className="text-sm font-medium text-neutral-700">
          {label}
        </span>
      </label>

      {hasYear && (
        <div className="ml-7 space-y-2">
          <Label htmlFor="year" className="text-sm">
            Year
          </Label>
          <Input
            id="year"
            type="number"
            min="1900"
            max={currentYear + 100}
            value={year || ''}
            onChange={handleYearChange}
            placeholder="YYYY"
            disabled={disabled}
            className="w-32"
          />
          <p className="text-xs text-neutral-500">
            Enter a 4-digit year (e.g., {currentYear - 30})
          </p>
        </div>
      )}
    </div>
  )
}

