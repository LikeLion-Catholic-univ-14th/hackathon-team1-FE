import { useState } from 'react'
import { airportToCity } from '../utils/schedule.js'

// OCR 추출 결과를 사용자가 확인·수정하는 모달
// 온보딩 ScheduleSetup 의 확인 모달과 같은 역할. 공통화되면 그쪽으로 교체 예정
function ScheduleConfirmModal({ fileName, schedules, onClose, onSave }) {
  const [rows, setRows] = useState(schedules)

  const updateRow = (index, key, value) => {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, [key]: value } : row,
      ),
    )
  }

  return (
    <div className="absolute inset-0 z-20 overflow-y-auto bg-[rgba(29,43,68,0.4)]">
      <div className="flex min-h-full items-center justify-center px-[18px] py-[24px]">
        <div className="w-full rounded-[26px] bg-white px-[22px] pt-[24px] pb-[24px] drop-shadow-[0px_-8px_20px_rgba(29,43,68,0.16)]">
          <div className="flex items-center justify-between pl-[6px]">
            <p className="text-[20px] leading-[22.5px] font-[860] tracking-[-0.72px] text-[#1d2b44]">
              정보가 맞는지 확인해주세요
            </p>

            <button
              type="button"
              className="flex size-[32px] shrink-0 items-center justify-center rounded-full bg-[#f0f2f6] text-[15px] text-[#1d2b44]"
              onClick={onClose}
            >
              ✕
            </button>
          </div>

          {fileName && (
            <p className="pt-[8px] pl-[6px] text-[12px] leading-[18px] text-[#8a9eb8]">
              {fileName}
            </p>
          )}

          <div className="mt-[18px] rounded-[16px] border border-[#eceef2] px-[14px] py-[6px]">
            {rows.map((row, index) => (
              <div
                className="flex items-center gap-[10px] border-b border-[#eceef2] py-[12px] last:border-b-0"
                key={row.id ?? index}
              >
                <input
                  className="w-[52px] rounded-[6px] bg-[#f7f9fc] px-[6px] py-[4px] text-center text-[13px] font-[590] text-[#1d2b44] outline-none"
                  value={row.date ?? ''}
                  maxLength={5}
                  onChange={(event) => updateRow(index, 'date', event.target.value)}
                />

                <input
                  className="w-[52px] rounded-[6px] bg-[#f7f9fc] px-[6px] py-[4px] text-center text-[13px] font-[590] text-[#1d2b44] outline-none"
                  value={row.departureTime ?? ''}
                  maxLength={5}
                  onChange={(event) =>
                    updateRow(index, 'departureTime', event.target.value)
                  }
                />
                <span className="text-[12px] font-[590] text-[#3f8ae1]">
                  {row.departureAirport}
                </span>

                <span className="text-[11px] text-[#8a9eb8]" aria-hidden="true">
                  ✈
                </span>

                <input
                  className="w-[52px] rounded-[6px] bg-[#f7f9fc] px-[6px] py-[4px] text-center text-[13px] font-[590] text-[#1d2b44] outline-none"
                  value={row.arrivalTime ?? ''}
                  maxLength={5}
                  onChange={(event) =>
                    updateRow(index, 'arrivalTime', event.target.value)
                  }
                />
                <span className="text-[12px] font-[590] text-[#3f8ae1]">
                  {row.arrivalAirport}
                </span>
              </div>
            ))}
          </div>

          <p className="pt-[10px] text-center text-[12px] leading-[18px] text-[#8a9eb8]">
            {airportToCity(rows[0]?.arrivalAirport)} 등 {rows.length}건이 인식됐어요
          </p>

          <button
            type="button"
            className="mt-[18px] h-[53px] w-full rounded-[16px] bg-[#f5a623] text-[15px] leading-[22.5px] font-[860] tracking-[-0.4px] text-white drop-shadow-[0px_3px_6px_rgba(245,166,35,0.32)]"
            onClick={() => onSave(rows)}
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  )
}

export default ScheduleConfirmModal
