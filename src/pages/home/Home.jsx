import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNavigation from '../../components/common/BottomNavigation.jsx'
import headerLogoNoBackground from '../../assets/navigation/header-logo-nobackground.svg'
import statusBar from '../onboarding/assets/status-bar.svg'
import GenerateSolutionButton from './components/GenerateSolutionButton.jsx'
import HomeTopSection from './components/HomeTopSection.jsx'
import OutdoorModeCard from './components/OutdoorModeCard.jsx'
import SolutionList from './components/SolutionList.jsx'
import SunscreenSection from './components/SunscreenSection.jsx'
import UvSummaryCard from './components/UvSummaryCard.jsx'
import { getFallbackHomeData, loadHomeData } from './utils/homeData.js'
import { ONBOARDING_SUNSCREEN_UPDATED_EVENT } from '../onboarding/storage/onboardingProfileStorage.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-white max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-hidden text-left font-[SF_Pro] text-[#1d2b44] max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

const buildSunscreenSolutions = (sunscreen, baseSolutions = []) => {
  if (Array.isArray(sunscreen?.solutions) && sunscreen.solutions.length > 0) {
    return sunscreen.solutions
  }

  const productName = sunscreen?.name || '선택한 차단제'
  const type = sunscreen?.type || '차단제'
  const method = sunscreen?.method || sunscreen?.blockingMethod || ''
  const productLabel = `${method} ${type}`.trim() || type

  return [
    {
      ...(baseSolutions[0] ?? {}),
      id: `${sunscreen?.id ?? 'selected'}-solution-before`,
      icon: 'sun',
      timing: '외출 전',
      title: `${productLabel} 도포`,
      description: `${productName}을 얼굴 + 목 뒤 + 귀 + 손등에 충분히 발라주세요.`,
    },
    {
      ...(baseSolutions[1] ?? {}),
      id: `${sunscreen?.id ?? 'selected'}-solution-during`,
      icon: 'plane',
      timing: '외출 중',
      title: `${type} 보충`,
      description: '땀이나 마찰이 생긴 부위는 닦아낸 뒤 다시 발라주세요.',
    },
    {
      ...(baseSolutions[2] ?? {}),
      id: `${sunscreen?.id ?? 'selected'}-solution-after`,
      icon: 'moon',
      timing: '복귀 후',
      title: '클렌징 + 진정',
      description: `${productName} 사용 후 더블 클렌징과 수분 진정을 해주세요.`,
    },
  ]
}

const getRecommendedSunscreens = (sunscreens) => {
  const source = Array.isArray(sunscreens) ? sunscreens : []
  const recommended = source.filter((sunscreen) => sunscreen.recommended)

  return recommended.length > 0 ? recommended : source.slice(0, 1)
}

const getTodayBaseSolutions = (data) => {
  const solutionDays = Array.isArray(data.solutionDays) ? data.solutionDays : []
  const todaySolutionDay =
    solutionDays.find((day) => day.isToday || day.offset === 0) ?? solutionDays[0]

  if (Array.isArray(todaySolutionDay?.solutions) && todaySolutionDay.solutions.length > 0) {
    return todaySolutionDay.solutions
  }

  return Array.isArray(data.solutions) ? data.solutions : []
}

function HomeHeader({ isOutdoor }) {
  return (
    <header className={`h-[69px] w-full ${isOutdoor ? 'bg-[#284663]' : 'bg-white'}`}>
      <img
        className="h-[69px] w-full object-cover"
        src={headerLogoNoBackground}
        alt="SST"
      />
    </header>
  )
}

