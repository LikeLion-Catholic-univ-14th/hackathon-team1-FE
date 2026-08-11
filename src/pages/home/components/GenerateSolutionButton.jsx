import { headingFontClass } from './homeStyles.js'

function GenerateSolutionButton({ visible, onClick }) {
  if (!visible) {
    return null
  }

  return (
    <button
      className={`mt-[10px] flex h-[53px] w-full items-center justify-center rounded-[16px] border-0 bg-[#F5A623] px-[15px] text-[15px] font-bold leading-[23px] tracking-[-0.64px] text-white shadow-[0_4px_12px_0_rgba(245,166,35,0.32)] ${headingFontClass}`}
      type="button"
      onClick={onClick}
    >
      선택한 차단제로 솔루션 생성
    </button>
  )
}

export default GenerateSolutionButton
