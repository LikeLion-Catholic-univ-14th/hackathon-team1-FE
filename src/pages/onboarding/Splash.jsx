import { useEffect } from 'react'
import logo from '../../assets/logo/logo.svg'

function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish()
    }, 2000)

    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <main className="flex min-h-svh w-full items-start justify-center bg-[#bdbdbd] p-6 max-[520px]:bg-[#fff6e5] max-[520px]:p-0">
      <div className="flex min-h-[874px] w-[402px] items-center justify-center bg-[#fff6e5] max-[520px]:min-h-svh max-[520px]:w-full">
        <img
          className="block h-auto w-[177px]"
          src={logo}
          alt="SunScreen Time"
        />
      </div>
    </main>
  )
}

export default Splash
