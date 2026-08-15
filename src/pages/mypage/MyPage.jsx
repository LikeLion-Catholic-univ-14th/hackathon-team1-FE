import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../components/common/AppHeader.jsx'
import BottomNavigation from '../../components/common/BottomNavigation.jsx'
import StatusBar from '../../components/common/StatusBar.jsx'
import moreHorizontalIcon from '../../assets/icons/more-horizontal.svg'
import profileIcon from './assets/profile-icon.svg'
import { mockMyPage } from './mocks/mockMyPage.js'
import {
  getFallbackMyPageData,
  loadMyPageData,
} from './utils/myPageData.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-white max-[520px]:p-0'
const screenClass =
  "relative h-[874px] min-h-[874px] w-[402px] overflow-hidden bg-[#f5f7fb] text-left font-[SF_Pro,Pretendard,sans-serif] text-[#1D2B44] max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full"
const headingFontClass =
  "font-[SF_Pro,Pretendard,sans-serif]"

const getSpfSummary = (product) => {
  const spf = product.spf || '50'
  const paSuffix = product.pa?.replace(/^PA/, '') ?? ''

  if (!paSuffix || spf.includes('+')) {
    return spf
  }

  return `${spf}${paSuffix}`
}

const toDisplayList = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []

function EditIcon({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4.5 19.5L8.9 18.6L19.05 8.45C19.64 7.86 19.64 6.9 19.05 6.31L17.69 4.95C17.1 4.36 16.14 4.36 15.55 4.95L5.4 15.1L4.5 19.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 6L18 9.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  )
}

function ProfileSummary({ profile }) {
  const skinTypes = toDisplayList(profile.skinType)
  const skinConcerns = toDisplayList(profile.skinConcerns)

  return (
    <div className="mt-[24px] flex min-h-[78px] items-stretch overflow-hidden rounded-[22px] bg-[#F4F8FF] py-[15px] shadow-[0_4px_14px_0_rgba(29,43,68,0.08)]">
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-3">
        <span
          className={`whitespace-nowrap text-center text-[11px] font-bold uppercase leading-[16.5px] tracking-[-0.4px] text-[#A8B8CC] ${headingFontClass}`}
        >
          피부타입
        </span>
        <strong
          className={`mt-[7px] flex max-w-full flex-wrap justify-center text-center text-[17px] font-bold leading-[25.5px] tracking-[-1px] text-[#1D2B44] ${headingFontClass}`}
        >
          {skinTypes.map((type, index) => (
            <span className="whitespace-nowrap" key={`${type}-${index}`}>
              {index === 0 ? type : ` · ${type}`}
            </span>
          ))}
        </strong>
      </div>
      <span className="my-[7px] w-px self-stretch bg-[#e4e9f1]" aria-hidden="true" />
      <div className="flex min-w-0 flex-1 flex-col items-center justify-center px-3">
        <span
          className={`whitespace-nowrap text-center text-[11px] font-bold uppercase leading-[16.5px] tracking-[-0.4px] text-[#A8B8CC] ${headingFontClass}`}
        >
          피부고민
        </span>
        <strong
          className={`mt-[7px] flex max-w-full flex-wrap justify-center text-center text-[17px] font-bold leading-[25.5px] tracking-[-1px] text-[#1D2B44] ${headingFontClass}`}
        >
          {skinConcerns.map((concern, index) => (
            <span className="whitespace-nowrap" key={concern}>
              {index === 0 ? concern : ` · ${concern}`}
            </span>
          ))}
        </strong>
      </div>
    </div>
  )
}

