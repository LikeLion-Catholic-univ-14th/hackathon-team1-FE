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
  const recommendedSunscreen =
    sunscreens.find((sunscreen) => sunscreen.recommended) ?? sunscreens[0]
  const initialSolutionDayIndex = Math.max(
    data.solutionDays.findIndex((day) => day.isToday || day.offset === 0),
    0,
  )

  const [isGraphExpanded, setIsGraphExpanded] = useState(false)
  const [isOutdoor, setIsOutdoor] = useState(false)
  const [selectedSunscreenId, setSelectedSunscreenId] = useState(
    recommendedSunscreen?.id ?? '',
  )
  const [appliedSunscreenId, setAppliedSunscreenId] = useState(
    recommendedSunscreen?.id ?? '',
  )
  const [solutionDayIndex, setSolutionDayIndex] = useState(initialSolutionDayIndex)

  useEffect(() => {
    let ignore = false

    loadHomeData().then((nextData) => {
      if (ignore) {
        return
      }

      setData(nextData)
      setSolutionDayIndex(
        Math.max(
          nextData.solutionDays.findIndex((day) => day.isToday || day.offset === 0),
          0,
        ),
      )
      setSelectedSunscreenId((currentId) => {
        const nextSunscreens = Array.isArray(nextData.sunscreens)
          ? nextData.sunscreens
          : []
        const hasCurrentSunscreen = nextSunscreens.some(
          (sunscreen) => sunscreen.id === currentId,
        )

        if (hasCurrentSunscreen) {
          return currentId
        }

        const nextRecommended =
          nextSunscreens.find((sunscreen) => sunscreen.recommended) ??
          nextSunscreens[0]

        return nextRecommended?.id ?? ''
      })
      setAppliedSunscreenId((currentId) => {
        const nextSunscreens = Array.isArray(nextData.sunscreens)
          ? nextData.sunscreens
          : []
        const hasCurrentSunscreen = nextSunscreens.some(
          (sunscreen) => sunscreen.id === currentId,
        )

        if (hasCurrentSunscreen) {
          return currentId
        }

        const nextRecommended =
          nextSunscreens.find((sunscreen) => sunscreen.recommended) ??
          nextSunscreens[0]

        return nextRecommended?.id ?? ''
      })
    })

    return () => {
      ignore = true
    }
  }, [])

  const selectedSunscreen = useMemo(
    () =>
      sunscreens.find((sunscreen) => sunscreen.id === selectedSunscreenId) ??
      recommendedSunscreen,
    [recommendedSunscreen, selectedSunscreenId, sunscreens],
  )
  const appliedSunscreen = useMemo(
    () =>
      sunscreens.find((sunscreen) => sunscreen.id === appliedSunscreenId) ??
      recommendedSunscreen,
    [appliedSunscreenId, recommendedSunscreen, sunscreens],
  )

  const solutionDays =
    Array.isArray(data.solutionDays) && data.solutionDays.length > 0
      ? data.solutionDays
      : [
          {
            id: 'solution-day-today',
            title: '오늘의 솔루션',
            offset: 0,
            isToday: true,
            solutions: data.solutions,
          },
        ]
  const currentSolutionDay =
    solutionDays[solutionDayIndex] ?? solutionDays[0]

  const handleSelectSunscreen = (sunscreenId) => {
    setSelectedSunscreenId(sunscreenId)

    if (sunscreenId === recommendedSunscreen?.id) {
      setAppliedSunscreenId(sunscreenId)
    }
  }

  const handleGenerateSolution = () => {
    setAppliedSunscreenId(selectedSunscreen?.id ?? recommendedSunscreen?.id ?? '')
  }

  const handleToggleOutdoor = () => {
    setIsOutdoor((prevOutdoor) => !prevOutdoor)
    setIsGraphExpanded(false)
  }

  const handleRegisterSunscreen = () => {
    navigate('/mypage/pouch-edit')
  }

  const handleRegisterSchedule = () => {
    navigate('/schedule')
  }

  const goToPreviousSolutionDay = () => {
    setSolutionDayIndex((currentIndex) =>
      currentIndex === 0 ? solutionDays.length - 1 : currentIndex - 1,
    )
  }

  const goToNextSolutionDay = () => {
    setSolutionDayIndex((currentIndex) =>
      currentIndex === solutionDays.length - 1 ? 0 : currentIndex + 1,
    )
  }

  const isDefaultRecommendedSolution =
    !appliedSunscreen?.id || appliedSunscreen.id === recommendedSunscreen?.id
  const showGenerateButton =
    Boolean(selectedSunscreen?.id) && selectedSunscreen.id !== recommendedSunscreen?.id
  const displayedSolutions = isDefaultRecommendedSolution
    ? currentSolutionDay.solutions
    : buildSunscreenSolutions(appliedSunscreen, currentSolutionDay.solutions)
  const selectedProductName =
    isDefaultRecommendedSolution
      ? currentSolutionDay.selectedProductName ||
        recommendedSunscreen?.name ||
        appliedSunscreen?.name ||
        '선크림1'
      : appliedSunscreen?.name || '선크림1'

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
                  onPrevious={goToPreviousSolutionDay}
                  onNext={goToNextSolutionDay}
                  empty
                  onRegisterSunscreen={handleRegisterSunscreen}
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
                  title={currentSolutionDay.title}
                  selectedProductName={selectedProductName}
                  onPrevious={goToPreviousSolutionDay}
                  onNext={goToNextSolutionDay}
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
