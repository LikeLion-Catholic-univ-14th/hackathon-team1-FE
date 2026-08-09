import statusBarImage from '../assets/status-bar-iphone.png'

function OnboardingStatusBar() {
  return (
    <div className="onboarding-status" aria-hidden="true">
      <img src={statusBarImage} alt="" />
    </div>
  )
}

export default OnboardingStatusBar
