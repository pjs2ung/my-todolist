import './DatePicker.css'

export type DatePickerProps = {
  value: string | null
  onChange: (value: string) => void
  min?: string
  max?: string
  disabled?: boolean
  id?: string
  'aria-label'?: string
}

export function DatePicker({
  value,
  onChange,
  min,
  max,
  disabled,
  id,
  'aria-label': ariaLabel,
}: DatePickerProps) {
  return (
    <input
      type="date"
      id={id}
      aria-label={ariaLabel}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      min={min}
      max={max}
      disabled={disabled}
      className="shared-date-picker"
    />
  )
}
