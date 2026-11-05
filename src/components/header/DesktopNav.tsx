interface DesktopNavProps {
  navigation: Array<{ href: string; label: string }>;
}

const DesktopNav = ({ navigation }: DesktopNavProps) => {
  return (
    <nav aria-label="Hlavní navigace" className="hidden items-center justify-center gap-1 lg:flex">
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
          className="rounded-full px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-lime focus-visible:bg-lime focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
};

export default DesktopNav;
