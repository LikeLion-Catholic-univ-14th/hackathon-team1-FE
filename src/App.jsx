import { useState } from 'react'
import Splash from './pages/onboarding/Splash.jsx'
import ProfileSetup from './pages/onboarding/ProfileSetup.jsx'
import SunscreenSetup from './pages/onboarding/SunscreenSetup.jsx'
import './App.css'

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState('profile')

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />
  }

  if (onboardingStep === 'sunscreen') {
    return <SunscreenSetup onBack={() => setOnboardingStep('profile')} />
  }

  return <ProfileSetup onComplete={() => setOnboardingStep('sunscreen')} />
}

export default App
