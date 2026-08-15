import StatusBar from '../../../components/common/StatusBar.jsx'

// 온보딩 화면 배경(#f5f7fb)에 맞춘 상태바.
// 실제 그리기는 공통 StatusBar 가 담당한다 (시계가 실시간으로 돈다)
function OnboardingStatusBar() {
  return <StatusBar className="bg-[#f5f7fb]" />
}

export default OnboardingStatusBar
