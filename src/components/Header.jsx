import React, { useRef, useEffect, useState } from 'react';

const TEAMS = [
  'adelaide','brisbane','carlton','collingwood','essendon','fremantle',
  'geelong','goldcoast','gws','hawthorn','melbourne','northmelbourne',
  'portadelaide','richmond','stkilda','sydney','westcoast','westernbulldogs',
];

const SECTIONS = [
  { path: '/linear-title', label: 'Brunswick St Belt' },
  { path: '/game-evolution', label: 'Game Changes' },
  { path: '/mcclelland', label: 'McLelland Trophy' },
  { path: '/worm-similarity', label: 'Similar Worms' },
  { path: '/attendance', label: 'Attendance Data' },
  { path: '/alltime-ladder', label: 'Meta Prems' },
];

export default function Header({ route, onNavigate }) {
  const mastheadTitleRef = useRef(null);
  const mastheadSubtitleRef = useRef(null);
  const navTitleRef = useRef(null);
  const navBarRef = useRef(null);
  const navLinksRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [useHamburger, setUseHamburger] = useState(false);

  useEffect(() => {
    let rafId = null;

    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        // progress: 0 at top, 1 when masthead has scrolled out
        const progress = Math.min(Math.max(window.scrollY / 140, 0), 1);

        // Masthead title fades out and slides up
        if (mastheadTitleRef.current) {
          mastheadTitleRef.current.style.opacity = 1 - progress;
          mastheadTitleRef.current.style.transform = `translateY(${-progress * 12}px)`;
        }
        if (mastheadSubtitleRef.current) {
          mastheadSubtitleRef.current.style.opacity = 1 - progress * 2; // fades faster
        }

        // Nav title fades in and slides in from left (preserve vertical centering)
        if (navTitleRef.current) {
          navTitleRef.current.style.opacity = progress;
          navTitleRef.current.style.transform = `translateY(-50%) translateX(${(1 - progress) * -12}px)`;
        }
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Detect when title would collide with nav items and switch to hamburger
  useEffect(() => {
    const check = () => {
      if (!navBarRef.current || !navLinksRef.current || !navTitleRef.current) return;
      const barWidth = navBarRef.current.getBoundingClientRect().width;
      const titleWidth = navTitleRef.current.getBoundingClientRect().width;
      const navWidth = navLinksRef.current.scrollWidth;
      // Nav is centered; calculate where its left edge sits
      const navStart = (barWidth - navWidth) / 2;
      // Switch to hamburger when title (at left:16px) would touch the nav (with 16px gap)
      setUseHamburger(16 + titleWidth + 16 > navStart);
    };
    const ro = new ResizeObserver(check);
    if (navBarRef.current) ro.observe(navBarRef.current);
    check();
    return () => ro.disconnect();
  }, []);

  // Close menu when switching back to desktop nav
  useEffect(() => {
    if (!useHamburger) setMenuOpen(false);
  }, [useHamburger]);

  return (
    <>
      {/* Non-sticky: ticker + masthead scroll away */}
      <div className="bg-white border-b border-stone-200">
        {/* Scrolling logo ticker */}
        <div className="overflow-hidden bg-white border-b border-stone-100 py-2" style={{ maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}>
          <div style={{ display: 'flex', width: 'max-content', animation: 'ticker 40s linear infinite' }}>
            {[...TEAMS, ...TEAMS].map((team, i) => (
              <img
                key={i}
                src={`${import.meta.env.BASE_URL}teams/${team}.png`}
                alt={team}
                style={{ height: 36, width: 36, objectFit: 'contain', filter: 'grayscale(100%) opacity(35%)', margin: '0 20px', flexShrink: 0 }}
              />
            ))}
          </div>
        </div>

        {/* Masthead */}
        <div className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url(${import.meta.env.BASE_URL}header-photo.avif)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 75%',
              filter: 'grayscale(100%)',
              opacity: 0.08,
            }}
          />
          <div className="relative max-w-6xl mx-auto px-4 py-16 text-center">
            <a
              href="#/"
              onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
              className="hover:opacity-80 transition-opacity inline-block"
            >
              <h1
                ref={mastheadTitleRef}
                className="display-font text-4xl sm:text-5xl font-black tracking-tight text-stone-900"
                style={{ willChange: 'transform, opacity' }}
              >
                Sherrin Spreadsheets
              </h1>
              <p
                ref={mastheadSubtitleRef}
                className="text-stone-400 text-sm mt-1.5 italic font-normal"
                style={{ willChange: 'opacity' }}
              >
                Exploring the curious corners of Australian football through data
              </p>
            </a>
          </div>
        </div>
      </div>

      {/* Sticky nav — direct child of the app wrapper so sticky always works */}
      <div className="bg-stone-50 sticky top-0 z-50 border-b border-stone-300">
        {/* Top bar row — title is absolute within this row only, so the dropdown below doesn't shift it */}
        <div ref={navBarRef} className="relative">
          {/* Title — anchored to the far left of the top bar row */}
          <a
            ref={navTitleRef}
            href="#/"
            onClick={(e) => { e.preventDefault(); onNavigate('/'); }}
            className="display-font font-black tracking-tight text-stone-900 text-sm absolute left-4 top-1/2 whitespace-nowrap hover:opacity-70"
            style={{ opacity: 0, transform: 'translateY(-50%) translateX(-12px)', willChange: 'transform, opacity' }}
          >
            Sherrin Spreadsheets
          </a>

          {/* Nav links — always rendered so ResizeObserver can measure natural width; hidden when hamburger active */}
          <div
            className="max-w-6xl mx-auto px-4"
            style={{ visibility: useHamburger ? 'hidden' : 'visible', pointerEvents: useHamburger ? 'none' : 'auto' }}
          >
            <nav ref={navLinksRef} className="flex justify-center">
              {SECTIONS.map(({ path, label }, i) => (
                <React.Fragment key={path}>
                  {i > 0 && (
                    <span className="text-stone-300 self-center text-xs select-none">|</span>
                  )}
                  <a
                    href={`#${path}`}
                    onClick={(e) => { e.preventDefault(); onNavigate(path); }}
                    className={`px-4 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                      route === path
                        ? 'text-stone-900 border-b-2 border-stone-900'
                        : 'text-stone-500 hover:text-stone-800'
                    }`}
                  >
                    {label}
                  </a>
                </React.Fragment>
              ))}
            </nav>
          </div>

          {/* Hamburger button — shown when nav would collide with title */}
          {useHamburger && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="absolute right-4 top-1/2 -translate-y-1/2 py-3 text-stone-500 hover:text-stone-900 transition-colors"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Dropdown — outside the top bar row so it doesn't affect the title's top-1/2 position */}
        {useHamburger && menuOpen && (
          <div className="border-t border-stone-200 bg-stone-50">
            {SECTIONS.map(({ path, label }) => (
              <a
                key={path}
                href={`#${path}`}
                onClick={(e) => { e.preventDefault(); onNavigate(path); setMenuOpen(false); }}
                className={`block px-6 py-3 text-xs font-semibold tracking-widest uppercase transition-colors ${
                  route === path
                    ? 'text-stone-900 bg-stone-100'
                    : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
                }`}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
