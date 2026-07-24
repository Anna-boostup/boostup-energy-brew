-- Testovací článek pro blog (idempotentní – lze pustit opakovaně).
-- Spustit v SQL editoru daného projektu (doporučeno DEV/test).
-- NENÍ v migrations/ schválně – aby se to samo nenasadilo na produkci.
-- Blog čte z public.blog_posts kde status='published'.

INSERT INTO public.blog_posts
    (title, slug, excerpt, content, status, featured_image_url,
     featured_image_position, author_name, author_role, published_at, created_at)
SELECT
    'Jak funguje čistá energie: věda za šesti hodinami soustředění',
    'jak-funguje-cista-energie',
    'Proč BoostUp drží energii šest hodin bez nervozity a bez propadu? Podívali jsme se na to, co se v těle skutečně děje – a proč záleží na tom, jak se energie uvolňuje.',
    '<h2>Energie, která nespadne</h2>
<p>Většina energetických nápojů funguje jako prudký výšleh: během chvíle jste nahoře, ale za dvě hodiny přichází propad, podrážděnost a chuť na další dávku. Tělo dostane všechno naráz a stejně rychle o to přijde.</p>
<p>BoostUp jsme navrhli přesně naopak. Cílem není nejsilnější náraz, ale <strong>stabilní, čistá energie</strong>, která vydrží celý pracovní blok – zhruba šest hodin – a plynule odezní, bez tvrdého dopadu.</p>
<h2>3B koncept v kostce</h2>
<ul>
  <li><strong>Boost</strong> – rychlý nástup soustředění a bdělosti, bez třesu a bušení srdce.</li>
  <li><strong>Balance</strong> – vyvážená kombinace stimulantů, která drží hladinu energie rovnoměrně místo prudkých výkyvů.</li>
  <li><strong>Burn</strong> – pozvolné, přirozené odeznění, takže po výkonu nepřijde propad ani nervozita.</li>
</ul>
<h2>Co se děje v těle</h2>
<p>Klíč není v množství kofeinu, ale v jeho <em>uvolňování v čase</em>. Když se stimulant dostává do těla postupně, mozek udrží konzistentní úroveň pozornosti, aniž by se hladina hnala nahoru a zase padala. Výsledkem je stav, kterému se říká „klidná bdělost" – soustředění bez neklidu.</p>
<blockquote>Síla dvou a půl espress, ale bez nervozity a bez umělých sladidel a aromat.</blockquote>
<p>Přesně o tohle nám jde: aby energie sloužila vám, ne aby vás rozhodila. Ať už řešíte náročný projekt, trénink nebo dlouhou cestu – BoostUp má držet krok s vámi, ne naopak.</p>
<p><strong>Tohle je ukázkový článek</strong> nasazený pro test vzhledu blogu. Klidně ho v administraci uprav nebo smaž.</p>',
    'published',
    NULL,
    'center',
    'Redakce BoostUp',
    'Kvalita & Energie',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM public.blog_posts WHERE slug = 'jak-funguje-cista-energie'
);
