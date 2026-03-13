import { Link } from "react-router-dom";
import logoGreen from "@/assets/logo-green.png";
import logoWhite from "@/assets/logo-white.png";

const Logo = () => {
  return (
    <Link to="/" className="relative z-10 hidden sm:block">
      <img src={logoGreen} alt="BoostUp - přírodní energetický shot" className="h-8 w-auto dark:hidden" width={178} height={32} />
      <img src={logoWhite} alt="BoostUp - přírodní energetický shot" className="h-8 w-auto hidden dark:block" width={222} height={40} />
    </Link>
  );
};

export default Logo;
