import { useRef, useState } from 'react'
import { extractSchedulesFromFiles } from './api/scheduleApi.js'
import checkIcon from './assets/schedule/check.svg'
import editIcon from './assets/schedule/edit.svg'
import flightIcon from './assets/schedule/flight.svg'
import OnboardingStatusBar from './components/OnboardingStatusBar.jsx'
import { mockSchedules } from './mocks/mockSchedules.js'

const emptySchedule = {
  files: [],
  schedules: [],
}

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[Arial,sans-serif] text-[15px] font-normal leading-normal tracking-[0] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"
const activeEditIconStyle = {
  filter:
    'brightness(0) saturate(100%) invert(68%) sepia(80%) saturate(912%) hue-rotate(347deg) brightness(99%) contrast(94%)',
}

const editableScheduleFields = [
  { key: 'date', width: 48, maxLength: 5 },
  { key: 'departureTime', width: 46, maxLength: 5 },
  { key: 'departureAirport', width: 32, maxLength: 3, airport: true },
  { key: 'arrivalTime', width: 46, maxLength: 5 },
  { key: 'arrivalAirport', width: 32, maxLength: 3, airport: true },
]

const createId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random()}`
}

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
            className="h-[34px] w-[34px] rounded-[9px] bg-white shadow-[0_4px_12px_0_rgba(29,43,68,0.06)]"
            aria-hidden="true"
          />
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
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [isExtracting, setIsExtracting] = useState(false)
  const [editingScheduleId, setEditingScheduleId] = useState('')
  const [activeFieldKey, setActiveFieldKey] = useState('')
  const [displaySchedules, setDisplaySchedules] = useState([])
  const [modalFileName, setModalFileName] = useState('')
  const [localSchedule, setLocalSchedule] = useState(emptySchedule)
  const schedule = value ?? localSchedule
  const files = schedule.files ?? []
  const canContinue = files.length > 0 && !isExtracting
  const hasConfirmedSchedules = (schedule.schedules ?? []).length > 0

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

  const handleFilesChange = (event) => {
    const selectedFiles = Array.from(event.target.files ?? [])

    if (selectedFiles.length === 0) {
      return
    }

    const nextFiles = [
      ...files,
      ...selectedFiles.map((file) => ({
        id: createId(),
        name: file.name,
        sourceFile: file,
      })),
    ]

    updateSchedule((prevSchedule) => ({
      ...prevSchedule,
      files: nextFiles,
    }))

    event.target.value = ''
    openScheduleConfirmModal(nextFiles)
  }

  const removeFile = (fileId) => {
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
    if (editingScheduleId === scheduleId) {
      setEditingScheduleId('')
      setActiveFieldKey('')
      return
    }

    setEditingScheduleId(scheduleId)
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

  const saveConfirmedSchedules = () => {
    const nextSchedule = {
      ...schedule,
      schedules: displaySchedules,
    }

    updateSchedule(nextSchedule)

    setShowScheduleModal(false)
  }

  const dismissScheduleModal = () => {
    setShowScheduleModal(false)
  }

  const handleMainSave = () => {
    if (!canContinue) {
      return
    }

    if (hasConfirmedSchedules) {
      setShowCompleteModal(true)
      onComplete?.(schedule)
      return
    }

    openScheduleConfirmModal(files)
  }

  const skipSchedule = () => {
    setShowCompleteModal(true)
    onComplete?.(schedule)
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
                파일용량 제한 없음
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
                      className="h-[34px] w-[34px] rounded-[9px] bg-white shadow-[0_4px_12px_0_rgba(29,43,68,0.06)]"
                      aria-hidden="true"
                    />
                    <span
                      className={`overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
                    >
                      {file.name}
                    </span>
                    <button
                      className="h-[22px] w-[22px] rounded-full border-0 bg-transparent p-0 font-[Arial,sans-serif] text-[22px] font-light leading-[22px] text-[#8a9eb8]"
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
            fileName={modalFileName || files[0]?.name || '업로드한 일정 파일'}
            schedules={displaySchedules}
            onActivateField={activateScheduleField}
            onDismiss={dismissScheduleModal}
            onFieldChange={updateScheduleField}
            onSave={saveConfirmedSchedules}
            onStartEdit={startScheduleEdit}
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
