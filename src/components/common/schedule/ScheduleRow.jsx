import defaultEditIcon from '../../../pages/onboarding/assets/schedule/edit.svg'
import defaultFlightIcon from '../../../pages/onboarding/assets/schedule/flight.svg'
import ScheduleField from './ScheduleField.jsx'

const defaultHeadingFontClass =
  "font-[SF_Pro,Pretendard,sans-serif]"

const defaultActiveEditIconStyle = {
  filter:
    'brightness(0) saturate(100%) invert(68%) sepia(80%) saturate(912%) hue-rotate(347deg) brightness(99%) contrast(94%)',
}

export const defaultScheduleFields = [
  { key: 'date', width: 48, maxLength: 5 },
  { key: 'departureTime', width: 46, maxLength: 5 },
  { key: 'departureAirport', width: 32, maxLength: 3, airport: true },
  { key: 'arrivalTime', width: 46, maxLength: 5 },
  { key: 'arrivalAirport', width: 32, maxLength: 3, airport: true },
]

export default function ScheduleRow({
  schedule,
  isEditing = false,
  activeFieldKey,
  fields = defaultScheduleFields,
  editIcon = defaultEditIcon,
  flightIcon = defaultFlightIcon,
  activeEditIconStyle = defaultActiveEditIconStyle,
  headingFontClass = defaultHeadingFontClass,
  onStartEdit,
  onActivateField,
  onFieldChange,
}) {
  const renderField = (field) => (
    <ScheduleField
      field={field}
      headingFontClass={headingFontClass}
      isActive={isEditing && activeFieldKey === field.key}
      isEditing={isEditing}
      key={field.key}
      schedule={schedule}
      onActivate={onActivateField}
      onChange={onFieldChange}
    />
  )

  return (
    <div className="flex min-h-10 items-center border-b border-[#eceef2]">
      {renderField(fields[0])}
      <span className="ml-[18px] flex items-center gap-[2px]">
        {renderField(fields[1])}
        {renderField(fields[2])}
      </span>
      <span className="mx-[5px] flex items-center justify-center" aria-hidden="true">
        <img
          className="block h-[17px] w-6 object-contain"
          src={flightIcon}
          alt=""
        />
      </span>
      <span className="flex items-center gap-[2px]">
        {renderField(fields[3])}
        {renderField(fields[4])}
      </span>
      <button
        className="ml-auto flex h-[24px] w-[22px] items-center justify-center border-0 bg-transparent p-0 outline-none focus:outline-none focus-visible:outline-none"
        type="button"
        aria-label={`${schedule.date} 일정 수정`}
        onClick={() => onStartEdit(schedule.id)}
      >
        <img
          className="block h-[15px] w-[15px] object-contain"
          src={editIcon}
          alt=""
          style={isEditing ? activeEditIconStyle : undefined}
        />
      </button>
    </div>
  )
}
