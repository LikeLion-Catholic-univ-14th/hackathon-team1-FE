import { useEffect, useMemo, useState } from 'react'
import statusBar from '../onboarding/assets/status-bar.svg'
import { getMyPage } from './api/mypageApi.js'
import { mockMyPage } from './mocks/mockMyPage.js'

const stageClass =
  'flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-white max-[520px]:p-0'
const screenClass =
  'h-[874px] min-h-[874px] w-[402px] overflow-x-hidden overflow-y-auto bg-[#f5f7fb] text-left font-[Arial,sans-serif] text-[#1d2b44] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full'
const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

function MyPageLogo() {
  return (
    <div
      className={`flex items-center gap-[6px] text-[24px] font-black leading-none text-[#f5a623] ${headingFontClass}`}
      aria-label="SST"
    >
      <svg
        className="h-[27px] w-[27px]"
        viewBox="0 0 28 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle cx="14" cy="14" r="13" fill="#F5A623" />
        <path
          d="M1.8 14H26.2M14 1.8C10.6 5.5 8.9 9.6 8.9 14C8.9 18.4 10.6 22.5 14 26.2M14 1.8C17.4 5.5 19.1 9.6 19.1 14C19.1 18.4 17.4 22.5 14 26.2M4.6 7.4H23.4M4.6 20.6H23.4"
          stroke="white"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span>SST.</span>
    </div>
  )
}

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

function ProfileAvatar() {
  return (
    <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full bg-[#ffd05b] shadow-[0_0_0_6px_rgba(245,166,35,0.2)]">
      <div className="relative h-[54px] w-[54px] rounded-full bg-[#f5a623]">
        <span className="absolute left-1/2 top-[14px] h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-white" />
        <span className="absolute bottom-[10px] left-1/2 h-[16px] w-[32px] -translate-x-1/2 rounded-[50%] bg-white" />
      </div>
    </div>
  )
}

function ProfileSummary({ profile }) {
  const skinConcerns = profile.skinConcerns.join(' · ')

  return (
    <div className="mt-[18px] flex h-[77px] items-center overflow-hidden rounded-[12px] bg-[#f5f8fc] shadow-[0_8px_24px_0_rgba(29,43,68,0.05)]">
      <div className="flex flex-1 flex-col items-center justify-center">
        <span
          className={`text-[10px] font-bold leading-[14px] text-[#a7b6ca] ${headingFontClass}`}
        >
          피부타입
        </span>
        <strong
          className={`mt-[7px] text-[14px] font-bold leading-[18px] text-[#1d2b44] ${headingFontClass}`}
        >
          {profile.skinType}
        </strong>
      </div>
      <span className="h-[37px] w-px bg-[#e4e9f1]" aria-hidden="true" />
      <div className="flex flex-1 flex-col items-center justify-center">
        <span
          className={`text-[10px] font-bold leading-[14px] text-[#a7b6ca] ${headingFontClass}`}
        >
          피부고민
        </span>
        <strong
          className={`mt-[7px] max-w-[120px] truncate text-[14px] font-bold leading-[18px] text-[#1d2b44] ${headingFontClass}`}
        >
          {skinConcerns}
        </strong>
      </div>
    </div>
  )
}

function PouchProduct({ product }) {
  return (
    <li className="grid min-h-[68px] grid-cols-[40px_minmax(0,1fr)_max-content] items-center gap-[14px] px-[14px]">
      <span className="h-10 w-10 rounded-[11px] bg-[#ddecff]" />
      <strong
        className={`min-w-0 truncate text-[14px] font-[510] leading-[20px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
      >
        {product.productName}
      </strong>
      <span
          className={`max-w-[118px] truncate text-[10px] font-[510] leading-[16px] tracking-[-0.4px] text-[#8a9eb8] ${headingFontClass}`}
      >
        {product.blockingMethod} · SPF {product.spf}
      </span>
    </li>
  )
}

function MyPage({ onEditProfile, onEditPouch }) {
  const [myPageData, setMyPageData] = useState(mockMyPage)

  useEffect(() => {
    let ignore = false

    getMyPage()
      .then((data) => {
        if (!ignore) {
          setMyPageData(data)
        }
      })
      .catch(() => {
        if (!ignore) {
          setMyPageData(mockMyPage)
        }
      })

    return () => {
      ignore = true
    }
  }, [])

  const profile = useMemo(
    () => ({
      ...mockMyPage.profile,
      ...myPageData.profile,
      skinConcerns:
        myPageData.profile.skinConcerns.length > 0
          ? myPageData.profile.skinConcerns
          : mockMyPage.profile.skinConcerns,
    }),
    [myPageData.profile],
  )
  const pouch =
    myPageData.pouch.length > 0 ? myPageData.pouch : mockMyPage.pouch

  return (
    <div className={stageClass}>
      <section className={screenClass}>
        <div className="bg-white">
          <img
            className="h-[62px] w-full object-contain"
            src={statusBar}
            alt=""
            aria-hidden="true"
          />

          <header className="relative px-10 pb-[30px] pt-[66px]">
            <MyPageLogo />

            <button
              className="absolute right-[44px] top-[116px] flex h-7 w-7 items-center justify-center border-0 bg-transparent p-0 text-[#8a9eb8]"
              type="button"
              aria-label="내 정보 수정"
              onClick={onEditProfile}
            >
              <EditIcon className="h-[22px] w-[22px]" />
            </button>

            <div className="mt-[54px] text-center">
              <ProfileAvatar />
              <div className="mt-[16px] flex items-center justify-center gap-[7px]">
                <h1
                  className={`m-0 text-[24px] font-bold leading-[30px] tracking-[-0.6px] text-[#1d2b44] ${headingFontClass}`}
                >
                  {profile.name}
                </h1>
                <span
                  className={`inline-flex h-[23px] items-center justify-center rounded-full border-[1.276px] border-[#9fb0c6] bg-white px-[8px] text-[11px] font-bold leading-[14px] text-[#8a9eb8] ${headingFontClass}`}
                >
                  {profile.baseAirport}
                </span>
              </div>

              <ProfileSummary profile={profile} />
            </div>
          </header>
        </div>

        <main className="px-[37px] pb-12 pt-[27px]">
          <div className="flex items-center justify-between px-[13px]">
            <h2
              className={`m-0 text-[17px] font-bold leading-[24px] tracking-[-0.4px] text-[#1d2b44] ${headingFontClass}`}
            >
              내 파우치
            </h2>
            <button
              className={`h-[28px] rounded-full border-[1.276px] border-[#9fb0c6] bg-white px-[14px] text-[11px] font-bold leading-[14px] text-[#8a9eb8] ${headingFontClass}`}
              type="button"
              onClick={onEditPouch}
            >
              수정하기
            </button>
          </div>

          <section className="mt-[11px] overflow-hidden rounded-[16px] bg-white py-[2px] shadow-[0_4px_18px_0_rgba(29,43,68,0.06)]">
            <ul className="m-0 list-none divide-y divide-[#eceef2] p-0">
              {pouch.map((product) => (
                <PouchProduct key={product.id} product={product} />
              ))}
            </ul>
          </section>
        </main>
      </section>
    </div>
  )
}

export default MyPage
