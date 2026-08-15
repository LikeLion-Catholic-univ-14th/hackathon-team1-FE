import ScheduleRow, { defaultScheduleFields } from './ScheduleRow.jsx'
import xButtonIcon from '../../../pages/onboarding/assets/schedule/x-button.svg'

const defaultHeadingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

export default function ScheduleConfirmModal({
  file,
  fileName,
  schedules,
  editingScheduleId,
  activeFieldKey,
  title = '등록된 일정을 확인해주세요',
  saveLabel = '저장하고 계속',
  progressCount = 3,
  activeProgressIndex = 0,
  fields = defaultScheduleFields,
  headingFontClass = defaultHeadingFontClass,
  editIcon,
  flightIcon,
  activeEditIconStyle,
  onStartEdit,
  onActivateField,
  onFieldChange,
  onDismiss,
  onSave,
  onAddSchedule,
}) {
  return (
    <div
      className="absolute inset-0 z-20 flex items-center justify-center bg-black/45 px-6"
    >
      <div
        className="relative box-border w-full max-w-[340px] overflow-hidden rounded-[24px] bg-white px-5 pb-6 pt-[18px] shadow-[0_20px_60px_0_rgba(29,43,68,0.50)]"
        style={{
          borderRadius: '24px',
          boxShadow: '0 20px 60px 0 rgba(29, 43, 68, 0.5)',
        }}
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
          className={`m-0 text-center text-[19px] font-[510] leading-[21px] tracking-[-0.64px] text-[#1d2b44] ${headingFontClass}`}
          style={{ fontSize: '19px' }}
        >
          {title}
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

        {onAddSchedule && (
          <button
            className={`mt-[14px] box-border flex w-full items-center justify-center rounded-[16px] border-[1.276px] border-dashed border-[#ECEEF2] bg-[#F4F6F9] px-[83px] py-[9px] text-[13px] font-[510] leading-[26px] tracking-[-0.64px] text-[#91A4BF] ${headingFontClass}`}
            type="button"
            onClick={onAddSchedule}
          >
            <span className="mr-[10px] text-[16px] font-normal leading-none">+</span>
            비행 일정 추가하기
          </button>
        )}

        <div className="mt-[17px] max-h-[240px] overflow-y-auto px-2">
          {schedules.map((schedule) => (
            <ScheduleRow
              activeEditIconStyle={activeEditIconStyle}
              activeFieldKey={activeFieldKey}
              editIcon={editIcon}
              fields={fields}
              flightIcon={flightIcon}
              headingFontClass={headingFontClass}
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
          {Array.from({ length: Math.max(0, 5 - schedules.length) }).map((_, index) => (
            <div
              className="min-h-10 border-b border-[#eceef2]"
              key={`empty-row-${index}`}
              aria-hidden="true"
            />
          ))}
        </div>

        <div className="mt-[18px] flex items-center justify-center gap-[5px]">
          {Array.from({ length: progressCount }, (_, index) => (
            <span
              className={
                index === activeProgressIndex
                  ? 'h-[6px] w-5 rounded-full bg-[#f6a51a]'
                  : 'h-[6px] w-[6px] rounded-full bg-[#edf1f6]'
              }
              key={index}
            />
          ))}
        </div>

        <button
          className={`mt-[25px] h-[53px] w-full rounded-2xl border-0 bg-[#f5a623] text-[15px] font-bold leading-[23px] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)] ${headingFontClass}`}
          type="button"
          onClick={onSave}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}
