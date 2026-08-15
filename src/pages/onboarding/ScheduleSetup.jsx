import { useEffect, useRef, useState } from 'react'
import { extractSchedulesFromFiles, saveSchedules } from './api/scheduleApi.js'
import calendarIcon from './assets/schedule/calendar.svg'
import checkIcon from './assets/schedule/check.svg'
import clockIcon from './assets/schedule/clock.svg'
import editIcon from './assets/schedule/edit.svg'
import textIcon from './assets/schedule/text.svg'
import xButtonIcon from './assets/schedule/x-button.svg'
import plane2Icon from './assets/schedule/plane2.svg'
import warningRedIcon from './assets/schedule/warning-red.svg'
import warningIcon from '../../assets/icons/warning.svg'
import { ScheduleConfirmModal } from '../../components/common/schedule/index.js'
import airportSuggestions from '../../components/common/schedule/airports.json'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'

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
const maxScheduleFileSize = 10 * 1024 * 1024
const imageCompressionType = 'image/jpeg'
const imageCompressionMaxSides = [2200, 1800, 1400, 1100, 900, 700]
const imageCompressionQualities = [0.82, 0.72, 0.62, 0.52, 0.42]

const pickerYears = Array.from({ length: 5 }, (_, index) => 2026 + index)
const pickerMonths = Array.from({ length: 12 }, (_, index) => index + 1)
const pickerHours = Array.from({ length: 12 }, (_, index) => index + 1)
const pickerMinutes = Array.from({ length: 60 }, (_, index) => index)
const pickerPeriods = ['오전', '오후']
const weekdays = ['일', '월', '화', '수', '목', '금', '토']
const airportLabelMap = Object.fromEntries(
  airportSuggestions.map((airport) => [airport.code, `${airport.name}, ${airport.code}`]),
)

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

const isArrivalBeforeDeparture = (draft) => {
  if (!draft.arrivalDate || !draft.arrivalTime || !draft.departureDate || !draft.departureTime) {
    return false
  }

  return (
    getScheduleDateTimeValue(draft.arrivalDate, draft.arrivalTime) <
    getScheduleDateTimeValue(draft.departureDate, draft.departureTime)
  )
}

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

const createManualScheduleDraft = () => ({
  id: `manual-schedule-${createId()}`,
  departureAirport: '',
  arrivalAirport: '',
  departureDate: null,
  arrivalDate: null,
  departureTime: null,
  arrivalTime: null,
})

const getScheduleDraftSignature = (draft) => {
  if (!draft) {
    return ''
  }

  return [
    String(draft.departureAirport ?? '').trim(),
    String(draft.arrivalAirport ?? '').trim(),
    draft.departureDate ? formatStoredDate(draft.departureDate) : '',
    draft.arrivalDate ? formatStoredDate(draft.arrivalDate) : '',
    draft.departureTime ? formatTimeValue(draft.departureTime) : '',
    draft.arrivalTime ? formatTimeValue(draft.arrivalTime) : '',
  ].join('|')
}

function EditFieldButton({ icon, label, value, placeholder, onClick }) {
  const hasValue = value && String(value).trim() !== ''

  return (
    <div>
      <span
        className={`mb-[7px] block text-[12px] font-[510] leading-[16px] tracking-[-0.64px] text-[#8A9EB8] ${headingFontClass}`}
      >
        {label}
      </span>
      <button
        className={`box-border flex h-[40px] w-full items-center justify-between rounded-[10px] border-[1.276px] border-[#ECEEF2] bg-white px-[10px] text-[12px] font-normal leading-[18px] tracking-[-0.64px] ${hasValue ? 'text-[#1D2B44]' : 'text-[#8A9EB8]'} ${headingFontClass}`}
        type="button"
        onClick={onClick}
      >
        <span className="flex min-w-0 items-center gap-[7px]">
          {icon && (
            <span className="flex h-[16px] w-[16px] items-center justify-center">
              {icon}
            </span>
          )}
          <span className="truncate">{hasValue ? value : placeholder ?? ''}</span>
        </span>
        <span
          className="h-[8px] w-[8px] rotate-45 border-b-[1.7px] border-r-[1.7px] border-[#8A9EB8]"
          aria-hidden="true"
        />
      </button>
    </div>
  )
}