function Home() {
  const navigate = useNavigate()
  const [data, setData] = useState(() => getFallbackHomeData())
  const sunscreens = Array.isArray(data.sunscreens) ? data.sunscreens : []
  const hasRegisteredSunscreens = sunscreens.length > 0
  const recommendedSunscreens = useMemo(
    () => getRecommendedSunscreens(sunscreens),
    [sunscreens],
  )
  const recommendedSunscreen = recommendedSunscreens[0]
  const recommendedSunscreenIds = recommendedSunscreens
    .map((sunscreen) => sunscreen.id)
    .join('|')
  const sunscreenIds = sunscreens.map((sunscreen) => sunscreen.id).join('|')

  const [isGraphExpanded, setIsGraphExpanded] = useState(false)
  const [isOutdoor, setIsOutdoor] = useState(false)
  const [selectedSunscreenId, setSelectedSunscreenId] = useState(
    recommendedSunscreen?.id ?? '',
  )
  const [solutionProductIds, setSolutionProductIds] = useState(
    recommendedSunscreen?.id ? [recommendedSunscreen.id] : [],
  )
  const [solutionProductIndex, setSolutionProductIndex] = useState(0)

  useEffect(() => {
    let ignore = false

    const applyHomeData = (nextData) => {
      if (ignore) {
        return
      }

      setData(nextData)
      setSelectedSunscreenId((currentId) => {
        const nextSunscreens = Array.isArray(nextData.sunscreens)
          ? nextData.sunscreens
          : []
        const nextRecommendedSunscreens = getRecommendedSunscreens(nextSunscreens)
        const hasCurrentSunscreen = nextSunscreens.some(
          (sunscreen) => sunscreen.id === currentId,
        )

        if (hasCurrentSunscreen) {
          return currentId
        }

        const nextRecommended = nextRecommendedSunscreens[0] ?? nextSunscreens[0]

        return nextRecommended?.id ?? ''
      })
    }

    const refreshHomeData = () => {
      loadHomeData().then(applyHomeData)
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshHomeData()
      }
    }

    refreshHomeData()
    window.addEventListener(ONBOARDING_SUNSCREEN_UPDATED_EVENT, refreshHomeData)
    window.addEventListener('focus', refreshHomeData)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      ignore = true
      window.removeEventListener(ONBOARDING_SUNSCREEN_UPDATED_EVENT, refreshHomeData)
      window.removeEventListener('focus', refreshHomeData)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  useEffect(() => {
    const defaultProductId = recommendedSunscreen?.id ?? ''

    setSolutionProductIds((currentIds) => {
      if (!defaultProductId) {
        return []
      }

      const allowedIds = new Set(sunscreens.map((sunscreen) => sunscreen.id))
      const generatedIds = currentIds.filter(
        (productId) => productId !== defaultProductId && allowedIds.has(productId),
      )

      return [defaultProductId, ...generatedIds]
    })
  }, [recommendedSunscreen?.id, recommendedSunscreenIds, sunscreenIds, sunscreens])

  useEffect(() => {
    setSolutionProductIndex((currentIndex) =>
      Math.min(currentIndex, Math.max(solutionProductIds.length - 1, 0)),
    )
  }, [solutionProductIds.length])

  const selectedSunscreen = useMemo(
    () =>
      sunscreens.find((sunscreen) => sunscreen.id === selectedSunscreenId) ??
      recommendedSunscreen,
    [recommendedSunscreen, selectedSunscreenId, sunscreens],
  )
  const currentSolutionProductId =
    solutionProductIds[solutionProductIndex] ?? recommendedSunscreen?.id ?? ''
  const currentSolutionSunscreen = useMemo(
    () =>
      sunscreens.find((sunscreen) => sunscreen.id === currentSolutionProductId) ??
      recommendedSunscreen,
    [currentSolutionProductId, recommendedSunscreen, sunscreens],
  )
  const todayBaseSolutions = useMemo(() => getTodayBaseSolutions(data), [data])

  const handleSelectSunscreen = (sunscreenId) => {
    setSelectedSunscreenId(sunscreenId)

    const existingSolutionIndex = solutionProductIds.indexOf(sunscreenId)

    if (existingSolutionIndex >= 0) {
      setSolutionProductIndex(existingSolutionIndex)
    }
  }

  const handleGenerateSolution = () => {
    const targetProductId = selectedSunscreen?.id ?? recommendedSunscreen?.id ?? ''

    if (!targetProductId) {
      return
    }

    setSolutionProductIds((currentIds) => {
      const existingProductIndex = currentIds.indexOf(targetProductId)

      if (existingProductIndex >= 0) {
        setSolutionProductIndex(existingProductIndex)
        return currentIds
      }

      const defaultProductId = recommendedSunscreen?.id ?? targetProductId
      const nextIds =
        targetProductId === defaultProductId
          ? [
              defaultProductId,
              ...currentIds.filter((productId) => productId !== defaultProductId),
            ]
          : [
              defaultProductId,
              ...currentIds.filter(
                (productId) =>
                  productId !== defaultProductId && productId !== targetProductId,
              ),
              targetProductId,
            ]

      setSolutionProductIndex(Math.max(nextIds.length - 1, 0))

      return nextIds
    })
  }

  const handleToggleOutdoor = () => {
    setIsOutdoor((prevOutdoor) => !prevOutdoor)
    setIsGraphExpanded(false)
  }

  const handleRegisterSunscreen = () => {
    navigate('/mypage/pouch-edit')
  }

  const handleRegisterSchedule = () => {
    navigate('/schedule/register')
  }

  const canNavigateSolutions = solutionProductIds.length > 1
  const canGoPreviousSolution = solutionProductIndex > 0
  const canGoNextSolution =
    solutionProductIndex < Math.max(solutionProductIds.length - 1, 0)

  const goToPreviousSolution = () => {
    if (!canGoPreviousSolution) {
      return
    }

    setSolutionProductIndex((currentIndex) =>
      Math.max(0, currentIndex - 1),
    )
  }

  const goToNextSolution = () => {
    if (!canGoNextSolution) {
      return
    }

    setSolutionProductIndex((currentIndex) =>
      Math.min(solutionProductIds.length - 1, currentIndex + 1),
    )
  }

  const showGenerateButton =
    Boolean(selectedSunscreen?.id) &&
    !solutionProductIds.includes(selectedSunscreen.id)
  const displayedSolutions = currentSolutionSunscreen
    ? buildSunscreenSolutions(currentSolutionSunscreen, todayBaseSolutions)
    : todayBaseSolutions
  const selectedProductName = currentSolutionSunscreen?.name || '선크림1'

  return (
    <div className={stageClass}>
      <section
        className={`${screenClass} ${isOutdoor ? 'bg-[#284663]' : 'bg-[#f5f7fb]'}`}
      >
        <div className="flex h-full flex-col overflow-x-hidden overflow-y-auto pb-[124px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className={isOutdoor ? 'bg-[#284663]' : 'bg-white'}>
            <img
              className="h-[62px] w-full object-contain"
              src={statusBar}
              alt=""
              aria-hidden="true"
            />
            <HomeHeader isOutdoor={isOutdoor} />
          </div>

          <HomeTopSection
            user={data.user}
            isOutdoor={isOutdoor}
            onToggleOutdoor={handleToggleOutdoor}
          />

          <main
            className={`flex-1 px-[14px] pb-[18px] pt-[14px] ${
              isOutdoor ? 'bg-[#2E4865]' : 'bg-[#F4F6F9]'
            }`}
          >
            <UvSummaryCard
              summary={data.uvSummary}
              graph={data.uvGraph}
              expanded={isGraphExpanded}
              isOutdoor={isOutdoor}
              empty={!hasRegisteredSunscreens}
              onRegisterSchedule={handleRegisterSchedule}
              onRegisterSunscreen={handleRegisterSunscreen}
              onToggleGraph={() => setIsGraphExpanded((prevExpanded) => !prevExpanded)}
            />

            {!hasRegisteredSunscreens ? (
              <>
                <SunscreenSection
                  sunscreens={[]}
                  tip={data.sunscreenTip}
                  selectedId=""
                  onSelect={handleSelectSunscreen}
                  empty
                  onRegisterSunscreen={handleRegisterSunscreen}
                />

                <SolutionList
                  solutions={[]}
                  title="오늘의 솔루션"
                  selectedProductName=""
                  onPrevious={goToPreviousSolution}
                  onNext={goToNextSolution}
                  empty
                  onRegisterSunscreen={handleRegisterSunscreen}
                  canNavigate={false}
                  canGoPrevious={false}
                  canGoNext={false}
                />
              </>
            ) : isOutdoor ? (
              <OutdoorModeCard data={data.outdoor} />
            ) : (
              <>
                <SunscreenSection
                  sunscreens={sunscreens}
                  tip={data.sunscreenTip}
                  selectedId={selectedSunscreenId}
                  onSelect={handleSelectSunscreen}
                />

                <GenerateSolutionButton
                  visible={showGenerateButton}
                  onClick={handleGenerateSolution}
                />

                <SolutionList
                  solutions={displayedSolutions}
                  title="오늘의 솔루션"
                  selectedProductName={selectedProductName}
                  onPrevious={goToPreviousSolution}
                  onNext={goToNextSolution}
                  canNavigate={canNavigateSolutions}
                  canGoPrevious={canGoPreviousSolution}
                  canGoNext={canGoNextSolution}
                />
              </>
            )}
          </main>
        </div>

        <BottomNavigation />
      </section>
    </div>
  )
}

export default Home
