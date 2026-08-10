import logo from '../../assets/logo/logo.svg'

function AppHeader() {
  return (
    <div className="flex items-center border-b border-[#eceef2] bg-white px-[24px] py-[16px]">
      <img className="size-[36px]" src={logo} alt="SST" />
      <p className="ml-[4px] font-[860] text-[#f5a623]">
        <span className="text-[30px] leading-[18px] tracking-[-4px]">SS </span>
        <span className="text-[30px] leading-[18px] tracking-[2px]">T.</span>
      </p>
    </div>
  )
}

export default AppHeader