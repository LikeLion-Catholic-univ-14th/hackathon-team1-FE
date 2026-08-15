import { useEffect, useRef, useState } from 'react'
import StatusBar from '../../components/common/StatusBar.jsx'
import AppHeader from '../../components/common/AppHeader.jsx'
import BottomNavigation from '../../components/common/BottomNavigation.jsx'
import LoadFailed from '../../components/common/LoadFailed.jsx'
import TotalCard from './components/TotalCard.jsx'
import RouteRanking from './components/RouteRanking.jsx'
import ExposureChart from './components/ExposureChart.jsx'
import InsightList from './components/InsightList.jsx'
import NextMonthCard from './components/NextMonthCard.jsx'
import ClinicCard from './components/ClinicCard.jsx'
import ReportLockCard from './components/ReportLockCard.jsx'
import ConsentModal from './components/ConsentModal.jsx'
import { fetchMonthlyReport } from './api/reportApi.js'
import { exportBlocksToPdf } from './utils/exportPdf.js'
import chevronDown from './assets/chevron-down.svg'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0'
const screenClass =
  'relative h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f4f6f9] pb-[110px] text-left text-[15px] text-[#1d2b45] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'

const REPORT_YEAR = 2026
const REPORT_MONTH = 8

function ReportPage() {
  const [report, setReport] = useState(null)
  const [agreed, setAgreed] = useState(false)
  const [showConsent, setShowConsent] = useState(false)
  const [savingPdf, setSavingPdf] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  // PDF 로 담을 영역. 상태바(AppHeader)는 제외한다
  const reportRef = useRef(null)

  useEffect(() => {
    let alive = true

    setFailed(false)

    fetchMonthlyReport(REPORT_YEAR, REPORT_MONTH)
      .then((data) => {
        if (alive) {
          setReport(data)
        }
      })
      .catch((error) => {
        console.error('월간 리포트 조회 실패', error)

        if (alive) {
          setReport(null)
          setFailed(true)
        }
      })

    return () => {
      alive = false
    }
  }, [reloadKey])

  const savePdf = async () => {
    if (savingPdf) {
      return
    }

    setSavingPdf(true)

    try {
      await exportBlocksToPdf(
        reportRef.current,
        `SST_${report.year}년_${report.month}월_자외선리포트.pdf`,
      )
    } catch (error) {
      console.error('PDF 저장 실패', error)
      window.alert('PDF 저장에 실패했어요. 잠시 후 다시 시도해주세요.')
    } finally {
      setSavingPdf(false)
    }
  }

  if (!report) {
    return (
      <div className={stageClass}>
        <div className="relative">
          <div className={screenClass}>
            <StatusBar />
            <AppHeader />

            {failed ? (
              <LoadFailed
                message="리포트를 불러오지 못했어요"
                onRetry={() => setReloadKey((key) => key + 1)}
              />
            ) : (
              <p className="px-[20px] py-[80px] text-center text-[13px] text-[#8a9eb8]">
                불러오는 중...
              </p>
            )}
          </div>

          <BottomNavigation />
        </div>
      </div>
    )
  }

  return (
    <div className={stageClass}>
      <div className="relative">
        <div className={screenClass}>
          <StatusBar />
          <AppHeader />

          <div ref={reportRef} className="bg-[#f4f6f9] pb-[16px]">
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

          {agreed ? (
            <>
              <TotalCard month={report.month} summary={report.summary} />
              <RouteRanking routeRanking={report.routeRanking} />
              <ExposureChart dailyExposure={report.dailyExposure} trend={report.trend} />
              <InsightList analysis={report.analysis} />
              <NextMonthCard month={report.month} forecast={report.nextMonthForecast} />
              <ClinicCard
                month={report.month}
                clinic={report.clinic}
                onSavePdf={savePdf}
                saving={savingPdf}
              />
            </>
          ) : (
            <div className="relative">
              <div aria-hidden="true" className="pointer-events-none blur-[6px] select-none">
                <TotalCard month={report.month} summary={report.summary} />
                <RouteRanking routeRanking={report.routeRanking} />
                <ExposureChart dailyExposure={report.dailyExposure} trend={report.trend} />
              </div>

              <div className="absolute inset-x-0 top-[120px]">
                <ReportLockCard month={report.month} onOpen={() => setShowConsent(true)} />
              </div>
            </div>
          )}
          </div>
        </div>

        <BottomNavigation />

        {showConsent && (
          <ConsentModal
            onAgree={() => {
              setAgreed(true)
              setShowConsent(false)
            }}
            onCancel={() => setShowConsent(false)}
          />
        )}
      </div>
    </div>
  )
}
export default ReportPage