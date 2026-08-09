import { useState } from 'react'
import Splash from './pages/onboarding/Splash.jsx'
import ProfileSetup from './pages/onboarding/ProfileSetup.jsx'
import SunscreenSetup from './pages/onboarding/SunscreenSetup.jsx'
import './App.css'

const initialOnboardingData = {
  profile: {
    name: '',
    baseAirport: '',
    skinType: '',
    skinConcerns: [],
    treatmentHistory: '',
    treatmentDetail: '',
    recentTreatment: false,
  },
  sunscreen: {
    form: {
      productName: '',
      type: '선크림',
      blockingMethod: '유기자차',
      spf: '',
      pa: 'PA+',
    },
    products: [],
  },
  schedule: {},
}

function App() {
  const [showSplash, setShowSplash] = useState(true)
  const [onboardingStep, setOnboardingStep] = useState('profile')
  const [onboardingData, setOnboardingData] = useState(initialOnboardingData)

  const updateOnboardingData = (section, value) => {
    setOnboardingData((prevData) => ({
      ...prevData,
      [section]: value,
    }))
  }

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />
  }

  if (onboardingStep === 'sunscreen') {
    return (
      <SunscreenSetup
        value={onboardingData.sunscreen}
        onChange={(sunscreen) => updateOnboardingData('sunscreen', sunscreen)}
        onBack={() => setOnboardingStep('profile')}
      />
    )
  }

  return (
    <ProfileSetup
      value={onboardingData.profile}
      onChange={(profile) => updateOnboardingData('profile', profile)}
      onComplete={() => setOnboardingStep('sunscreen')}
    />
  )
}

export default App
