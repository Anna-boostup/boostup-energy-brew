interface DesktopNavProps {
  navigation: Array<{ href: string; label: string }>;
}

const DesktopNav = ({ navigation }: DesktopNavProps) => {
  return (
    <nav className="hidden md:flex items-center gap-8">
      {navigation.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={(e) => {
            if (window.location.pathname === '/' && link.href.includes('#')) {
              e.preventDefault();
              const id = link.href.split('#')[1];
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="text-foreground/70 hover:text-foreground transition-colors"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default DesktopNav;
