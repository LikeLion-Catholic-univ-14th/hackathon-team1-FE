import appHeaderLogo from '../../assets/navigation/app-header-logo.svg'

function AppHeader({ className = '' }) {
  return (
    <header className={`h-[60px] w-full bg-white ${className}`}>
      <img
        className="h-[60px] w-full object-cover"
        src={appHeaderLogo}
        alt="SST"
      />
    </header>
  )
}

export default AppHeader
