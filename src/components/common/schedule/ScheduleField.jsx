const defaultHeadingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

export default function ScheduleField({
  field,
  isEditing = false,
  isActive = false,
  schedule,
  headingFontClass = defaultHeadingFontClass,
  onActivate,
  onChange,
}) {
  const baseClass = `box-border inline-flex h-[25px] ${isEditing ? 'px-[3px]' : 'px-0'} items-center justify-center rounded-[5px] border bg-white text-center outline-none`
  const textClass = field.airport
    ? `text-[12px] font-[510] leading-[21px] tracking-[-0.4px] ${headingFontClass}`
    : `text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`
  const borderClass = isActive
    ? 'border-[#f5a623]'
    : isEditing
      ? 'border-[#8aa9ca]'
      : 'border-transparent bg-transparent'
  const fieldStyle = {
    ...(field.airport ? { color: '#3F8AE1' } : {}),
    width: `${field.width}px`,
    minWidth: `${field.width}px`,
    maxWidth: `${field.width}px`,
  }

  if (!isEditing) {
    return (
      <span
        className={`${baseClass} ${textClass} ${borderClass}`}
        style={fieldStyle}
      >
        {schedule[field.key]}
      </span>
    )
  }

  return (
    <input
      className={`${baseClass} ${textClass} ${borderClass}`}
      value={schedule[field.key]}
      maxLength={field.maxLength}
      style={fieldStyle}
      onClick={() => onActivate(field.key)}
      onFocus={() => onActivate(field.key)}
      onChange={(event) => onChange(field.key, event.target.value)}
    />
  )
}
