import { Link, useLocation } from 'react-router-dom'
import navAnalysis from '../../assets/navigation/nav-analysis.svg'
import navHome from '../../assets/navigation/nav-home.svg'
import navMypage from '../../assets/navigation/nav-mypage.svg'
import navSchedule from '../../assets/navigation/nav-schedule.svg'

const navItems = [
  {
    label: '홈',
    path: '/home',
    icon: navHome,
    matchPaths: ['/home'],
  },
  {
    label: '일정',
    path: '/calendar',
    icon: navSchedule,
    matchPaths: ['/calendar', '/schedule'],
  },
  {
    label: '분석',
    path: '/reports',
    icon: navAnalysis,
    matchPaths: ['/reports', '/analysis'],
  },
  {
    label: 'MY',
    path: '/mypage',
    icon: navMypage,
    matchPaths: ['/mypage'],
  },
]

const activeIconFilter =
  'brightness(0) saturate(100%) invert(66%) sepia(84%) saturate(921%) hue-rotate(350deg) brightness(101%) contrast(94%)'

function BottomNavigation({ className = '' }) {
  const location = useLocation()

  return (
    <nav
      className={`absolute bottom-[20px] left-1/2 z-10 w-[354px] max-w-[calc(100%-48px)] -translate-x-1/2 rounded-[28px] bg-white px-[10px] py-[8px] shadow-[0_8px_28px_0_rgba(29,43,68,0.14)] ${className}`}
      aria-label="하단 네비게이션"
    >
      <ul className="m-0 grid list-none grid-cols-4 items-center gap-[2px] p-0">
        {navItems.map((item) => {
          const isActive = item.matchPaths.some(
            (path) =>
              location.pathname === path ||
              location.pathname.startsWith(`${path}/`),
          )

          return (
            <li key={item.path}>
              <Link
                className={`flex h-[58px] flex-col items-center justify-center rounded-[24px] text-center transition-colors ${
                  isActive ? 'bg-[#fff3dd]' : 'bg-transparent'
                }`}
                to={item.path}
                aria-current={isActive ? 'page' : undefined}
              >
                <span className="flex h-[28px] w-[34px] items-start justify-center overflow-hidden">
                  <img
                    className="h-[58px] w-[86px] max-w-none shrink-0 -translate-y-[6px]"
                    src={item.icon}
                    alt=""
                    aria-hidden="true"
                    style={isActive ? { filter: activeIconFilter } : undefined}
                  />
                </span>
                <span
                  className={`mt-[2px] text-[12px] font-bold leading-[18px] tracking-[-0.4px] ${
                    isActive ? 'text-[#1d2b44]' : 'text-[#8a9eb8]'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export default BottomNavigation
