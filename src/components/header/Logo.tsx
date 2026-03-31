const Logo = () => {
  return (
    <Link to="/" className="relative z-10 hidden sm:block">
      <img src="/logo-green.png" alt="BoostUp - přírodní energetický shot" className="h-8 w-auto dark:hidden" width={178} height={32} />
      <img src="/logo-white.png" alt="BoostUp - přírodní energetický shot" className="h-8 w-auto hidden dark:block" width={222} height={40} />
    </Link>
  );
};


export default Logo;
