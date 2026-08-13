import { useEffect, useRef, useState } from 'react'
import { extractSchedulesFromFiles } from './api/scheduleApi.js'
import calendarIcon from './assets/schedule/calendar.svg'
import checkIcon from './assets/schedule/check.svg'
import clockIcon from './assets/schedule/clock.svg'
import editIcon from './assets/schedule/edit.svg'
import flightIcon from './assets/schedule/flight.svg'
import plane2Icon from './assets/schedule/plane2.svg'
import warningRedIcon from './assets/schedule/warning-red.svg'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'
import { mockSchedules } from './mocks/mockSchedules.js'

const emptySchedule = {
  files: [],
  schedules: [],
}

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[SF_Pro] text-[15px] font-normal leading-normal tracking-[0] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
const activeEditIconStyle = {
  filter:
    'brightness(0) saturate(100%) invert(68%) sepia(80%) saturate(912%) hue-rotate(347deg) brightness(99%) contrast(94%)',
}
const maxScheduleFileSize = 10 * 1024 * 1024
const imageCompressionType = 'image/jpeg'
const imageCompressionMaxSides = [2200, 1800, 1400, 1100, 900, 700]
const imageCompressionQualities = [0.82, 0.72, 0.62, 0.52, 0.42]

const editableScheduleFields = [
  { key: 'date', width: 48, maxLength: 5 },
  { key: 'departureTime', width: 46, maxLength: 5 },
  { key: 'departureAirport', width: 32, maxLength: 3, airport: true },
  { key: 'arrivalTime', width: 46, maxLength: 5 },
  { key: 'arrivalAirport', width: 32, maxLength: 3, airport: true },
]
const pickerYears = Array.from({ length: 5 }, (_, index) => 2026 + index)
const pickerMonths = Array.from({ length: 12 }, (_, index) => index + 1)
const pickerHours = Array.from({ length: 12 }, (_, index) => index + 1)
const pickerMinutes = Array.from({ length: 60 }, (_, index) => index)
const pickerPeriods = ['오전', '오후']
const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const airportLabelMap = {
  ICN: '인천, ICN',
  GMP: '김포, GMP',
  SYD: '시드니, SYD',
}

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()}`
}

const createPreviewUrl = (file) => {
  if (!file.type.startsWith('image/')) {
    return ''
  }

  return URL.createObjectURL(file)
}

const revokePreviewUrl = (file) => {
  if (file?.previewUrl) {
    URL.revokeObjectURL(file.previewUrl)
  }
}

const loadImageFile = (file) =>
  new Promise((resolve, reject) => {
    const previewUrl = URL.createObjectURL(file)
    const image = new Image()

    image.onload = () => {
      URL.revokeObjectURL(previewUrl)
      resolve(image)
    }

    image.onerror = () => {
      URL.revokeObjectURL(previewUrl)
      reject(new Error('이미지를 불러오지 못했습니다.'))
    }

    image.src = previewUrl
  })

const convertCanvasToBlob = (canvas, type, quality) =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }

        reject(new Error('이미지 압축에 실패했습니다.'))
      },
      type,
      quality,
    )
  })

const compressImageFile = async (file) => {
  if (!file.type.startsWith('image/') || file.size <= maxScheduleFileSize) {
    return file
  }

  const image = await loadImageFile(file)
  const sourceWidth = image.naturalWidth || image.width
  const sourceHeight = image.naturalHeight || image.height
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!sourceWidth || !sourceHeight || !context) {
    return file
  }

  let bestBlob = null

  for (const maxSide of imageCompressionMaxSides) {
    const scale = Math.min(1, maxSide / Math.max(sourceWidth, sourceHeight))
    canvas.width = Math.max(1, Math.round(sourceWidth * scale))
    canvas.height = Math.max(1, Math.round(sourceHeight * scale))
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    for (const quality of imageCompressionQualities) {
      const blob = await convertCanvasToBlob(canvas, imageCompressionType, quality)

      bestBlob = !bestBlob || blob.size < bestBlob.size ? blob : bestBlob

      if (blob.size <= maxScheduleFileSize) {
        return new File([blob], file.name, {
          type: imageCompressionType,
          lastModified: Date.now(),
        })
      }
    }
  }

  if (bestBlob && bestBlob.size < file.size) {
    return new File([bestBlob], file.name, {
      type: imageCompressionType,
      lastModified: Date.now(),
    })
  }

  return file
}

const prepareScheduleFile = async (file) => {
  let sourceFile = file

  try {
    sourceFile = await compressImageFile(file)
  } catch {
    sourceFile = file
  }

  return {
    id: createId(),
    name: file.name,
    previewUrl: createPreviewUrl(sourceFile),
    sourceFile,
  }
}

const pad2 = (value) => String(value).padStart(2, '0')

const getDaysInMonth = (year, month) => new Date(year, month, 0).getDate()

const clampDay = (dateParts) => ({
  ...dateParts,
  day: Math.min(dateParts.day, getDaysInMonth(dateParts.year, dateParts.month)),
})

const normalizeDateParts = (dateValue) => {
  const text = String(dateValue ?? '').trim()
  const match = text.match(/(?:(20\d{2})\D*)?(\d{1,2})\D+(\d{1,2})/)
  const year = match?.[1] ? Number(match[1]) : 2026
  const month = match?.[2] ? Number(match[2]) : 8
  const day = match?.[3] ? Number(match[3]) : 9

  return clampDay({
    year: Math.min(2030, Math.max(2026, year)),
    month: Math.min(12, Math.max(1, month)),
    day: Math.min(31, Math.max(1, day)),
  })
}

const formatShortDate = (dateParts) =>
  `${pad2(dateParts.month)}/${pad2(dateParts.day)}`

const formatStoredDate = (dateParts) =>
  `${dateParts.year}-${pad2(dateParts.month)}-${pad2(dateParts.day)}`

const formatPickerDateLabel = (dateParts) =>
  `${String(dateParts.year).slice(2)}년 ${dateParts.month}월 ${dateParts.day}일`

const formatFullDateLabel = (dateParts) => {
  const date = new Date(dateParts.year, dateParts.month - 1, dateParts.day)
  return `${dateParts.year}년 ${dateParts.month}월 ${dateParts.day}일 (${weekdays[date.getDay()]})`
}

const normalizeTimeParts = (timeValue) => {
  const text = String(timeValue ?? '').trim()
  const periodFromText = text.includes('오후')
    ? '오후'
    : text.includes('오전')
      ? '오전'
      : ''
  const match = text.match(/(\d{1,2})\D+(\d{1,2})/)
  const rawHour = match?.[1] ? Number(match[1]) : 9
  const minute = match?.[2] ? Number(match[2]) : 0
  const period = periodFromText || (rawHour >= 12 ? '오후' : '오전')
  const hour = rawHour > 12 ? rawHour - 12 : rawHour === 0 ? 12 : rawHour

  return {
    period,
    hour: Math.min(12, Math.max(1, hour)),
    minute: Math.min(59, Math.max(0, minute)),
  }
}

const to24Hour = (timeParts) => {
  if (timeParts.period === '오후') {
    return timeParts.hour === 12 ? 12 : timeParts.hour + 12
  }

  return timeParts.hour === 12 ? 0 : timeParts.hour
}

const formatTimeValue = (timeParts) =>
  `${pad2(to24Hour(timeParts))}:${pad2(timeParts.minute)}`

const formatPickerTimeLabel = (timeParts) =>
  `${pad2(to24Hour(timeParts))} : ${pad2(timeParts.minute)}`

const getScheduleDateTimeValue = (dateParts, timeParts) =>
  new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    to24Hour(timeParts),
    timeParts.minute,
  ).getTime()

const isArrivalBeforeDeparture = (draft) =>
  getScheduleDateTimeValue(draft.arrivalDate, draft.arrivalTime) <
  getScheduleDateTimeValue(draft.departureDate, draft.departureTime)

const toAirportLabel = (airport) => {
  const code = String(airport ?? '').trim()
  return airportLabelMap[code] ?? code
}

const toAirportCode = (airportLabel) => {
  const text = String(airportLabel ?? '').trim()
  const parts = text.split(',').map((part) => part.trim()).filter(Boolean)
  const lastPart = parts[parts.length - 1] ?? text
  return lastPart.toUpperCase()
}

const createScheduleDraft = (schedule) => ({
  id: schedule.id,
  departureAirport: toAirportLabel(schedule.departureAirport),
  arrivalAirport: toAirportLabel(schedule.arrivalAirport),
  departureDate: normalizeDateParts(schedule.departureDate ?? schedule.date),
  arrivalDate: normalizeDateParts(schedule.arrivalDate ?? schedule.date),
  departureTime: normalizeTimeParts(schedule.departureTime),
  arrivalTime: normalizeTimeParts(schedule.arrivalTime),
})

function ScheduleField({
  field,
  isEditing,
  isActive,
  schedule,
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

function ScheduleRow({
  schedule,
  isEditing,
  activeFieldKey,
  onStartEdit,
  onActivateField,
  onFieldChange,
}) {
  const renderField = (field) => (
    <ScheduleField
      field={field}
      isActive={isEditing && activeFieldKey === field.key}
      isEditing={isEditing}
      key={field.key}
      schedule={schedule}
      onActivate={onActivateField}
      onChange={onFieldChange}
    />
  )

  return (
    <div className="flex min-h-10 items-center border-b border-[#eceef2] last:border-b-0">
      {renderField(editableScheduleFields[0])}
      <span className="ml-[18px] flex items-center gap-[2px]">
        {renderField(editableScheduleFields[1])}
        {renderField(editableScheduleFields[2])}
      </span>
      <span className="mx-[5px] flex items-center justify-center" aria-hidden="true">
        <img
          className="block h-[17px] w-6 object-contain"
          src={flightIcon}
          alt=""
        />
      </span>
      <span className="flex items-center gap-[2px]">
        {renderField(editableScheduleFields[3])}
        {renderField(editableScheduleFields[4])}
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

function ScheduleConfirmModal({
  file,
  fileName,
  schedules,
  editingScheduleId,
  activeFieldKey,
  onStartEdit,
  onActivateField,
  onFieldChange,
  onDismiss,
  onSave,
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-6"
      onClick={onDismiss}
    >
      <div
        className="relative box-border w-full max-w-[340px] overflow-hidden rounded-[24px] bg-white px-5 pb-6 pt-[30px] shadow-[0_20px_60px_0_rgba(29,43,68,0.50)]"
        style={{
          borderRadius: '24px',
          boxShadow: '0 20px 60px 0 rgba(29, 43, 68, 0.5)',
        }}
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          className={`m-0 text-center text-[19px] font-[510] leading-[21px] tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
          style={{ fontSize: '19px' }}
        >
          등록된 일정을 확인해주세요
        </h2>

        <div className="mt-7 grid min-h-[57px] grid-cols-[34px_minmax(0,1fr)] items-center gap-3 rounded-xl border border-[#eceef2] bg-[#f7f8fb] px-3">
          <span
            className="h-[34px] w-[34px] overflow-hidden rounded-[9px] bg-white shadow-[0_4px_12px_0_rgba(29,43,68,0.06)]"
            aria-hidden="true"
          >
            {file?.previewUrl && (
              <img
                className="h-full w-full object-cover"
                src={file.previewUrl}
                alt=""
              />
            )}
          </span>
          <span
            className={`overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
          >
            {fileName}
          </span>
        </div>

        <div className="mt-[17px] px-2">
          {schedules.map((schedule) => (
            <ScheduleRow
              activeFieldKey={activeFieldKey}
              isEditing={schedule.id === editingScheduleId}
              key={schedule.id}
              schedule={schedule}
              onActivateField={(fieldKey) =>
                onActivateField(schedule.id, fieldKey)
              }
              onFieldChange={(fieldKey, nextValue) =>
                onFieldChange(schedule.id, fieldKey, nextValue)
              }
              onStartEdit={onStartEdit}
            />
          ))}
        </div>

        <div className="mt-[18px] flex items-center justify-center gap-[5px]">
          <span className="h-[6px] w-5 rounded-full bg-[#f6a51a]" />
          <span className="h-[6px] w-[6px] rounded-full bg-[#edf1f6]" />
          <span className="h-[6px] w-[6px] rounded-full bg-[#edf1f6]" />
        </div>

        <button
          className={`mt-[25px] h-[53px] w-full rounded-2xl border-0 bg-[#f5a623] text-[15px] font-bold leading-[23px] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)] ${headingFontClass}`}
          type="button"
          onClick={onSave}
        >
          저장하고 계속
        </button>
      </div>
    </div>
  )
}

