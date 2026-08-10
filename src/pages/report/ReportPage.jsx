import { useEffect, useState } from 'react'
import TotalCard from './components/TotalCard.jsx'
import RouteRanking from './components/RouteRanking.jsx'
import InsightList from './components/InsightList.jsx'
import NextMonthCard from './components/NextMonthCard.jsx'
import { mockMonthlyReport } from './mocks/mockMonthlyReport.js'
import chevronDown from './assets/chevron-down.svg'
import AppHeader from '../../components/common/AppHeader.jsx'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] pb-10 text-left text-[15px] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

function ReportPage() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    // 지금은 목데이터. 나중에 여기만 API 호출로 바꾸면 됨 (PART 9)
    setReport(mockMonthlyReport)
  }, [])

  if (!report) {
    return <p className="p-6">불러오는 중...</p>
  }

  return (
    <div className={stageClass}>
      <div className={screenClass}>
        <AppHeader />
        <header className="bg-white px-[20px] pb-[16px] drop-shadow-[0px_2px_6px_rgba(29,43,68,0.04)]">
          <div className="flex items-center justify-between pt-[11px]">
            <p className="text-[24px] leading-[25px] font-bold tracking-[-1px] text-[#1d2b44]">
              이달의 자외선 리포트
            </p>

            <button
              type="button"
              className="flex h-[36px] items-center gap-[6px] rounded-[10px] border-[1.276px] border-[#eceef2] bg-white px-[13.276px] py-[8.276px] text-[13px] leading-[19.5px] font-bold tracking-[-0.64px] text-[#1d2b44]"
            >
              {report.year}년 {report.month}월
              <img className="h-[6px] w-[10px]" src={chevronDown} alt="" />
            </button>
          </div>
        </header>

        <TotalCard month={report.month} summary={report.summary} />

        <RouteRanking routeRanking={report.routeRanking} />

        {/* 카드 3번(노출량 그래프)은 제일 오래 걸리니 마지막에 추가 */}

        <InsightList analysis={report.analysis} />

        <NextMonthCard month={report.month} forecast={report.nextMonthForecast} />
      </div>
    </div>
  )
}

export default ReportPage