import appHeaderLogo from '../../assets/navigation/app-header-logo.svg'

function AppHeader() {
  return (
    <img
      className="block h-[60px] w-full border-b border-[#eceef2]"
      src={appHeaderLogo}
      alt="SST"
    />
  )
}

export default AppHeader