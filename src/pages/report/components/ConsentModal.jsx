const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

const TERMS = [
  { label: '제공받는 자', value: '회원이 선택한 제휴 피부과 1개소' },
  { label: '제  공  목  적', value: '누적 자외선 노출량 기반 상담 및 월간 리포트 발급' },
  {
    label: '제  공  항  목',
    value:
      '비식별 회원 ID / 운항 스케줄( 출도착지·일자) / 노선별 UV Index 추정 /\n월 누적 노출 지수(UVI·h)',
  },
  { label: '미제공항목', value: '성명·연락처, 얼굴 사진, 사번 원본, 개인 일정, 건강검진 기록' },
  { label: '보  유  기  간', value: '보유·제공일로부터 1년 또는 동의 철회 시까지 기간' },
]

function ConsentModal({ onAgree, onCancel }) {
  return (
    <div className="absolute inset-0 z-10 overflow-y-auto bg-[rgba(29,43,68,0.4)]">
      <div className="flex min-h-full items-center justify-center px-[20px] py-[24px]">
        <div
          className={`w-full overflow-hidden rounded-[16px] bg-white shadow-[0px_20px_60px_0px_rgba(29,43,68,0.22)] ${headingFontClass}`}
        >
          <div className="flex flex-col items-center bg-[#1d2b44] px-[22px] pt-[20px] pb-[15px]">
            <p className="w-full text-[15px] leading-[22.5px] font-[1000] tracking-[-0.64px] text-white">
              개인정보 제3자 제공 동의
            </p>
            <p className="w-full pt-[4px] text-[12px] leading-[18px] tracking-[-0.64px] text-white/50">
              리포트를 열람하려면 필요해요.
            </p>
          </div>

          <div className="flex flex-col gap-[16px] px-[22px] pt-[20px] pb-[12px]">
            <div className="rounded-[12px] border-2 border-[#ffedcc] bg-[#fffaf2] px-[16px] py-[12px]">
              <p className="text-center text-[13px] leading-[22.1px] font-[590] tracking-[-1px] text-[#734e10]">
                AAC 운항 데이터 연동 고지
              </p>
              <p className="pt-[4px] text-[11px] leading-[16px] tracking-[-1px] text-[#734e10]">
                본 서비스는 AAC로부터 회원의 운항 스케줄 데이터를 API로 제공받아 자외선
                노출량을 산출합니다. AAC는 회원의 피부 상태·상담 및 리포트 내용을 열람할 수
                없습니다.
              </p>
            </div>

            <div className="flex justify-center">
              <div className="border-y border-[#8a9eb8]/25 px-[3px] text-[9px] leading-[22.1px] tracking-[-1px] text-[#1d2b44]">
                {TERMS.map((term, index) => (
                  <div
                    className={`flex gap-x-[12px] ${
                      index === TERMS.length - 1 ? '' : 'border-b border-[#8a9eb8]/15'
                    }`}
                    key={term.label}
                  >
                    <span className="shrink-0 self-center text-center whitespace-nowrap">
                      {term.label}
                    </span>
                    <span className="self-center whitespace-pre-line">{term.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-[8px]">
              <div>
                <button
                  type="button"
                  className="h-[52.5px] w-full rounded-[12px] bg-[#f5a623] text-[15px] leading-[22.5px] font-[860] tracking-[-0.4px] text-white drop-shadow-[0px_3px_6px_rgba(245,166,35,0.32)]"
                  onClick={onAgree}
                >
                  동의하고 리포트 보기
                </button>

                <button
                  type="button"
                  className="h-[37px] w-full text-[14px] leading-[21px] tracking-[-0.64px] text-[#8a9eb8]"
                  onClick={onCancel}
                >
                  취소
                </button>
              </div>

              <p className="px-[10px] pt-[4px] pb-[10px] text-center text-[11px] leading-[16px] font-[274] tracking-[-1px] text-[rgba(29,43,68,0.5)]">
                동의를 거부할 권리가 있으며, 거부 시 클리닉 리포트 열람 기능만 제한되고 앱의
                자외선 예보·관리 기능은 그대로 이용할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsentModal