'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';
import { landingHeadline, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

const pillButtonClass =
  'inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-center text-xs font-semibold leading-snug text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-[0.98] sm:min-h-9 sm:w-auto sm:justify-start sm:px-4 sm:py-2 sm:text-left sm:text-sm md:px-4 md:py-2.5';

interface HeroProps {
  onPostWithTitle: (title: string) => void;
}

export default function Hero({ onPostWithTitle }: HeroProps) {
  const [inputValue, setInputValue] = useState('');
  const [showInspirationMenu, setShowInspirationMenu] = useState(false);
  const inspirationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showInspirationMenu) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (inspirationRef.current && !inspirationRef.current.contains(target)) {
        setShowInspirationMenu(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowInspirationMenu(false);
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('touchstart', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('touchstart', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [showInspirationMenu]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onPostWithTitle(inputValue.trim());
    } else {
      onPostWithTitle('General task help requested');
    }
  };

  const quickPills = [
    { title: 'Help me move home', query: 'Help me move home and pack furniture' },
    { title: 'End of lease cleaning', query: 'End of lease deep cleaning' },
    { title: 'Fix my washing machine', query: 'Fix my washing machine motor issue' },
    { title: 'Mow my backyard', query: 'Mow my backyard and trim edges' },
  ];

  const inspirationPills = [
    'Mount TV to brick wall',
    'Assemble IKEA Pax wardrobe',
    'Resume copywriting assistance',
    'Database cleaning help',
    'Pet sitting & walking',
    'Local grocery delivery',
  ];

  return (
    <div className={`w-full ${showInspirationMenu ? 'relative z-30' : ''}`}>
      <section
        className="relative bg-gradient-to-br from-[#005fff] via-[#0047ff] to-[#03113c] py-10 text-left text-white shadow-md transition-all duration-300 sm:py-16 md:py-24"
      >
        {/* Decorative layer — overflow hidden only here so dropdown is not clipped */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-sky-400 via-indigo-500 to-transparent opacity-20" />
          <div className="absolute top-1/4 right-0 hidden h-48 w-48 rounded-full bg-cyan-400 opacity-10 mix-blend-screen blur-3xl filter animate-pulse sm:block sm:h-64 sm:w-64" />
          <div className="absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-blue-500 opacity-15 mix-blend-screen blur-3xl filter sm:h-72 sm:w-72" />
        </div>

        {/* Main Wrapper content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Core Headline */}
          <div className="max-w-3xl space-y-4">
            <h1
              className={`${landingHeadline} text-[1.75rem] leading-[1.1] text-white drop-shadow-sm text-balance sm:text-4xl md:text-5xl lg:text-6xl`}
            >
              Post a task. Get it done.
            </h1>
            <p className="max-w-lg text-sm leading-relaxed font-medium text-blue-100 sm:text-base">
              Connect with certified, friendly local taskers ready to help you with furniture,
              moving, repairs, deep cleaning, and more.
            </p>
          </div>

          {/* Input Form Box container */}
          <form
            onSubmit={handleFormSubmit}
            className="mt-6 flex max-w-5xl flex-col items-stretch gap-2.5 rounded-2xl border border-white/10 bg-white p-2 shadow-xl sm:mt-10 sm:flex-row sm:items-center sm:gap-3 sm:p-3.5"
          >
            {/* Main prompt text input */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 sm:left-4" />
              <input
                type="text"
                placeholder="In a few words, what do you need done?"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="min-h-12 w-full rounded-xl border-none py-3 pl-11 pr-3 text-base font-medium text-[#03113c] placeholder-gray-400 focus:outline-none focus:ring-0 sm:pl-12 sm:text-base"
              />
            </div>

            <button
              type="submit"
              className="inline-flex min-h-12 w-full shrink-0 cursor-pointer select-none items-center justify-center space-x-2 rounded-xl bg-[#03113c] px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 active:scale-95 hover:bg-black sm:w-auto sm:text-base"
            >
              <span>Get Offers</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          </form>

          {/* Quick assistance suggestion triggers */}
          <div className="mt-5 max-w-5xl sm:mt-6 lg:mt-8">
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 md:flex md:flex-wrap md:items-stretch md:gap-2.5 lg:gap-3">
              {quickPills.map((pill) => (
                <button
                  key={pill.title}
                  type="button"
                  onClick={() => onPostWithTitle(pill.query)}
                  className={pillButtonClass}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300"
                    aria-hidden
                  />
                  <span className="min-w-0 text-balance">{pill.title}</span>
                </button>
              ))}

              {/* More inspiration — full-width row on narrow mobile; inline from md */}
              <div
                ref={inspirationRef}
                className="relative col-span-1 min-[380px]:col-span-2 md:col-span-1 md:w-auto lg:shrink-0"
              >
                <button
                  type="button"
                  onClick={() => setShowInspirationMenu((open) => !open)}
                  aria-expanded={showInspirationMenu}
                  aria-controls="hero-inspiration-panel"
                  className={`${pillButtonClass} w-full md:min-w-[10.5rem]`}
                >
                  <span className="min-w-0">More inspiration</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                      showInspirationMenu ? 'rotate-180' : ''
                    }`}
                    aria-hidden
                  />
                </button>

                {showInspirationMenu && (
                  <div
                    id="hero-inspiration-panel"
                    role="region"
                    aria-label="Popular task ideas"
                    className="relative z-50 mt-2 w-full rounded-xl border border-white/20 bg-[#03113c] p-2 text-left shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 md:absolute md:left-0 md:top-[calc(100%+0.5rem)] md:mt-0 md:w-72 md:max-w-[min(100vw-2rem,20rem)] lg:left-auto lg:right-0"
                  >
                    <span
                      className={`${landingHeadlineSm} block px-2 pb-1 pt-1 text-[10px] uppercase tracking-wider text-blue-400`}
                    >
                      Popular Ideas:
                    </span>
                    <ul className="max-h-[min(16rem,50dvh)] space-y-0.5 overflow-y-auto overscroll-contain md:max-h-56">
                      {inspirationPills.map((idea) => (
                        <li key={idea}>
                          <button
                            type="button"
                            onClick={() => {
                              setShowInspirationMenu(false);
                              onPostWithTitle(idea);
                            }}
                            className="w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white sm:text-sm"
                          >
                            {idea}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}

