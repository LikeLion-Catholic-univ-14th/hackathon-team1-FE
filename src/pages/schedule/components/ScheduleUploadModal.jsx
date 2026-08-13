import { useRef, useState } from 'react'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

function ScheduleUploadModal({ onClose, onUpload }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)

  const handleFileChange = (event) => {
    const selected = event.target.files[0]

    if (selected) {
      setFile(selected)
    }
  }

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-[rgba(29,43,68,0.4)] px-[18px]">
      <div
        className={`w-full rounded-[26px] bg-white px-[22px] pt-[24px] pb-[44px] drop-shadow-[0px_-8px_20px_rgba(29,43,68,0.16)] ${headingFontClass}`}
      >
        <div className="flex items-center justify-between pl-[6px]">
          <p className="text-[20px] leading-[22.5px] font-[860] tracking-[-0.72px] text-[#1d2b44]">
            비행 일정 등록하기
          </p>

          <button
            type="button"
            className="flex size-[32px] items-center justify-center rounded-full bg-[#f0f2f6] text-[15px] leading-[22.5px] tracking-[-0.64px] text-[#1d2b44]"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col items-center pt-[22px] pb-[14px]">
          <label className="flex w-full cursor-pointer flex-col items-center rounded-[18px] border-[1.276px] border-dashed border-[#c5deff] bg-[#e8f3ff] px-[17.276px] py-[33.276px]">
            <span className="flex size-[52px] items-center justify-center rounded-full bg-white text-[24px] leading-[36px] tracking-[-0.64px] text-[#1d2b44] drop-shadow-[0px_4px_7px_rgba(92,156,230,0.2)]">
              +
            </span>

            <span className="pt-[12px] text-center text-[14px] leading-[21px] font-bold tracking-[-0.64px] text-[#1d2b44]">
              {file ? file.name : '파일이나 사진을 업로드해주세요'}
            </span>

            <span className="pt-[6px] text-center text-[12px] leading-[20.4px] tracking-[-0.64px] text-[#8a9eb8]">
              파일용량 10MB 제한
            </span>

            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              onChange={handleFileChange}
              hidden
            />
          </label>
        </div>

        <button
          type="button"
          disabled={!file}
          className="h-[53px] w-full rounded-[16px] bg-[#f5a623] text-[15px] leading-[22.5px] font-[860] tracking-[-0.4px] text-white disabled:bg-[#f0f2f6] disabled:text-[#8a9eb8]"
          onClick={() => onUpload(file)}
        >
          업로드
        </button>
      </div>
    </div>
  )
}

export default ScheduleUploadModal