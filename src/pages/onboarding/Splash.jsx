import { useEffect } from "react";
import logo from "../../assets/logo/logo.svg";
import "./onboarding.css";

function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <main className="splash">
      <img
        className="splash__logo"
        src={logo}
        alt="SunScreen Time"
      />
    </main>
  );
}

export default Splash;