import { useState } from 'react'
import Splash from './pages/onboarding/Splash.jsx'
import ProfileSetup from './pages/onboarding/ProfileSetup.jsx'
import ScheduleSetup from './pages/onboarding/ScheduleSetup.jsx'
import SunscreenSetup from './pages/onboarding/SunscreenSetup.jsx'

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
  schedule: {
    files: [],
    schedules: [],
  },
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
        onComplete={() => setOnboardingStep('schedule')}
      />
    )
  }

  if (onboardingStep === 'schedule') {
    return (
      <ScheduleSetup
        value={onboardingData.schedule}
        onChange={(schedule) => updateOnboardingData('schedule', schedule)}
        onBack={() => setOnboardingStep('sunscreen')}
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
