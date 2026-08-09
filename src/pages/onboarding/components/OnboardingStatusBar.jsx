import statusBarImage from '../assets/status-bar.svg'

function OnboardingStatusBar() {
  return (
    <div
      className="flex h-[62px] w-full items-center justify-center bg-[#f5f7fb]"
      aria-hidden="true"
    >
      <img
        className="block h-[62px] w-[402px] max-w-full object-contain"
        src={statusBarImage}
        alt=""
      />
    </div>
  )
}

export default OnboardingStatusBar
