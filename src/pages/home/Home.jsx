import { useEffect, useMemo, useState } from 'react'
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
  const [data, setData] = useState(() => getFallbackHomeData())
  const recommendedSunscreen =
    data.sunscreens.find((sunscreen) => sunscreen.recommended) ?? data.sunscreens[0]
  const initialSolutionDayIndex = Math.max(
    data.solutionDays.findIndex((day) => day.isToday || day.offset === 0),
    0,
  )

  const [isGraphExpanded, setIsGraphExpanded] = useState(false)
  const [isOutdoor, setIsOutdoor] = useState(false)
  const [selectedSunscreenId, setSelectedSunscreenId] = useState(
    recommendedSunscreen?.id ?? '',
  )
  const [solutionDayIndex, setSolutionDayIndex] = useState(initialSolutionDayIndex)
  const [hasManualSelection, setHasManualSelection] = useState(false)
  const [hasGeneratedSolution, setHasGeneratedSolution] = useState(false)

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
        const hasCurrentSunscreen = nextData.sunscreens.some(
          (sunscreen) => sunscreen.id === currentId,
        )

        if (hasCurrentSunscreen) {
          return currentId
        }

        const nextRecommended =
          nextData.sunscreens.find((sunscreen) => sunscreen.recommended) ??
          nextData.sunscreens[0]

        return nextRecommended?.id ?? ''
      })
    })

    return () => {
      ignore = true
    }
  }, [])

  const selectedSunscreen = useMemo(
    () =>
      data.sunscreens.find((sunscreen) => sunscreen.id === selectedSunscreenId) ??
      recommendedSunscreen,
    [data.sunscreens, recommendedSunscreen, selectedSunscreenId],
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
    setHasManualSelection(true)
    setHasGeneratedSolution(false)
  }

  const handleGenerateSolution = () => {
    setHasGeneratedSolution(true)
  }

  const handleToggleOutdoor = () => {
    setIsOutdoor((prevOutdoor) => !prevOutdoor)
    setIsGraphExpanded(false)
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

  const showGenerateButton = hasManualSelection || hasGeneratedSolution
  const selectedProductName =
    currentSolutionDay.selectedProductName || selectedSunscreen?.name || '선크림1'

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
              onToggleGraph={() => setIsGraphExpanded((prevExpanded) => !prevExpanded)}
            />

            {isOutdoor ? (
              <OutdoorModeCard data={data.outdoor} />
            ) : (
              <>
                <SunscreenSection
                  sunscreens={data.sunscreens}
                  tip={data.sunscreenTip}
                  selectedId={selectedSunscreenId}
                  onSelect={handleSelectSunscreen}
                />

                <GenerateSolutionButton
                  visible={showGenerateButton}
                  onClick={handleGenerateSolution}
                />

                <SolutionList
                  solutions={currentSolutionDay.solutions}
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
