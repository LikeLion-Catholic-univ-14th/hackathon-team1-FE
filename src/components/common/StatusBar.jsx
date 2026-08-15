import { useEffect, useState } from 'react'
import cellularIcon from '../../assets/status-bar/cellular.svg'
import wifiIcon from '../../assets/status-bar/wifi.svg'
import batteryIcon from '../../assets/status-bar/battery.svg'

// Figma: 246:12543 "Status bar - iPhone" (402 x 62)
//   컨테이너  px 24 / pt 21 / pb 19 / 좌우 묶음 사이 gap 154
//   시각      SF Pro 590, 17px, leading 22px, 검정
//   아이콘    셀룰러 19.2x12.226 · 와이파이 17.142x12.328 · 배터리 27.328x13, 간격 7px

const timeFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

// 9:41 처럼 앞자리 0 없이
const readNow = () => {
  const now = new Date()
  return `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`
}

function StatusBar({ time }) {
  const [now, setNow] = useState(readNow)

  useEffect(() => {
    // time 을 직접 넘기면 고정값을 쓰고 시계는 돌리지 않는다
    if (time) {
      return
    }

    // 분이 바뀌는 순간에 맞춰 첫 갱신을 걸고, 그 뒤로는 1분마다
    const msToNextMinute = 60000 - (Date.now() % 60000)
    let intervalId = null

    const timeoutId = setTimeout(() => {
      setNow(readNow())
      intervalId = setInterval(() => setNow(readNow()), 60000)
    }, msToNextMinute)

    return () => {
      clearTimeout(timeoutId)

      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [time])

  return (
    <div className="flex h-[62px] w-full shrink-0 items-center justify-center gap-[154px] bg-white px-[24px] pt-[21px] pb-[19px]">
      <div className="flex h-[22px] min-w-px flex-1 items-center justify-center pt-[1.5px]">
        <p
          className={`${timeFontClass} text-center text-[17px] leading-[22px] font-[590] whitespace-nowrap text-black`}
          style={{ fontVariationSettings: '"wdth" 100' }}
        >
          {time ?? now}
        </p>
      </div>

      <div className="flex h-[22px] min-w-px flex-1 items-center justify-center gap-[7px] pt-px pr-px">
        <img
          className="h-[12.226px] w-[19.2px] shrink-0"
          src={cellularIcon}
          alt=""
        />
        <img
          className="h-[12.328px] w-[17.142px] shrink-0"
          src={wifiIcon}
          alt=""
        />
        <img
          className="h-[13px] w-[27.328px] shrink-0"
          src={batteryIcon}
          alt=""
        />
      </div>
    </div>
  )
}

export default StatusBar
