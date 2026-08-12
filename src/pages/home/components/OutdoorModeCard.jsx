import chargingIcon from '../assets/icons/charging.svg'
import { headingFontClass } from './homeStyles.js'

function OutdoorModeCard({ data }) {
  return (
    <section className="mt-[12px] rounded-[16px] bg-[#f5f7fb] px-[26px] py-[30px] text-center shadow-[0_4px_18px_0_rgba(29,43,68,0.12)]">
      <img className="mx-auto h-[56px] w-[56px] object-contain" src={chargingIcon} alt="" aria-hidden="true" />
      <h2
        className={`m-0 mt-[18px] text-[15px] font-bold leading-[22px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
      >
        {data.title}
      </h2>
      <p
        className={`m-0 mt-[17px] whitespace-pre-line text-[11px] font-[510] leading-[17px] tracking-[-0.4px] text-[#8a9eb8] ${headingFontClass}`}
      >
        {data.description}
      </p>
    </section>
  )
}

export default OutdoorModeCard
