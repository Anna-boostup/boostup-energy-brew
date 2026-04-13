
/**
 * Newsletter Template Service
 * Manages the "Master Frame" for BoostUp newsletters.
 */

export interface NewsletterData {
  title?: string;
  heroLabel?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroCtaText?: string;
  heroCtaUrl?: string;
  bodyContent?: string;
}

const DEFAULT_DATA: NewsletterData = {
  title: "BoostUP",
  heroLabel: "Newsletter №1 — Jsme na trhu",
  heroTitle: "Je to<span>tady.</span>",
  heroSubtitle: "Dnes je BoostUP Pure Shot na trhu — a vy jste mezi prvními, kdo to ví.",
  heroCtaText: "Objednat první shot →",
  heroCtaUrl: "https://www.drinkboostup.cz",
  bodyContent: "<p>Vítejte v našem newsletteru.</p>"
};

export const newsletterTemplateService = {
  render: (data: NewsletterData = {}) => {
    const merged = { ...DEFAULT_DATA, ...data };
    
    return `
<!DOCTYPE html>
<html lang="cs">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${merged.title}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,600;1,300&display=swap" rel="stylesheet">
<style>
  :root {
    --black: #0a0a0a;
    --cream: #f4f1e6;
    --green-dark: #3d5a2f;
    --green-light: #dfdf57;
    --orange: #f29739;
    --red: #aa263e;
    --white: #ffffff;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: var(--cream);
    color: var(--black);
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
  }
  .wrapper { max-width: 680px; margin: 0 auto; background: var(--cream); }

  /* HERO */
  .hero {
    background: var(--black);
    padding: 64px 48px 56px;
    position: relative;
    overflow: hidden;
  }
  .hero-bg-text {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 180px;
    color: rgba(255,255,255,0.04);
    position: absolute;
    right: -10px; top: -10px;
    line-height: 1;
    pointer-events: none;
    white-space: nowrap;
  }
  .hero-label {
    font-size: 10px; letter-spacing: 6px; text-transform: uppercase;
    color: var(--green-light); font-weight: 600; margin-bottom: 28px;
  }
  .hero h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 88px; line-height: 0.9; color: var(--white);
    letter-spacing: 2px; margin-bottom: 24px;
  }
  .hero h1 span { color: var(--green-light); display: block; }
  .hero-sub {
    font-size: 15px; color: rgba(255,255,255,0.55); font-weight: 300;
    max-width: 420px; line-height: 1.75; margin-bottom: 40px;
  }
  .hero-cta {
    display: inline-block; background: var(--green-light);
    color: var(--green-dark); font-family: 'Bebas Neue', sans-serif;
    font-size: 18px; letter-spacing: 2px; padding: 16px 40px;
    text-decoration: none;
  }

  /* CONTENT AREA */
  .content-section {
    padding: 56px 48px;
    background: var(--white);
  }
  .content-section h2 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 44px;
    margin-bottom: 16px;
  }

  /* FOOTER */
  .footer { background: var(--black); padding: 40px 48px; border-top: 1px solid rgba(255,255,255,0.05); }
  .footer-logo { font-family: 'Bebas Neue', sans-serif; font-size: 32px; color: var(--white); letter-spacing: 3px; margin-bottom: 8px; }
  .footer-logo span { color: var(--green-light); }
  .footer-tagline { font-size: 11px; color: rgba(255,255,255,0.25); letter-spacing: 3px; text-transform: uppercase; margin-bottom: 28px; }
  .footer-links { display: flex; gap: 24px; margin-bottom: 28px; }
  .footer-links a { font-size: 12px; color: rgba(255,255,255,0.4); text-decoration: none; letter-spacing: 1px; }
  .footer-copy { font-size: 11px; color: rgba(255,255,255,0.15); font-weight: 300; }

  @media (max-width: 600px) {
    .hero h1 { font-size: 56px; }
    .hero, .footer { padding-left: 24px; padding-right: 24px; }
    .content-section { padding-left: 24px; padding-right: 24px; }
  }
</style>
</head>
<body>
<div class="wrapper">

  <header class="hero">
    <div class="hero-bg-text">UP</div>
    <div class="hero-label">${merged.heroLabel}</div>
    <h1>${merged.heroTitle}</h1>
    <p class="hero-sub">${merged.heroSubtitle}</p>
    <a href="${merged.heroCtaUrl}" class="hero-cta">${merged.heroCtaText}</a>
  </header>

  <main class="content-section">
    ${merged.bodyContent}
  </main>

  <footer class="footer">
    <div class="footer-logo">BOOST<span>UP</span></div>
    <p class="footer-tagline">Čistá energie z přírody</p>
    <div class="footer-links">
      <a href="https://www.drinkboostup.cz">Web</a>
      <a href="https://www.drinkboostup.cz/obchod">Obchod</a>
      <a href="mailto:info@drinkboostup.cz">Kontakt</a>
    </div>
    <p class="footer-copy">&copy; ${new Date().getFullYear()} BoostUp Energy. Všechna práva vyhrazena.</p>
  </footer>

</div>
</body>
</html>
`;
  }
};