function AirportAutocompleteInput({ value, placeholder, onChange, onSelect }) {
  const [isFocused, setIsFocused] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState('')
  const selectTimerRef = useRef(null)
  const query = String(value ?? '').trim().toLowerCase()
  const filteredSuggestions = query
    ? airportSuggestions
        .filter((airport) =>
          airport.name.toLowerCase().includes(query) ||
          airport.code.toLowerCase().includes(query),
        )
        .slice(0, 4)
    : []
  const shouldShowSuggestions = isFocused && filteredSuggestions.length > 0

  const formatAirport = (airport) => `${airport.name}, ${airport.code}`

  const handleFocus = () => {
    setIsFocused(true)
  }

  const handleBlur = () => {
    window.setTimeout(() => setIsFocused(false), 120)
  }

  return (
    <div className="relative">
      <input
        className={`box-border h-[40px] w-full rounded-[10px] border-[1.276px] bg-white px-[13px] text-[12px] font-normal leading-[18px] tracking-[-0.64px] text-[#1D2B44] outline-none placeholder:text-[#8A9EB8] ${headingFontClass} ${
          isFocused ? 'border-[#F5A623]' : 'border-[#ECEEF2]'
        } ${shouldShowSuggestions ? 'rounded-b-none' : ''}`}
        type="text"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={(event) => {
          if (selectTimerRef.current) {
            window.clearTimeout(selectTimerRef.current)
          }
          setIsFocused(true)
          setSelectedSuggestion('')
          onChange(event.target.value)
        }}
      />

      {shouldShowSuggestions && (
        <div className="absolute left-0 right-0 top-[39px] z-20 overflow-hidden rounded-b-[10px] border-x-[1.276px] border-b-[1.276px] border-[#eceef2] bg-white shadow-[0_8px_18px_0_rgba(29,43,68,0.08)]">
          {filteredSuggestions.map((airport) => {
            const label = formatAirport(airport)
            const isSelected = selectedSuggestion === label

            return (
              <button
                className={`flex h-[40px] w-full items-center border-0 border-b border-[#eceef2] px-[13px] text-left text-[12px] font-normal leading-[18px] tracking-[-0.64px] last:border-b-0 ${headingFontClass} ${
                  isSelected
                    ? 'bg-[#FFFBF2] text-[#F5A623]'
                    : 'bg-white text-[#1d2b44]'
                }`}
                key={airport.code}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (selectTimerRef.current) {
                    window.clearTimeout(selectTimerRef.current)
                  }
                  setSelectedSuggestion(label)
                  selectTimerRef.current = window.setTimeout(() => {
                    onSelect(label)
                    setIsFocused(false)
                  }, 1000)
                }}
              >
                <span className="truncate">{label}</span>
              </button>
            )
          })}
        </div>
      )}
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
  canSave,
  title,
  saveLabel = '정보 수정하기',
  onBack,
  onSave,
  onChange,
  onOpenDatePicker,
  onOpenTimePicker,
}) {
  const hasDateTimeError = isArrivalBeforeDeparture(draft)
  const isSaveEnabled = canSave && !hasDateTimeError

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
            {title ?? formatFullDateLabel(draft.departureDate)}
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
            <AirportAutocompleteInput
              value={draft.departureAirport}
              placeholder="공항명"
              onChange={(nextValue) =>
                onChange({ ...draft, departureAirport: nextValue })
              }
              onSelect={(airport) =>
                onChange({ ...draft, departureAirport: airport })
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
            <AirportAutocompleteInput
              value={draft.arrivalAirport}
              placeholder="공항명"
              onChange={(nextValue) =>
                onChange({ ...draft, arrivalAirport: nextValue })
              }
              onSelect={(airport) =>
                onChange({ ...draft, arrivalAirport: airport })
              }
            />
          </label>
        </div>

        <div className="mt-[26px] grid grid-cols-2 gap-x-[12px] gap-y-[16px]">
          <EditFieldButton
            icon={<DateIcon />}
            label="출발일"
            value={draft.departureDate ? formatPickerDateLabel(draft.departureDate) : ''}
            placeholder="날짜 선택"
            onClick={() => onOpenDatePicker('departureDate')}
          />
          <EditFieldButton
            icon={<TimeIcon />}
            label="출발 시간"
            value={draft.departureTime ? formatPickerTimeLabel(draft.departureTime) : ''}
            placeholder="시간 선택"
            onClick={() => onOpenTimePicker('departureTime')}
          />
          <EditFieldButton
            icon={<DateIcon />}
            label="도착일"
            value={draft.arrivalDate ? formatPickerDateLabel(draft.arrivalDate) : ''}
            placeholder="날짜 선택"
            onClick={() => onOpenDatePicker('arrivalDate')}
          />
          <EditFieldButton
            icon={<TimeIcon />}
            label="도착 시간"
            value={draft.arrivalTime ? formatPickerTimeLabel(draft.arrivalTime) : ''}
            placeholder="시간 선택"
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
          className={`h-[53px] w-full rounded-[14px] border-0 text-[15px] font-bold leading-[23px] ${headingFontClass} ${
            isSaveEnabled
              ? 'cursor-pointer bg-[#1D2B44] text-white'
              : 'cursor-default bg-[#F0F2F6] text-[#91A4BF]'
          } ${
            hasDateTimeError ? 'mt-[20px]' : 'mt-[30px]'
          }`}
          type="button"
          disabled={!isSaveEnabled}
          onClick={onSave}
        >
          {saveLabel}
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
  const dragStartYRef = useRef(0)
  const isDraggingRef = useRef(false)
  const [dragOffset, setDragOffset] = useState(0)
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

  const startSheetDrag = (event) => {
    isDraggingRef.current = true
    dragStartYRef.current = event.clientY
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const moveSheetDrag = (event) => {
    if (!isDraggingRef.current) {
      return
    }

    setDragOffset(Math.max(0, event.clientY - dragStartYRef.current))
  }

  const endSheetDrag = (event) => {
    if (!isDraggingRef.current) {
      return
    }

    const finalOffset = Math.max(0, event.clientY - dragStartYRef.current)
    isDraggingRef.current = false
    event.currentTarget.releasePointerCapture?.(event.pointerId)

    if (finalOffset > 44) {
      onClose()
      return
    }

    setDragOffset(0)
  }

  return (
    <div
      className="absolute inset-0 z-40 flex items-end justify-center bg-black/45"
      onClick={onClose}
    >
      <div
        className="box-border w-full rounded-t-[22px] bg-white px-[20px] pb-[34px] pt-[13px] shadow-[0_-12px_40px_0_rgba(29,43,68,0.18)]"
        onClick={(event) => event.stopPropagation()}
        style={{
          transform: `translateY(${dragOffset}px)`,
          transition: isDraggingRef.current ? 'none' : 'transform 160ms ease',
        }}
      >
        <span
          className="mx-auto block h-[5px] w-[48px] cursor-grab touch-none rounded-full bg-[#E2E5EA] active:cursor-grabbing"
          aria-hidden="true"
          onPointerCancel={endSheetDrag}
          onPointerDown={startSheetDrag}
          onPointerMove={moveSheetDrag}
          onPointerUp={endSheetDrag}
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

function ManualScheduleListModal({
  schedules,
  onAddSchedule,
  onEditSchedule,
  onSave,
  onDismiss,
}) {
  const hasSchedules = schedules.length > 0
  const canSave = hasSchedules

  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-6"
    >
      <div
        className="relative box-border flex w-full max-w-[340px] flex-col items-start rounded-[24px] bg-white px-5 pb-6 pt-[18px] shadow-[0_20px_60px_0_rgba(29,43,68,0.50)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          className="ml-auto flex h-[28px] w-[28px] items-center justify-center border-0 bg-transparent p-0"
          type="button"
          aria-label="닫기"
          onClick={onDismiss}
        >
          <img className="h-[28px] w-[28px] object-contain" src={xButtonIcon} alt="" />
        </button>

        <h2
          className={`m-0 w-full text-center text-[19px] font-[510] leading-[21px] tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
        >
          비행 일정을 등록해주세요
        </h2>

        <button
          className={`mt-[22px] box-border flex w-full items-center justify-center rounded-[16px] border-[1.276px] border-dashed border-[#ECEEF2] bg-[#F4F6F9] px-[83px] py-[9px] text-[13px] font-[510] leading-[26px] tracking-[-0.64px] text-[#91A4BF] ${headingFontClass}`}
          type="button"
          onClick={onAddSchedule}
        >
          <span className="mr-[10px] text-[16px] font-normal leading-none">+</span>
          비행 일정 추가하기
        </button>

        <div className="mt-[16px] w-full max-h-[240px] overflow-y-auto px-2">
          {schedules.map((schedule) => (
            <div
              className="flex min-h-10 items-center border-b border-[#eceef2]"
              key={schedule.id}
            >
              <span
                className={`text-[12px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
                style={{ width: '48px', minWidth: '48px' }}
              >
                {schedule.date}
              </span>
              <span className="ml-[18px] flex items-center gap-[2px]">
                <span
                  className={`text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
                >
                  {schedule.departureTime}
                </span>
                <span
                  className={`text-[12px] font-[510] leading-[21px] tracking-[-0.4px] text-[#3F8AE1] ${headingFontClass}`}
                >
                  {schedule.departureAirport}
                </span>
              </span>
              <span className="mx-[5px] flex items-center justify-center" aria-hidden="true">
                <img
                  className="block h-[17px] w-6 object-contain"
                  src={plane2Icon}
                  alt=""
                />
              </span>
              <span className="flex items-center gap-[2px]">
                <span
                  className={`text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
                >
                  {schedule.arrivalTime}
                </span>
                <span
                  className={`text-[12px] font-[510] leading-[21px] tracking-[-0.4px] text-[#3F8AE1] ${headingFontClass}`}
                >
                  {schedule.arrivalAirport}
                </span>
              </span>
              <button
                className="ml-auto flex h-[24px] w-[22px] items-center justify-center border-0 bg-transparent p-0 outline-none"
                type="button"
                aria-label={`${schedule.date} 일정 수정`}
                onClick={() => onEditSchedule(schedule.id)}
              >
                <img
                  className="block h-[15px] w-[15px] object-contain opacity-50"
                  src={editIcon}
                  alt=""
                />
              </button>
            </div>
          ))}
          {Array.from({ length: Math.max(0, 5 - schedules.length) }).map((_, index) => (
            <div
              className="min-h-10 border-b border-[#eceef2]"
              key={`empty-row-${index}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-[18px] flex w-full items-center justify-center gap-[5px]">
          {Array.from({ length: 3 }, (_, index) => (
            <span
              className={
                index === 0
                  ? 'h-[6px] w-5 rounded-full bg-[#f6a51a]'
                  : 'h-[6px] w-[6px] rounded-full bg-[#edf1f6]'
              }
              key={index}
            />
          ))}
        </div>

        <button
          className={`mt-[25px] h-[53px] w-full rounded-2xl border-0 text-[15px] font-bold leading-[23px] ${headingFontClass} ${
            canSave
              ? 'cursor-pointer bg-[#f5a623] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)]'
              : 'cursor-default bg-[#f0f2f6] text-[#91a4bf]'
          }`}
          type="button"
          disabled={!canSave}
          onClick={onSave}
        >
          저장하고 계속
        </button>
      </div>
    </div>
  )
}

function ScheduleExtractFailureModal({ onDismiss, onManualInput, onRetryUpload }) {
  return (
    <div
      className="absolute inset-0 z-30 flex items-center justify-center bg-black/45 px-6"
      onClick={onDismiss}
    >
      <div
        className="box-border flex w-full max-w-[307px] flex-col items-center rounded-[18px] bg-white px-[35px] pb-[23px] pt-[31px] shadow-[0_20px_60px_0_rgba(29,43,68,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <img
          className="h-[32px] w-[32px] object-contain"
          src={warningIcon}
          alt=""
          aria-hidden="true"
        />
        <p
          className={`m-0 mt-[18px] whitespace-pre-line text-center text-[16px] font-[510] leading-[22px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
        >
          일정을 인식하지 못했어요.
          {'\n'}
          직접 입력하시겠어요?
        </p>

        <div className="mt-[24px] grid w-full grid-cols-2 gap-[10px]">
          <button
            className={`h-[45px] rounded-[10px] border-0 bg-[#F0F2F6] px-0 text-[13px] font-bold leading-[20px] tracking-[-0.4px] text-[#91A4BF] ${headingFontClass}`}
            type="button"
            onClick={onRetryUpload}
          >
            다시 업로드하기
          </button>
          <button
            className={`h-[45px] rounded-[10px] border-0 bg-[#F5A623] px-0 text-[13px] font-bold leading-[20px] tracking-[-0.4px] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)] ${headingFontClass}`}
            type="button"
            onClick={onManualInput}
          >
            직접 입력하기
          </button>
        </div>
      </div>
    </div>
  )
}

// embedded=true 이면 온보딩 껍데기(상태바·뒤로가기·타이틀·진행점) 없이
// 업로드 카드와 모달만 렌더한다. 일정 탭에서 모달로 띄울 때 사용.
function ScheduleSetup({
  value,
  onChange,
  onBack,
  onComplete,
  embedded = false,
  completeMessage,
}) {
  const fileInputRef = useRef(null)
  const filesRef = useRef([])
  const completeTimerRef = useRef(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showExtractFailureModal, setShowExtractFailureModal] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState('')
  const [activeFieldKey, setActiveFieldKey] = useState('')
  const [editingScheduleDraft, setEditingScheduleDraft] = useState(null)
  const [editingScheduleOriginalSignature, setEditingScheduleOriginalSignature] =
    useState('')
  const [pickerState, setPickerState] = useState(null)
  const [displaySchedules, setDisplaySchedules] = useState([])
  const [modalFileName, setModalFileName] = useState('')
  const [localSchedule, setLocalSchedule] = useState(emptySchedule)
  const [showManualListModal, setShowManualListModal] = useState(false)
  const [manualSchedules, setManualSchedules] = useState([])
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
    setShowExtractFailureModal(false)
    setShowScheduleModal(false)
    setEditingScheduleId('')
    setActiveFieldKey('')
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setPickerState(null)
    setModalFileName(targetFiles[targetFiles.length - 1]?.name ?? '업로드한 일정 파일')

    try {
      const schedules = await extractSchedulesFromFiles(targetFiles)

      updateSchedule((prevSchedule) => ({
        ...prevSchedule,
        files: targetFiles,
        schedules,
      }))
      setDisplaySchedules(schedules)
      setShowScheduleModal(true)
    } catch {
      updateSchedule((prevSchedule) => ({
        ...prevSchedule,
        files: targetFiles,
        schedules: [],
      }))
      setDisplaySchedules([])
      setShowExtractFailureModal(true)
    } finally {
      setIsExtracting(false)
    }
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

    const nextDraft = createScheduleDraft(targetSchedule)
    setEditingScheduleDraft(nextDraft)
    setEditingScheduleOriginalSignature(getScheduleDraftSignature(nextDraft))
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

    const now = new Date()
    const defaultDate = {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    }

    setPickerState({
      fieldKey,
      type: 'date',
      value: editingScheduleDraft[fieldKey] ?? defaultDate,
    })
  }

  const openScheduleTimePicker = (fieldKey) => {
    if (!editingScheduleDraft) {
      return
    }

    const defaultTime = {
      period: '오전',
      hour: 12,
      minute: 0,
    }

    setPickerState({
      fieldKey,
      type: 'time',
      value: editingScheduleDraft[fieldKey] ?? defaultTime,
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

  const hasEditedScheduleDraft =
    Boolean(editingScheduleDraft) &&
    getScheduleDraftSignature(editingScheduleDraft) !==
      editingScheduleOriginalSignature

  const saveScheduleDraft = () => {
    if (!editingScheduleDraft) {
      return
    }

    if (isArrivalBeforeDeparture(editingScheduleDraft)) {
      return
    }

    const isNewSchedule = !displaySchedules.some(
      (scheduleItem) => scheduleItem.id === editingScheduleDraft.id,
    )

    if (!isNewSchedule && !hasEditedScheduleDraft) {
      return
    }

    const defaultDate = { year: 2026, month: 8, day: 9 }
    const defaultTime = { period: '오전', hour: 12, minute: 0 }
    const depDate = editingScheduleDraft.departureDate ?? defaultDate
    const arrDate = editingScheduleDraft.arrivalDate ?? defaultDate
    const depTime = editingScheduleDraft.departureTime ?? defaultTime
    const arrTime = editingScheduleDraft.arrivalTime ?? defaultTime

    const nextScheduleItem = {
      id: editingScheduleDraft.id,
      date: formatShortDate(depDate),
      departureDate: formatStoredDate(depDate),
      arrivalDate: formatStoredDate(arrDate),
      departureAirport: toAirportCode(editingScheduleDraft.departureAirport),
      arrivalAirport: toAirportCode(editingScheduleDraft.arrivalAirport),
      departureTime: formatTimeValue(depTime),
      arrivalTime: formatTimeValue(arrTime),
    }

    const hasExistingSchedule = !isNewSchedule
    const nextSchedules = hasExistingSchedule
      ? displaySchedules.map((scheduleItem) =>
          scheduleItem.id === editingScheduleDraft.id
            ? { ...scheduleItem, ...nextScheduleItem }
            : scheduleItem,
        )
      : [...displaySchedules, nextScheduleItem]

    setDisplaySchedules(nextSchedules)
    updateSchedule((prevSchedule) => ({
      ...prevSchedule,
      schedules: nextSchedules,
    }))
    setModalFileName(files[files.length - 1]?.name ?? '직접 입력 일정')
    setShowScheduleModal(true)
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setPickerState(null)
  }

  // [업로드] — 서버에 실제로 저장한 뒤에 완료 화면을 띄운다.
  // 저장이 실패하면 완료 화면을 띄우지 않는다 (저장된 척하면 안 된다)
  const completeAfterNotice = async (nextSchedule) => {
    if (completeTimerRef.current) {
      clearTimeout(completeTimerRef.current)
    }

    setShowScheduleModal(false)

    try {
      await saveSchedules(nextSchedule.schedules)
    } catch (error) {
      console.error('일정 저장 실패', error)
      window.alert('일정 저장에 실패했어요. 잠시 후 다시 시도해주세요.')

      return
    }

    setShowCompleteModal(true)

    completeTimerRef.current = setTimeout(() => {
      onComplete?.(nextSchedule)
    }, 2000)
  }

  // [저장하고 계속] — 확인 모달을 닫고 업로드 모달(파일 목록)로 돌아간다.
  // 최종 완료는 업로드 모달의 [업로드] 버튼에서 처리한다.
  const saveConfirmedSchedules = () => {
    const nextSchedule = {
      ...schedule,
      schedules: displaySchedules,
    }

    updateSchedule(nextSchedule)
    setShowScheduleModal(false)
    setEditingScheduleId('')
    setActiveFieldKey('')
  }

  const dismissScheduleModal = () => {
    setShowScheduleModal(false)
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setPickerState(null)
  }

  const resetScheduleUpload = () => {
    files.forEach(revokePreviewUrl)
    updateSchedule({
      files: [],
      schedules: [],
    })
    setDisplaySchedules([])
    setModalFileName('')
    setShowExtractFailureModal(false)
    setShowScheduleModal(false)
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setPickerState(null)
  }

  const startManualScheduleInput = () => {
    setShowExtractFailureModal(false)
    setShowScheduleModal(false)
    setEditingScheduleId('')
    setActiveFieldKey('')
    setDisplaySchedules([])
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setShowManualListModal(true)
  }

  const openManualScheduleAdd = () => {
    const nextDraft = createManualScheduleDraft()
    setEditingScheduleDraft(nextDraft)
    setEditingScheduleOriginalSignature('')
  }

  const openManualScheduleEdit = (scheduleId) => {
    const targetSchedule = manualSchedules.find(
      (scheduleItem) => scheduleItem.id === scheduleId,
    )

    if (!targetSchedule) {
      return
    }

    const nextDraft = createScheduleDraft(targetSchedule)
    setEditingScheduleDraft(nextDraft)
    setEditingScheduleOriginalSignature(getScheduleDraftSignature(nextDraft))
  }

  const saveManualScheduleDraft = () => {
    if (!editingScheduleDraft) {
      return
    }

    if (isArrivalBeforeDeparture(editingScheduleDraft)) {
      return
    }

    const defaultDate = { year: 2026, month: 8, day: 9 }
    const defaultTime = { period: '오전', hour: 9, minute: 0 }
    const depDate = editingScheduleDraft.departureDate ?? defaultDate
    const arrDate = editingScheduleDraft.arrivalDate ?? defaultDate
    const depTime = editingScheduleDraft.departureTime ?? defaultTime
    const arrTime = editingScheduleDraft.arrivalTime ?? defaultTime

    const nextScheduleItem = {
      id: editingScheduleDraft.id,
      date: formatShortDate(depDate),
      departureDate: formatStoredDate(depDate),
      arrivalDate: formatStoredDate(arrDate),
      departureAirport: toAirportCode(editingScheduleDraft.departureAirport),
      arrivalAirport: toAirportCode(editingScheduleDraft.arrivalAirport),
      departureTime: formatTimeValue(depTime),
      arrivalTime: formatTimeValue(arrTime),
    }

    const hasExisting = manualSchedules.some(
      (scheduleItem) => scheduleItem.id === editingScheduleDraft.id,
    )
    const nextSchedules = hasExisting
      ? manualSchedules.map((scheduleItem) =>
          scheduleItem.id === editingScheduleDraft.id
            ? { ...scheduleItem, ...nextScheduleItem }
            : scheduleItem,
        )
      : [...manualSchedules, nextScheduleItem]

    setManualSchedules(nextSchedules)
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setPickerState(null)
  }

  const saveManualScheduleList = () => {
    if (manualSchedules.length === 0) {
      return
    }

    const nextSchedule = {
      ...schedule,
      schedules: manualSchedules,
    }

    updateSchedule(nextSchedule)
    setShowManualListModal(false)
  }

  const reopenScheduleConfirmModal = (file) => {
    setEditingScheduleId('')
    setActiveFieldKey('')
    setEditingScheduleDraft(null)
    setEditingScheduleOriginalSignature('')
    setPickerState(null)
    setShowExtractFailureModal(false)

    if (manualSchedules.length > 0) {
      setShowScheduleModal(false)
      setShowManualListModal(true)
    } else {
      const existingSchedules = schedule.schedules ?? []
      setDisplaySchedules(existingSchedules)
      setModalFileName(file.name)
      setShowManualListModal(false)
      setShowScheduleModal(true)
    }
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

  // 모달이 겹치면 딤이 여러 겹 깔려서 뒤 카드가 비쳐 보인다.
  // 더 깊은 모달이 열리면 앞 단계는 감춘다.
  const isEditingSchedule = Boolean(editingScheduleDraft) || Boolean(pickerState)
  const hasOverlay =
    showScheduleModal ||
    showExtractFailureModal ||
    showManualListModal ||
    showCompleteModal ||
    isEditingSchedule

  const overlays = (
    <>
      {showScheduleModal && !isEditingSchedule && (
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
          onAddSchedule={() => {
            const nextDraft = createManualScheduleDraft()
            setEditingScheduleDraft(nextDraft)
            setEditingScheduleOriginalSignature('')
          }}
        />
      )}

      {showExtractFailureModal && (
        <ScheduleExtractFailureModal
          onDismiss={() => setShowExtractFailureModal(false)}
          onManualInput={startManualScheduleInput}
          onRetryUpload={resetScheduleUpload}
        />
      )}

      {showManualListModal && !editingScheduleDraft && (
        <ManualScheduleListModal
          schedules={manualSchedules}
          onAddSchedule={openManualScheduleAdd}
          onEditSchedule={openManualScheduleEdit}
          onSave={saveManualScheduleList}
          onDismiss={() => setShowManualListModal(false)}
        />
      )}

      {/* 직접 입력 흐름의 편집 카드 */}
      {editingScheduleDraft && showManualListModal && (
        <ScheduleEditCard
          draft={editingScheduleDraft}
          canSave={
            !isArrivalBeforeDeparture(editingScheduleDraft) &&
            String(editingScheduleDraft.departureAirport ?? '').trim() !== '' &&
            String(editingScheduleDraft.arrivalAirport ?? '').trim() !== '' &&
            editingScheduleDraft.departureDate !== null &&
            editingScheduleDraft.arrivalDate !== null &&
            editingScheduleDraft.departureTime !== null &&
            editingScheduleDraft.arrivalTime !== null &&
            (manualSchedules.some((s) => s.id === editingScheduleDraft.id)
              ? getScheduleDraftSignature(editingScheduleDraft) !==
                editingScheduleOriginalSignature
              : true)
          }
          title="비행 일정 추가하기"
          saveLabel={
            manualSchedules.some((s) => s.id === editingScheduleDraft.id)
              ? '정보 수정하기'
              : '+ 추가하기'
          }
          onBack={() => {
            setEditingScheduleDraft(null)
            setEditingScheduleOriginalSignature('')
            setPickerState(null)
          }}
          onChange={setEditingScheduleDraft}
          onOpenDatePicker={openScheduleDatePicker}
          onOpenTimePicker={openScheduleTimePicker}
          onSave={saveManualScheduleDraft}
        />
      )}

      {/* 사진 인식 흐름의 편집 카드. 피커는 바텀시트라 위에 겹쳐 뜬다 */}
      {editingScheduleDraft && !showManualListModal && (
        <ScheduleEditCard
          draft={editingScheduleDraft}
          canSave={
            displaySchedules.some((s) => s.id === editingScheduleDraft.id)
              ? hasEditedScheduleDraft
              : (
                !isArrivalBeforeDeparture(editingScheduleDraft) &&
                String(editingScheduleDraft.departureAirport ?? '').trim() !== '' &&
                String(editingScheduleDraft.arrivalAirport ?? '').trim() !== '' &&
                editingScheduleDraft.departureDate !== null &&
                editingScheduleDraft.arrivalDate !== null &&
                editingScheduleDraft.departureTime !== null &&
                editingScheduleDraft.arrivalTime !== null
              )
          }
          title={displaySchedules.some((s) => s.id === editingScheduleDraft.id) ? undefined : '비행 일정 추가하기'}
          saveLabel={displaySchedules.some((s) => s.id === editingScheduleDraft.id) ? '정보 수정하기' : '+ 추가하기'}
          onBack={() => {
            setEditingScheduleDraft(null)
            setEditingScheduleOriginalSignature('')
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
          message={
            completeMessage ??
            (embedded ? '비행 일정이 등록되었어요!' : '프로필이 완성되었어요!')
          }
          onDismiss={() => setShowCompleteModal(false)}
        />
      )}
    </>
  )

  // 일정 탭 — 달력 위에 모달로 뜬다
  if (embedded) {
    return (
      <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(29,43,68,0.4)] px-[18px]">
        {/* 다음 단계 모달이 열리면 업로드 카드는 감춘다 (딤이 겹치지 않게) */}
        <div
          className={`w-full rounded-[26px] bg-white px-[22px] pt-[24px] pb-[26px] drop-shadow-[0px_-8px_20px_rgba(29,43,68,0.16)] ${
            hasOverlay ? 'invisible' : ''
          }`}
        >
          <div className="flex items-center justify-between pl-[6px]">
            <p
              className={`text-[20px] leading-[22.5px] font-[860] tracking-[-0.72px] text-[#1d2b44] ${headingFontClass}`}
            >
              비행 일정 등록하기
            </p>

            <button
              type="button"
              aria-label="닫기"
              className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#f0f2f6] text-[15px] text-[#1d2b44]"
              onClick={onBack}
            >
              ✕
            </button>
          </div>

          <button
            className="mt-[22px] box-border flex h-[161px] w-full flex-col items-center justify-center rounded-[18px] border-[1.276px] border-dashed border-[#c5deff] bg-[#e8f3ff] px-4 text-center"
            type="button"
            onClick={openFilePicker}
          >
            <span className="flex size-[52px] items-center justify-center rounded-full bg-white text-[24px] leading-none text-[#1d2b44] drop-shadow-[0px_4px_7px_rgba(92,156,230,0.2)]">
              +
            </span>
            <span
              className={`mt-[12px] text-[14px] leading-[21px] font-bold tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
            >
              파일이나 사진을 업로드해주세요
            </span>
            <span
              className={`mt-[6px] text-[12px] leading-[20.4px] tracking-[-0.64px] text-[#8a9eb8] ${headingFontClass}`}
            >
              파일용량 10MB 제한
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
            <div className="mt-4 grid gap-2">
              {files.map((file) => (
                <div
                  className="grid min-h-[57px] grid-cols-[22px_34px_minmax(0,1fr)_22px] items-center gap-3 rounded-xl border border-[#eceef2] bg-[#f7f8fb] px-3"
                  key={file.id}
                >
                  <button
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-0 bg-transparent p-0 text-[22px] leading-[22px] font-light text-[#8a9eb8]"
                    type="button"
                    aria-label={`${file.name} 삭제`}
                    onClick={() => removeFile(file.id)}
                  >
                    ×
                  </button>
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
                    className="flex h-[22px] w-[22px] items-center justify-center border-0 bg-transparent p-0"
                    type="button"
                    aria-label={`${file.name} 일정 확인`}
                    onClick={() => reopenScheduleConfirmModal(file)}
                  >
                    <span
                      className="h-[9px] w-[9px] rotate-45 border-t-[2px] border-r-[2px] border-[#8a9eb8]"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            className={`mt-[18px] h-[53px] w-full rounded-[16px] border-0 text-[15px] leading-[22.5px] font-[860] tracking-[-0.4px] ${headingFontClass} ${
              canContinue
                ? 'cursor-pointer bg-[#f5a623] text-white drop-shadow-[0px_3px_6px_rgba(245,166,35,0.32)]'
                : 'cursor-default bg-[#f0f2f6] text-[#8a9eb8]'
            }`}
            type="button"
            disabled={!canContinue}
            onClick={handleMainSave}
          >
            {isExtracting ? '확인 중' : '업로드'}
          </button>
        </div>

        {overlays}
      </div>
    )
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
                파일용량 10MB 제한
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

            <button
              className={`mt-[14px] box-border flex w-full items-center justify-center rounded-[16px] border-[1.276px] border-dashed border-[#ECEEF2] bg-[#F4F6F9] py-[9px] text-[13px] font-[510] leading-[26px] tracking-[-0.64px] text-[#91A4BF] ${headingFontClass}`}
              type="button"
              onClick={startManualScheduleInput}
            >
              <span className="mr-[10px] text-[16px] font-normal leading-none">+</span>
              일정 직접 입력하기
            </button>

            {files.length > 0 && manualSchedules.length === 0 && (
              <div className="mt-5 grid gap-2">
                {files.map((file) => (
                  <div
                    className="grid min-h-[57px] grid-cols-[22px_34px_minmax(0,1fr)_22px] items-center gap-3 rounded-xl border border-[#eceef2] bg-[#f7f8fb] px-3"
                    key={file.id}
                  >
                    <button
                      className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-0 bg-transparent p-0 font-[SF_Pro] text-[22px] font-light leading-[22px] text-[#8a9eb8]"
                      type="button"
                      aria-label={`${file.name} 삭제`}
                      onClick={() => removeFile(file.id)}
                    >
                      ×
                    </button>
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
                      className="flex h-[22px] w-[22px] items-center justify-center border-0 bg-transparent p-0"
                      type="button"
                      aria-label={`${file.name} 일정 확인`}
                      onClick={() => reopenScheduleConfirmModal(file)}
                    >
                      <span
                        className="h-[9px] w-[9px] rotate-45 border-r-[2px] border-t-[2px] border-[#8a9eb8]"
                        aria-hidden="true"
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {manualSchedules.length > 0 && (
              <div className={`${files.length > 0 ? 'mt-2' : 'mt-5'} grid gap-2`}>
                <div
                  className="grid min-h-[57px] grid-cols-[22px_34px_minmax(0,1fr)_22px] items-center gap-3 rounded-xl border border-[#eceef2] bg-[#f7f8fb] px-3"
                >
                  <button
                    className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-0 bg-transparent p-0 font-[SF_Pro] text-[22px] font-light leading-[22px] text-[#8a9eb8]"
                    type="button"
                    aria-label="직접 등록한 일정 삭제"
                    onClick={() => setManualSchedules([])}
                  >
                    ×
                  </button>
                  <span
                    className="flex h-[34px] w-[34px] items-center justify-center overflow-hidden rounded-[9px] bg-white shadow-[0_4px_12px_0_rgba(29,43,68,0.06)]"
                    aria-hidden="true"
                  >
                    <img
                      className="h-[15px] w-[15px] object-contain opacity-50"
                      src={textIcon}
                      alt=""
                    />
                  </span>
                  <span
                    className={`overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
                  >
                    직접 등록한 일정
                  </span>
                  <button
                    className="flex h-[22px] w-[22px] items-center justify-center border-0 bg-transparent p-0"
                    type="button"
                    aria-label="직접 등록한 일정 확인"
                    onClick={() => setShowManualListModal(true)}
                  >
                    <span
                      className="h-[9px] w-[9px] rotate-45 border-r-[2px] border-t-[2px] border-[#8a9eb8]"
                      aria-hidden="true"
                    />
                  </button>
                </div>
              </div>
            )}

            <div className="mt-[27px] grid grid-cols-[0.8fr_1.2fr] gap-[10px]">
              <button
                className={`box-border h-[53px] cursor-pointer rounded-2xl border-[1.276px] border-[#f5a623] bg-white text-[15px] font-bold leading-[23px] text-[#F5A623] ${headingFontClass}`}
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

        {overlays}
      </section>
    </div>
  )
}

export default ScheduleSetup