function EditFieldButton({ icon, label, value, onClick }) {
  return (
    <div>
      <span
        className={`mb-[7px] block text-[12px] font-[510] leading-[16px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
      >
        {label}
      </span>
      <button
        className={`box-border flex h-[40px] w-full items-center justify-between rounded-[10px] border-[1.276px] border-[#ECEEF2] bg-white px-[10px] text-[12px] font-normal leading-[18px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
        type="button"
        onClick={onClick}
      >
        <span className="flex min-w-0 items-center gap-[7px]">
          {icon && (
            <span className="flex h-[16px] w-[16px] items-center justify-center">
              {icon}
            </span>
          )}
          <span className="truncate">{value}</span>
        </span>
        <span
          className="h-[8px] w-[8px] rotate-45 border-b-[1.7px] border-r-[1.7px] border-[#8A9EB8]"
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

function DateIcon() {
  return (
    <img
      className="h-[16px] w-[16px] object-contain"
      src={calendarIcon}
      alt=""
      aria-hidden="true"
    />
  )
}

function TimeIcon() {
  return (
    <img
      className="h-[14px] w-[14px] object-contain"
      src={clockIcon}
      alt=""
      aria-hidden="true"
    />
  )
}

function ScheduleEditCard({
  draft,
  onBack,
  onSave,
  onChange,
  onOpenDatePicker,
  onOpenTimePicker,
}) {
  const hasDateTimeError = isArrivalBeforeDeparture(draft)

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-[34px]"
      onClick={onBack}
    >
      <div
        className="box-border w-full max-w-[332px] rounded-[22px] bg-white px-[22px] pb-[26px] pt-[25px] text-[#1D2B44] shadow-[0_20px_60px_0_rgba(29,43,68,0.50)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="grid grid-cols-[28px_minmax(0,1fr)_28px] items-center">
          <button
            className="flex h-7 w-7 items-center justify-center border-0 bg-transparent p-0"
            type="button"
            aria-label="일정 확인으로 돌아가기"
            onClick={onBack}
          >
            <span
              className="h-[9px] w-[9px] rotate-45 border-b-[2.2px] border-l-[2.2px] border-[#1D2B44]"
              aria-hidden="true"
            />
          </button>
          <h2
            className={`m-0 text-center text-[18px] font-[590] leading-[22px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
          >
            {formatFullDateLabel(draft.departureDate)}
          </h2>
          <span />
        </header>

        <div className="mt-[28px] grid grid-cols-[1fr_22px_1fr] items-end gap-[8px]">
          <label>
            <span
              className={`mb-[7px] block text-[12px] font-[510] leading-[16px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
            >
              출발
            </span>
            <input
              className={`box-border h-[40px] w-full rounded-[10px] border-[1.276px] border-[#F5A623] bg-white px-[13px] text-[12px] font-normal leading-[18px] tracking-[-0.64px] text-[#1D2B44] outline-none ${headingFontClass}`}
              value={draft.departureAirport}
              onChange={(event) =>
                onChange({ ...draft, departureAirport: event.target.value })
              }
            />
          </label>
          <img
            className="mb-[11px] h-[17px] w-[22px] object-contain"
            src={plane2Icon}
            alt=""
            aria-hidden="true"
          />
          <label>
            <span
              className={`mb-[7px] block text-[12px] font-[510] leading-[16px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
            >
              도착
            </span>
            <input
              className={`box-border h-[40px] w-full rounded-[10px] border-[1.276px] border-[#ECEEF2] bg-white px-[13px] text-[12px] font-normal leading-[18px] tracking-[-0.64px] text-[#1D2B44] outline-none focus:border-[#F5A623] ${headingFontClass}`}
              value={draft.arrivalAirport}
              onChange={(event) =>
                onChange({ ...draft, arrivalAirport: event.target.value })
              }
            />
          </label>
        </div>

        <div className="mt-[26px] grid grid-cols-2 gap-x-[12px] gap-y-[16px]">
          <EditFieldButton
            icon={<DateIcon />}
            label="출발일"
            value={formatPickerDateLabel(draft.departureDate)}
            onClick={() => onOpenDatePicker('departureDate')}
          />
          <EditFieldButton
            icon={<TimeIcon />}
            label="출발 시간"
            value={formatPickerTimeLabel(draft.departureTime)}
            onClick={() => onOpenTimePicker('departureTime')}
          />
          <EditFieldButton
            icon={<DateIcon />}
            label="도착일"
            value={formatPickerDateLabel(draft.arrivalDate)}
            onClick={() => onOpenDatePicker('arrivalDate')}
          />
          <EditFieldButton
            icon={<TimeIcon />}
            label="도착 시간"
            value={formatPickerTimeLabel(draft.arrivalTime)}
            onClick={() => onOpenTimePicker('arrivalTime')}
          />
        </div>

        {hasDateTimeError && (
          <p
            className={`mt-[12px] flex items-center gap-[6px] text-[12px] font-normal leading-[18px] tracking-[-0.64px] text-[#ED3333] ${headingFontClass}`}
          >
            <img
              className="h-[13px] w-[13px] shrink-0 object-contain"
              src={warningRedIcon}
              alt=""
              aria-hidden="true"
            />
            도착 일시는 출발 일시 이후로 설정해주세요.
          </p>
        )}

        <button
          className={`h-[53px] w-full rounded-[14px] border-0 bg-[#1D2B44] text-[15px] font-bold leading-[23px] text-white ${headingFontClass} ${
            hasDateTimeError ? 'mt-[20px]' : 'mt-[30px]'
          }`}
          type="button"
          onClick={onSave}
        >
          정보 수정하기
        </button>
      </div>
    </div>
  )
}

function PickerColumn({ options, value, onChange, formatOption = (option) => option }) {
  const columnRef = useRef(null)
  const scrollTimerRef = useRef(null)
  const itemHeight = 42
  const selectedIndex = Math.max(
    options.findIndex((option) => option === value),
    0,
  )

  useEffect(() => {
    const column = columnRef.current

    if (!column) {
      return
    }

    column.scrollTo({
      top: selectedIndex * itemHeight,
      behavior: 'smooth',
    })
  }, [selectedIndex])

  useEffect(
    () => () => {
      if (scrollTimerRef.current) {
        clearTimeout(scrollTimerRef.current)
      }
    },
    [],
  )

  const selectOption = (option, index) => {
    columnRef.current?.scrollTo({
      top: index * itemHeight,
      behavior: 'smooth',
    })
    onChange(option)
  }

  const handleScroll = () => {
    if (scrollTimerRef.current) {
      clearTimeout(scrollTimerRef.current)
    }

    scrollTimerRef.current = setTimeout(() => {
      const column = columnRef.current

      if (!column) {
        return
      }

      const nextIndex = Math.min(
        options.length - 1,
        Math.max(0, Math.round(column.scrollTop / itemHeight)),
      )
      const nextOption = options[nextIndex]

      column.scrollTo({
        top: nextIndex * itemHeight,
        behavior: 'smooth',
      })

      if (nextOption !== value) {
        onChange(nextOption)
      }
    }, 80)
  }

  return (
    <div
      className="h-[126px] w-full snap-y snap-mandatory overflow-y-auto overscroll-contain py-[42px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      ref={columnRef}
      role="listbox"
      tabIndex={0}
      onScroll={handleScroll}
    >
      {options.map((option, index) => (
        <button
          className={`flex h-[42px] w-full snap-center items-center justify-center border-0 bg-transparent p-0 text-center text-[18px] leading-[24px] tracking-[-0.64px] outline-none transition-colors ${headingFontClass} ${
            option === value
              ? 'font-bold text-[#1D2B44]'
              : 'font-normal text-[#B7BDC6]'
          }`}
          type="button"
          role="option"
          aria-selected={option === value}
          key={option}
          onClick={() => selectOption(option, index)}
        >
          {formatOption(option)}
        </button>
      ))}
    </div>
  )
}

function WheelPickerSheet({ type, value, onChange, onClose }) {
  const dayOptions =
    type === 'date'
      ? Array.from(
          { length: getDaysInMonth(value.year, value.month) },
          (_, index) => index + 1,
        )
      : []

  const updateDate = (nextValue) => {
    onChange(clampDay({ ...value, ...nextValue }))
  }

  const updateTime = (nextValue) => {
    onChange({ ...value, ...nextValue })
  }

  return (
    <div className="absolute inset-0 z-40 flex items-end justify-center bg-black/45">
      <div className="box-border w-full rounded-t-[22px] bg-white px-[20px] pb-[34px] pt-[13px] shadow-[0_-12px_40px_0_rgba(29,43,68,0.18)]">
        <span
          className="mx-auto block h-[5px] w-[48px] rounded-full bg-[#E2E5EA]"
          aria-hidden="true"
        />

        <div className="relative mt-[28px]">
          <span
            className="absolute left-0 right-0 top-1/2 h-[56px] -translate-y-1/2 rounded-[20px] bg-[#E6F1FF]"
            aria-hidden="true"
          />
          <div className="relative z-10 grid grid-cols-3 gap-[8px]">
            {type === 'date' ? (
              <>
                <PickerColumn
                  options={pickerYears}
                  value={value.year}
                  formatOption={(year) => `${year}년`}
                  onChange={(year) => updateDate({ year })}
                />
                <PickerColumn
                  options={pickerMonths}
                  value={value.month}
                  formatOption={(month) => `${month}월`}
                  onChange={(month) => updateDate({ month })}
                />
                <PickerColumn
                  options={dayOptions}
                  value={value.day}
                  formatOption={(day) => `${day}일`}
                  onChange={(day) => updateDate({ day })}
                />
              </>
            ) : (
              <>
                <PickerColumn
                  options={pickerPeriods}
                  value={value.period}
                  onChange={(period) => updateTime({ period })}
                />
                <PickerColumn
                  options={pickerHours}
                  value={value.hour}
                  formatOption={(hour) => `${hour}시`}
                  onChange={(hour) => updateTime({ hour })}
                />
                <PickerColumn
                  options={pickerMinutes}
                  value={value.minute}
                  formatOption={(minute) => `${pad2(minute)}분`}
                  onChange={(minute) => updateTime({ minute })}
                />
              </>
            )}
          </div>
        </div>

        <button
          className={`mt-[22px] h-[53px] w-full rounded-[14px] border-0 bg-[#1D2B44] text-[15px] font-bold leading-[23px] text-white ${headingFontClass}`}
          type="button"
          onClick={onClose}
        >
          선택하기
        </button>
      </div>
    </div>
  )
}

function NoticeModal({ message, compact = false, onDismiss }) {
  const cardClass = compact
    ? 'box-border flex h-[173px] w-[298px] flex-col items-center justify-center gap-4 rounded-2xl bg-white px-6 py-5 shadow-[0_20px_60px_0_rgba(29,43,68,0.50)]'
    : 'flex h-[173px] w-full max-w-[340px] flex-col items-center justify-center rounded-[24px] bg-white shadow-[0_20px_60px_0_rgba(29,43,68,0.50)]'

  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-6"
      onClick={onDismiss}
    >
      <div
        className={cardClass}
        onClick={(event) => event.stopPropagation()}
      >
        <img className="h-10 w-10" src={checkIcon} alt="" />
        <p
          className={`${compact ? 'm-0' : 'mt-[26px]'} text-center text-[19px] font-[510] leading-[21px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
        >
          {message}
        </p>
      </div>
    </div>
  )
}

function ScheduleSetup({ value, onChange, onBack, onComplete }) {
  const fileInputRef = useRef(null)
  const filesRef = useRef([])
  const completeTimerRef = useRef(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState('')
  const [activeFieldKey, setActiveFieldKey] = useState('')
  const [editingScheduleDraft, setEditingScheduleDraft] = useState(null)
  const [pickerState, setPickerState] = useState(null)
  const [displaySchedules, setDisplaySchedules] = useState([])
  const [modalFileName, setModalFileName] = useState('')
  const [localSchedule, setLocalSchedule] = useState(emptySchedule)
  const schedule = value ?? localSchedule
  const files = schedule.files ?? []
  filesRef.current = files
  const canContinue = files.length > 0 && !isExtracting
  const hasConfirmedSchedules = (schedule.schedules ?? []).length > 0

  useEffect(() => {
    return () => {
      if (completeTimerRef.current) {
        clearTimeout(completeTimerRef.current)
      }

      filesRef.current.forEach(revokePreviewUrl)
    }
  }, [])

  const updateSchedule = (updater) => {
    const nextSchedule =
      typeof updater === 'function' ? updater(schedule) : updater

    if (value === undefined) {
      setLocalSchedule(nextSchedule)
    }

    onChange?.(nextSchedule)
  }

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const openScheduleConfirmModal = async (targetFiles = files) => {
    if (targetFiles.length === 0 || isExtracting) {
      return
    }

    setIsExtracting(true)
    setShowCompleteModal(false)
    setShowScheduleModal(false)
    setEditingScheduleId('')
    setActiveFieldKey('')
    setEditingScheduleDraft(null)
    setPickerState(null)
    setModalFileName(targetFiles[targetFiles.length - 1]?.name ?? '업로드한 일정 파일')

    let schedules

    try {
      schedules = await extractSchedulesFromFiles(targetFiles)
    } catch {
      schedules = mockSchedules
    }

    updateSchedule((prevSchedule) => ({
      ...prevSchedule,
      files: targetFiles,
      schedules,
    }))
    setDisplaySchedules(schedules)
    setShowScheduleModal(true)
    setIsExtracting(false)
  }

  const handleFilesChange = async (event) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length === 0) {
      return
    }

    const preparedFiles = await Promise.all(
      selectedFiles.map((file) => prepareScheduleFile(file)),
    )

    const nextFiles = [
      ...files,
      ...preparedFiles,
    ]

    updateSchedule((prevSchedule) => ({
      ...prevSchedule,
      files: nextFiles,
    }))

    event.target.value = ''
    openScheduleConfirmModal(nextFiles)
  }

  const removeFile = (fileId) => {
    const removedFile = files.find((file) => file.id === fileId)
    revokePreviewUrl(removedFile)

    updateSchedule((prevSchedule) => {
      const nextFiles = (prevSchedule.files ?? []).filter(
        (file) => file.id !== fileId,
      )

      return {
        ...prevSchedule,
        files: nextFiles,
        schedules: nextFiles.length > 0 ? prevSchedule.schedules : [],
      }
    })
  }

  const startScheduleEdit = (scheduleId) => {
    const targetSchedule = displaySchedules.find(
      (scheduleItem) => scheduleItem.id === scheduleId,
    )

    if (!targetSchedule) {
      return
    }

    setEditingScheduleDraft(createScheduleDraft(targetSchedule))
    setEditingScheduleId('')
    setActiveFieldKey('')
  }

  const activateScheduleField = (scheduleId, fieldKey) => {
    setEditingScheduleId(scheduleId)
    setActiveFieldKey(fieldKey)
  }

  const updateScheduleField = (scheduleId, fieldKey, nextValue) => {
    setDisplaySchedules((prevSchedules) =>
      prevSchedules.map((scheduleItem) =>
        scheduleItem.id === scheduleId
          ? { ...scheduleItem, [fieldKey]: nextValue }
          : scheduleItem,
      ),
    )
  }

  const openScheduleDatePicker = (fieldKey) => {
    if (!editingScheduleDraft) {
      return
    }

    setPickerState({
      fieldKey,
      type: 'date',
      value: editingScheduleDraft[fieldKey],
    })
  }

  const openScheduleTimePicker = (fieldKey) => {
    if (!editingScheduleDraft) {
      return
    }

    setPickerState({
      fieldKey,
      type: 'time',
      value: editingScheduleDraft[fieldKey],
    })
  }

  const updatePickerValue = (nextValue) => {
    setPickerState((prevPickerState) =>
      prevPickerState ? { ...prevPickerState, value: nextValue } : prevPickerState,
    )
  }

  const closePicker = () => {
    if (pickerState) {
      setEditingScheduleDraft((prevDraft) =>
        prevDraft
          ? {
              ...prevDraft,
              [pickerState.fieldKey]: pickerState.value,
            }
          : prevDraft,
      )
    }

    setPickerState(null)
  }

  const saveScheduleDraft = () => {
    if (!editingScheduleDraft) {
      return
    }

    if (isArrivalBeforeDeparture(editingScheduleDraft)) {
      return
    }

    const nextScheduleItem = {
      id: editingScheduleDraft.id,
      date: formatShortDate(editingScheduleDraft.departureDate),
      departureDate: formatStoredDate(editingScheduleDraft.departureDate),
      arrivalDate: formatStoredDate(editingScheduleDraft.arrivalDate),
      departureAirport: toAirportCode(editingScheduleDraft.departureAirport),
      arrivalAirport: toAirportCode(editingScheduleDraft.arrivalAirport),
      departureTime: formatTimeValue(editingScheduleDraft.departureTime),
      arrivalTime: formatTimeValue(editingScheduleDraft.arrivalTime),
    }

    const nextSchedules = displaySchedules.map((scheduleItem) =>
      scheduleItem.id === editingScheduleDraft.id
        ? { ...scheduleItem, ...nextScheduleItem }
        : scheduleItem,
    )

    setDisplaySchedules(nextSchedules)
    updateSchedule((prevSchedule) => ({
      ...prevSchedule,
      schedules: nextSchedules,
    }))
    setEditingScheduleDraft(null)
    setPickerState(null)
  }

  const completeAfterNotice = (nextSchedule) => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current)
    }

    setShowScheduleModal(false)
    setShowCompleteModal(true)

    completeTimerRef.current = setTimeout(() => {
      onComplete?.(nextSchedule)
    }, 2000)
  }

  const saveConfirmedSchedules = () => {
    const nextSchedule = {
      ...schedule,
      schedules: displaySchedules,
    }

    updateSchedule(nextSchedule)
    completeAfterNotice(nextSchedule)
  }

  const dismissScheduleModal = () => {
    setShowScheduleModal(false)
    setEditingScheduleDraft(null)
    setPickerState(null)
  }

  const handleMainSave = () => {
    if (!canContinue) {
      return
    }

    if (hasConfirmedSchedules) {
      completeAfterNotice(schedule)
      return
    }

    openScheduleConfirmModal(files)
  }

  const skipSchedule = () => {
    completeAfterNotice(schedule)
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <OnboardingStatusBar />

        <div className="box-border px-6 pb-[30px] pt-5">
          <button
            className="flex h-6 w-6 cursor-pointer items-center justify-center border-0 bg-transparent p-0"
            type="button"
            aria-label="이전 화면으로 돌아가기"
            onClick={onBack}
          >
            <span
              className="h-[10px] w-[10px] rotate-45 border-b-[2.4px] border-l-[2.4px] border-[#1d2b44]"
              aria-hidden="true"
            />
          </button>

          <header className="ml-[10px] mt-[34px]">
            <h1
              className={`m-0 text-[26px] font-bold leading-[34px] tracking-[-1px] text-[#1d2b44] ${headingFontClass}`}
            >
              이번 달 비행 일정을
              <br />
              등록해주세요!
            </h1>

            <div
              className="mt-[31px] flex items-center justify-center gap-[5px]"
              aria-label="온보딩 진행 단계"
            >
              {Array.from({ length: 3 }, (_, index) => (
                <span
                  className={`h-[6px] rounded-full border-0 p-0 transition-[width,background-color] ${
                    index === 2
                      ? 'w-5 bg-[#f6a51a]'
                      : 'w-[6px] bg-[#edf1f6]'
                  }`}
                  key={index}
                  aria-hidden="true"
                />
              ))}
            </div>
          </header>

          <form className="mb-8 mt-8 box-border w-full rounded-[22px] bg-white p-5 shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
            <button
              className="box-border flex h-[161px] w-full flex-col items-center justify-center rounded-[14px] border border-[#eceef2] bg-[#f7f8fb] px-4 text-center"
              type="button"
              onClick={openFilePicker}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eaf4ff] text-[24px] font-normal leading-none text-[#1d2b44]">
                +
              </span>
              <span
                className={`mt-[18px] text-[13px] font-bold leading-[18px] tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
              >
                파일이나 사진을 업로드해주세요
              </span>
              <span
                className={`mt-[7px] text-[11px] font-[590] leading-4 tracking-[-0.64px] text-[#91a4bf] ${headingFontClass}`}
              >
                파일당 최대 10MB
              </span>
            </button>

            <input
              className="hidden"
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              onChange={handleFilesChange}
            />

            {files.length > 0 && (
              <div className="mt-5 grid gap-2">
                {files.map((file) => (
                  <div
                    className="grid min-h-[57px] grid-cols-[34px_minmax(0,1fr)_22px] items-center gap-3 rounded-xl border border-[#eceef2] bg-[#f7f8fb] px-3"
                    key={file.id}
                  >
                    <span
                      className="h-[34px] w-[34px] overflow-hidden rounded-[9px] bg-white shadow-[0_4px_12px_0_rgba(29,43,68,0.06)]"
                      aria-hidden="true"
                    >
                      {file.previewUrl && (
                        <img
                          className="h-full w-full object-cover"
                          src={file.previewUrl}
                          alt=""
                        />
                      )}
                    </span>
                    <span
                      className={`overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
                    >
                      {file.name}
                    </span>
                    <button
                      className="h-[22px] w-[22px] rounded-full border-0 bg-transparent p-0 font-[SF_Pro] text-[22px] font-light leading-[22px] text-[#8a9eb8]"
                      type="button"
                      aria-label={`${file.name} 삭제`}
                      onClick={() => removeFile(file.id)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-[27px] grid grid-cols-[0.8fr_1.2fr] gap-[10px]">
              <button
                className={`box-border h-[53px] cursor-pointer rounded-2xl border-[1.276px] border-[#f5a623] bg-white text-[15px] font-bold leading-[23px] text-[#8a9eb8] ${headingFontClass}`}
                type="button"
                onClick={skipSchedule}
              >
                건너뛰기
              </button>
              <button
                className={`box-border h-[53px] rounded-2xl border-0 text-[15px] font-bold leading-[23px] ${headingFontClass} ${
                  canContinue
                    ? 'cursor-pointer bg-[#f5a623] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)]'
                    : 'cursor-default bg-[#f0f2f6] text-[#91a4bf]'
                }`}
                type="button"
                disabled={!canContinue}
                onClick={handleMainSave}
              >
                {isExtracting ? '확인 중' : '저장하고 계속'}
              </button>
            </div>
          </form>
        </div>

        {showScheduleModal && (
          <ScheduleConfirmModal
            activeFieldKey={activeFieldKey}
            editingScheduleId={editingScheduleId}
            file={files[files.length - 1]}
            fileName={modalFileName || files[0]?.name || '업로드한 일정 파일'}
            schedules={displaySchedules}
            onActivateField={activateScheduleField}
            onDismiss={dismissScheduleModal}
            onFieldChange={updateScheduleField}
            onSave={saveConfirmedSchedules}
            onStartEdit={startScheduleEdit}
          />
        )}

        {editingScheduleDraft && (
          <ScheduleEditCard
            draft={editingScheduleDraft}
            onBack={() => {
              setEditingScheduleDraft(null)
              setPickerState(null)
            }}
            onChange={setEditingScheduleDraft}
            onOpenDatePicker={openScheduleDatePicker}
            onOpenTimePicker={openScheduleTimePicker}
            onSave={saveScheduleDraft}
          />
        )}

        {pickerState && (
          <WheelPickerSheet
            type={pickerState.type}
            value={pickerState.value}
            onChange={updatePickerValue}
            onClose={closePicker}
          />
        )}

        {showCompleteModal && (
          <NoticeModal
            message="프로필이 완성되었어요!"
            onDismiss={() => setShowCompleteModal(false)}
          />
        )}
      </section>
    </div>
  )
}

export default ScheduleSetup
