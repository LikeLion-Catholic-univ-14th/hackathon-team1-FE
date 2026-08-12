import chargingIcon from '../assets/icons/charging.svg'
import { headingFontClass } from './homeStyles.js'

function OutdoorModeCard({ data }) {
  return (
    <section className="mt-[12px] rounded-[16px] bg-[#f5f7fb] px-[26px] py-[30px] text-center shadow-[0_4px_18px_0_rgba(29,43,68,0.12)]">
      <img className="mx-auto h-[56px] w-[56px] object-contain" src={chargingIcon} alt="" aria-hidden="true" />
      <h2
        className={`m-0 mt-[18px] text-center text-[18px] font-bold leading-[25.2px] tracking-[-0.64px] text-[#1D2B44] ${headingFontClass}`}
      >
        {data.title}
      </h2>
      <p className="m-0 mt-[17px] whitespace-pre-line text-center font-[Arial] text-[14px] font-normal leading-[22.4px] tracking-[-0.64px] text-[#6C757D]">
        {data.description}
      </p>
    </section>
  )
}

export default OutdoorModeCard
