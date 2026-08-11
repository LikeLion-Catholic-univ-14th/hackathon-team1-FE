import { useMemo, useState } from 'react'
import AppHeader from '../../components/common/AppHeader.jsx'
import BottomNavigation from '../../components/common/BottomNavigation.jsx'
import statusBar from '../onboarding/assets/status-bar.svg'
import GenerateSolutionButton from './components/GenerateSolutionButton.jsx'
import HomeTopSection from './components/HomeTopSection.jsx'
import OutdoorModeCard from './components/OutdoorModeCard.jsx'
import SolutionList from './components/SolutionList.jsx'
import SunscreenSection from './components/SunscreenSection.jsx'
import UvSummaryCard from './components/UvSummaryCard.jsx'
import { mockHomeData } from './mocks/mockHome.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-white max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-hidden text-left font-[Arial,sans-serif] text-[#1d2b44] max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

function HomeOutdoorHeader() {
  return (
    <header className="flex h-[60px] w-full items-center bg-[#284663] px-6">
      <div className="inline-flex items-center gap-[6px]" aria-label="SST">
        <svg
          className="h-[27px] w-[27px]"
          viewBox="0 0 28 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <circle cx="14" cy="14" r="13" fill="#F5A623" />
          <path
            d="M3 14H25M14 1.8C10.7 5.2 9 9.3 9 14C9 18.7 10.7 22.8 14 26.2M14 1.8C17.3 5.2 19 9.3 19 14C19 18.7 17.3 22.8 14 26.2M5.2 7.5H22.8M5.2 20.5H22.8"
            stroke="white"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-[24px] font-[860] leading-none tracking-[-1px] text-[#F5A623]">
          SST.
        </span>
      </div>
    </header>
  )
}

function Home() {
  const data = mockHomeData
  const recommendedSunscreen =
    data.sunscreens.find((sunscreen) => sunscreen.recommended) ?? data.sunscreens[0]

  const [isGraphExpanded, setIsGraphExpanded] = useState(false)
  const [isOutdoor, setIsOutdoor] = useState(false)
  const [selectedSunscreenId, setSelectedSunscreenId] = useState(
    recommendedSunscreen?.id ?? '',
  )
  const [hasManualSelection, setHasManualSelection] = useState(false)
  const [hasGeneratedSolution, setHasGeneratedSolution] = useState(false)

  const selectedSunscreen = useMemo(
    () =>
      data.sunscreens.find((sunscreen) => sunscreen.id === selectedSunscreenId) ??
      recommendedSunscreen,
    [data.sunscreens, recommendedSunscreen, selectedSunscreenId],
  )

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

  const showGenerateButton = hasManualSelection || hasGeneratedSolution
  const selectedProductName = selectedSunscreen?.name ?? '선크림1'

  return (
    <div className={stageClass}>
      <section
        className={`${screenClass} ${isOutdoor ? 'bg-[#284663]' : 'bg-[#f5f7fb]'}`}
      >
        <div className="h-full overflow-x-hidden overflow-y-auto pb-[124px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className={isOutdoor ? 'bg-[#284663]' : 'bg-white'}>
            <img
              className="h-[62px] w-full object-contain"
              src={statusBar}
              alt=""
              aria-hidden="true"
            />
            {isOutdoor ? <HomeOutdoorHeader /> : <AppHeader />}
          </div>

          <HomeTopSection
            user={data.user}
            isOutdoor={isOutdoor}
            onToggleOutdoor={handleToggleOutdoor}
          />

          <main
            className={`px-[14px] pb-[18px] pt-[14px] ${
              isOutdoor ? 'bg-[#284663]' : 'bg-[#F4F6F9]'
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
                  solutions={data.solutions}
                  selectedProductName={selectedProductName}
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
