import { useState } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import Splash from './pages/onboarding/Splash.jsx'
import ProfileSetup from './pages/onboarding/ProfileSetup.jsx'
import ScheduleSetup from './pages/onboarding/ScheduleSetup.jsx'
import SunscreenSetup from './pages/onboarding/SunscreenSetup.jsx'
import MyPage from './pages/mypage/MyPage.jsx'
import SchedulePage from './pages/schedule/SchedulePage.jsx'
import ReportPage from './pages/report/ReportPage.jsx'

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

function OnboardingFlow() {
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

function AppLayout() {
  return <Outlet />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<OnboardingFlow />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/report" element={<ReportPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
