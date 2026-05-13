export default function Footer() {
  const links = [
    { label: 'About Us', href: '/about' },
    { label: 'Executive Board', href: '/board' },
    { label: 'Culture Show', href: '/culture-show' },
    { label: 'Shop', href: '/shop' },
    { label: 'Alumni Network', href: '/alumni' },
    { label: 'Internships', href: '/internships' },
  ];

  const socials = [
    { label: 'Instagram', href: 'https://www.instagram.com/uchicagokso?utm_source=ig_web_button_share_sheet&igsh=MWEzNTJibndqMGJ0eA==' },
    { label: 'Facebook', href: 'https://www.facebook.com/share/g/16cdxUAiLv/' },
    { label: 'LinkedIn', href: 'https://linkedin.com/company/uchicago-kso' },
    { label: 'Email', href: 'mailto:ksouchicago@gmail.com' },
  ];

  return (
    <footer className="bg-[#0a0a0a] text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16 mb-14">

          {/* Wordmark + tagline */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <svg viewBox="0 0 100 100" className="w-5 h-5 flex-shrink-0 opacity-80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <g transform="rotate(18 50 50)">
                  <g transform="translate(100 0) scale(-1 1)">
                    <circle cx="50" cy="50" r="49" fill="#CD2E3A"/>
                    <g transform="rotate(-90 50 50)">
                      <path d="M50,1 A49,49 0 0,0 50,99 A24.5,24.5 0 0,1 50,50 A24.5,24.5 0 0,0 50,1 Z" fill="#3a6fd8"/>
                    </g>
                  </g>
                </g>
              </svg>
              <div className="flex items-center font-[family-name:var(--font-poppins)]">
                <span className="font-semibold text-white text-[15px] tracking-[-0.02em]">KSO</span>
                <span className="w-px h-4 bg-[#CD2E3A] mx-2.5 flex-shrink-0" aria-hidden />
                <span className="text-gray-500 text-[11px] font-medium tracking-[0.12em] uppercase">UChicago</span>
              </div>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed max-w-[240px]">
              Connecting Korean students and fostering cultural exchange at the University of Chicago since 1976.
            </p>
            <p className="text-gray-700 text-[11px] mt-3 tracking-wider">한국 학생들과의 연결 · 문화 교류</p>
          </div>

          {/* Quick links */}
          <div>
            <div className="text-[9px] tracking-[0.28em] uppercase text-gray-600 font-semibold mb-6">
              Navigate
            </div>
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm transition-colors duration-150"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <div className="text-[9px] tracking-[0.28em] uppercase text-gray-600 font-semibold mb-6">
              Connect
            </div>
            <div className="space-y-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target={s.href.startsWith('mailto') ? undefined : '_blank'}
                  rel={s.href.startsWith('mailto') ? undefined : 'noopener noreferrer'}
                  className="flex items-center justify-between border border-gray-800 px-4 py-2.5 hover:border-gray-600 hover:text-white group transition-colors duration-150"
                >
                  <span className="text-gray-400 text-sm group-hover:text-white transition-colors">{s.label}</span>
                  <svg className="w-3 h-3 text-gray-700 group-hover:text-gray-400 flex-shrink-0 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </a>
              ))}
            </div>
            <div className="mt-5 text-gray-700 text-xs space-y-1">
              <div>Chicago, IL 60637</div>
              <a href="mailto:ksouchicago@gmail.com" className="hover:text-gray-400 transition-colors">ksouchicago@gmail.com</a>
            </div>
          </div>

        </div>

        {/* Taegeuk-inspired split border */}
        <div className="flex mb-8">
          <div className="flex-1 h-px bg-[#CD2E3A]" />
          <div className="flex-1 h-px bg-[#0047A0]" />
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <p className="text-gray-600 text-xs">
            © 2024 Korean Students Organization · 한국 문화 동아리. All rights reserved.
          </p>
          <p className="text-gray-700 text-xs">
            Designed & built by{' '}
            <a
              href="https://www.linkedin.com/in/hudson-chung/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-white transition-colors"
            >
              Hudson Chung
            </a>
          </p>
        </div>

      </div>
    </footer>
  );
}
