import { useNavigate } from 'react-router-dom'
import statusBar from '../onboarding/assets/status-bar.svg'

const headingFontClass =
  "font-['SF_Pro',-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif]"

function PouchEdit() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#f5f7fb] max-[520px]:p-0">
      <section className="h-[874px] min-h-[874px] w-[402px] overflow-hidden bg-[#f5f7fb] text-[#1d2b44] max-[520px]:h-svh max-[520px]:min-h-svh max-[520px]:w-full">
        <img
          className="h-[62px] w-full object-contain"
          src={statusBar}
          alt=""
          aria-hidden="true"
        />

        <header className="relative flex h-[60px] items-center justify-center bg-white">
          <button
            className="absolute left-[24px] flex h-8 w-8 items-center justify-center border-0 bg-transparent p-0"
            type="button"
            aria-label="마이페이지로 돌아가기"
            onClick={() => navigate('/mypage')}
          >
            <span
              className="h-[10px] w-[10px] rotate-45 border-b-[2.4px] border-l-[2.4px] border-[#1d2b44]"
              aria-hidden="true"
            />
          </button>
          <h1
            className={`m-0 text-[17px] font-bold leading-6 tracking-[-0.4px] ${headingFontClass}`}
          >
            내 파우치
          </h1>
        </header>
      </section>
    </div>
  )
}

export default PouchEdit
