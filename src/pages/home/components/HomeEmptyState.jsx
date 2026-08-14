import moreHorizontalIcon from '../../../assets/icons/more-horizontal.svg'
import { headingFontClass } from './homeStyles.js'

function HomeEmptyState({
  actionLabel = '차단제 등록하러 가기',
  message = '아직 등록된 차단제가 없어요',
  onRegister,
  tone = 'light',
}) {
  const isOnColor = tone === 'onColor'

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <img
        className={`h-[4px] w-[18px] object-contain ${isOnColor ? 'brightness-0 invert' : ''}`}
        src={moreHorizontalIcon}
        alt=""
        aria-hidden="true"
      />
      <p
        className={`m-0 mt-[14px] text-[15px] font-normal leading-[21px] tracking-[-0.64px] ${headingFontClass} ${
          isOnColor ? 'text-white' : 'text-[#8A9EB8]'
        }`}
      >
        {message}
      </p>
      <button
        className={`mt-[10px] border-0 bg-transparent p-0 text-[12px] font-normal leading-[18px] tracking-[-0.64px] underline ${headingFontClass} ${
          isOnColor ? 'text-white' : 'text-[#8A9EB8]'
        }`}
        type="button"
        onClick={onRegister}
      >
        {actionLabel}
      </button>
    </div>
  )
}

export default HomeEmptyState