function TreatmentHistoryRow({ onClick }) {
  return (
    <button
      className={`mt-[24px] flex h-[44px] w-full items-center justify-between border-0 bg-transparent px-[14px] text-left text-[14px] font-[510] leading-[21px] tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
      type="button"
      onClick={onClick}
    >
      <span>나의 시술 이력</span>
      <span
        className="h-[11px] w-[11px] rotate-45 border-r-[2px] border-t-[2px] border-[#8A9EB8]"
        aria-hidden="true"
      />
    </button>
  )
}

function PouchProduct({ product }) {
  return (
    <li className="grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)_max-content] items-center gap-x-[14px] gap-y-[4px] px-[14px] py-[10px]">
      <span className="flex h-10 w-10 items-center justify-center rounded-[11px] bg-[#ddecff]">
        {product.icon && (
          <img
            className="h-[20px] w-[20px] object-contain"
            src={product.icon}
            alt=""
            aria-hidden="true"
          />
        )}
      </span>
      <strong
        className={`min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[510] leading-5 tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
      >
        {product.productName}
      </strong>
      <span
        className={`max-w-[118px] break-keep text-right text-[10px] font-[510] leading-4 tracking-[-0.4px] text-[#8a9eb8] [overflow-wrap:anywhere] ${headingFontClass}`}
      >
        {product.blockingMethod} · SPF {getSpfSummary(product)}
      </span>
    </li>
  )
}

function EmptyPouchState() {
  return (
    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-[16px] bg-white px-6 text-center shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
      <img
        className="h-[18px] w-[18px] object-contain opacity-70"
        src={moreHorizontalIcon}
        alt=""
        aria-hidden="true"
      />
      <p
        className={`mt-[13px] m-0 text-[15px] font-normal leading-[21px] tracking-[-0.64px] text-[rgba(29,43,68,0.50)] ${headingFontClass}`}
      >
        아직 등록된 차단제가 없어요
      </p>
    </div>
  )
}

function MyPage({ onEditProfile, onEditPouch }) {
  const navigate = useNavigate()
  const [myPageData, setMyPageData] = useState(() => getFallbackMyPageData())

  useEffect(() => {
    let ignore = false

    loadMyPageData()
      .then((data) => {
        if (!ignore) {
          setMyPageData(data)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const profile = useMemo(
    () => {
      const skinTypes = toDisplayList(myPageData.profile.skinType)
      const skinConcerns = toDisplayList(myPageData.profile.skinConcerns)

      return {
        ...mockMyPage.profile,
        ...myPageData.profile,
        skinType:
          skinTypes.length > 0
            ? skinTypes
            : toDisplayList(mockMyPage.profile.skinType),
        skinConcerns:
          skinConcerns.length > 0
            ? skinConcerns
            : toDisplayList(mockMyPage.profile.skinConcerns),
      }
    },
    [myPageData.profile],
  )
  const pouch = Array.isArray(myPageData.pouch)
    ? myPageData.pouch
    : mockMyPage.pouch

  const handleEditProfile = () => {
    if (onEditProfile) {
      onEditProfile()
      return
    }

    navigate('/mypage/profile-edit')
  }

  const handleEditPouch = () => {
    if (onEditPouch) {
      onEditPouch()
      return
    }

    navigate('/mypage/pouch-edit')
  }

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <div className="h-full overflow-x-hidden overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="bg-white">
            <StatusBar className="bg-transparent" />

            <AppHeader />

            <header className="relative px-10 pb-[20px] pt-[36px]">
              <button
                className="absolute right-[44px] top-[10px] flex h-7 w-7 items-center justify-center border-0 bg-transparent p-0 text-[#8a9eb8]"
                type="button"
                aria-label="내 정보 수정"
                onClick={handleEditProfile}
              >
                <EditIcon className="h-[22px] w-[22px]" />
              </button>

              <div className="text-center">
                <img
                  className="mx-auto h-[76px] w-[76px] object-contain"
                  src={profileIcon}
                  alt=""
                  aria-hidden="true"
                />
                <div className="mt-[15px] flex items-center justify-center gap-[7px]">
                  <h1
                    className={`m-0 text-[24px] font-[860] leading-[28.5px] tracking-[-1px] text-[#1D2B44] ${headingFontClass}`}
                  >
                    {profile.name}
                  </h1>
                  <span
                    className={`inline-flex items-center justify-center rounded-[99px] border-[1.276px] border-[#8A9EB8] bg-[#ECEEF2] px-[8px] py-[2px] text-[12px] font-bold leading-[18px] text-[#8A9EB8] ${headingFontClass}`}
                  >
                    {profile.baseAirport}
                  </span>
                </div>

                <ProfileSummary profile={profile} />
                <TreatmentHistoryRow
                  onClick={() => navigate('/mypage/treatment-history')}
                />
              </div>
            </header>
          </div>

          <main className="px-[37px] pb-[210px] pt-[37px]">
            <div className="flex items-center justify-between px-[13px]">
              <h2
                className={`m-0 text-[17px] font-bold leading-6 tracking-[-0.4px] text-[#1D2B44] ${headingFontClass}`}
              >
                내 파우치
              </h2>
              <button
                className={`h-[28px] rounded-full border-[1.276px] border-[#9fb0c6] bg-white px-[14px] text-[11px] font-bold leading-[14px] text-[#8a9eb8] ${headingFontClass}`}
                type="button"
                onClick={handleEditPouch}
              >
                수정하기
              </button>
            </div>

            <section className="mt-[11px]">
              {pouch.length > 0 ? (
                <div className="overflow-hidden rounded-[16px] bg-white py-[2px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
                  <ul className="m-0 list-none divide-y divide-[#eceef2] p-0">
                    {pouch.map((product) => (
                      <PouchProduct key={product.id} product={product} />
                    ))}
                  </ul>
                </div>
              ) : (
                <EmptyPouchState />
              )}
            </section>
          </main>
        </div>

        <BottomNavigation />
      </section>
    </div>
  )
}

export default MyPage
