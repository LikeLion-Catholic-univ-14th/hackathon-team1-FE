// 서버에서 데이터를 못 가져왔을 때 보여주는 화면.
// 목데이터로 가리지 않고 실패를 그대로 드러낸다.
function LoadFailed({ message = '데이터를 불러오지 못했어요', onRetry }) {
  return (
    <div className="flex flex-col items-center gap-[14px] px-[20px] py-[80px] text-center">
      <p
        className="text-[24px] leading-none text-[#c4cad4]"
        aria-hidden="true"
      >
        ⋯
      </p>

      <p className="text-[15px] leading-[22px] font-[590] tracking-[-0.64px] text-[#3a506b]">
        {message}
      </p>

      <p className="text-[13px] leading-[19.5px] tracking-[-0.64px] text-[#8a9eb8]">
        네트워크 상태를 확인하고 다시 시도해주세요
      </p>

      {onRetry && (
        <button
          type="button"
          className="mt-[6px] rounded-[10px] bg-[#f0f2f6] px-[18px] py-[9px] text-[13px] leading-[19.5px] font-[590] tracking-[-0.64px] text-[#3a506b]"
          onClick={onRetry}
        >
          다시 시도
        </button>
      )}
    </div>
  )
}

export default LoadFailed
