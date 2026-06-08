'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Search, ChevronDown } from 'lucide-react';
import { landingBody, landingHeadline, landingHeadlineSm } from '@/components/LangingHome/landingTypography';
import { IdeaGeneratorHeroDecor } from '@/components/ui/idea-generator-hero-section';

const pillButtonClass =
  `${landingBody} inline-flex min-h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2.5 text-center text-xs font-semibold leading-snug text-white backdrop-blur-sm transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-[0.98] sm:min-h-9 sm:w-auto sm:justify-start sm:px-4 sm:py-2 sm:text-left sm:text-sm md:px-4 md:py-2.5`;

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
      <section className="relative overflow-hidden bg-gradient-to-br from-[#005fff] via-[#0047ff] to-[#03113c] py-12 text-white shadow-md transition-all duration-300 sm:py-20 md:py-28">
        <IdeaGeneratorHeroDecor />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-4 text-center sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-4">
            <h1
              className={`${landingHeadline} text-[1.75rem] leading-[1.1] text-white drop-shadow-sm text-balance sm:text-4xl md:text-5xl lg:text-6xl`}
            >
              Post a task. Get it done.
            </h1>
            <p className={`${landingBody} mx-auto max-w-lg text-sm font-medium leading-relaxed text-blue-100 sm:text-base`}>
              Connect with certified, friendly local taskers ready to help you with furniture,
              moving, repairs, deep cleaning, and more.
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="relative mt-8 w-full max-w-2xl sm:mt-12">
            <div
              className="pointer-events-none absolute inset-0 scale-110 rounded-full bg-gradient-to-r from-cyan-400/25 via-[#0066ff]/30 to-cyan-400/25 blur-xl"
              aria-hidden
            />
            <div className="relative rounded-full border border-white/25 bg-white/10 p-1 shadow-2xl backdrop-blur-md">
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
                <div className="relative min-w-0 flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-200/80 sm:left-5" />
                  <input
                    type="text"
                    placeholder="In a few words, what do you need done?"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className={`${landingBody} w-full rounded-full bg-transparent py-3.5 pl-11 pr-4 text-base font-medium text-white placeholder-blue-200/70 focus:outline-none sm:min-h-12 sm:py-4 sm:pl-12 sm:text-base`}
                  />
                </div>
                <button
                  type="submit"
                  className={`${landingBody} inline-flex min-h-11 shrink-0 cursor-pointer select-none items-center justify-center gap-2 rounded-full bg-[#03113c]/90 px-6 py-3 text-sm font-semibold text-white shadow-sm backdrop-blur-sm transition duration-200 hover:bg-[#03113c] active:scale-95 sm:mr-1 sm:min-h-12 sm:px-7 sm:text-base`}
                >
                  <span>Get Offers</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </form>

          <div className="mt-6 w-full max-w-5xl sm:mt-8 lg:mt-10">
            <div className="grid grid-cols-1 gap-2 min-[380px]:grid-cols-2 md:flex md:flex-wrap md:items-stretch md:justify-center md:gap-2.5 lg:gap-3">
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
                    className="relative z-50 mt-2 w-full rounded-xl border border-white/20 bg-[#03113c] p-2 text-left shadow-2xl animate-in fade-in slide-in-from-top-2 duration-150 md:absolute md:left-1/2 md:top-[calc(100%+0.5rem)] md:mt-0 md:w-72 md:max-w-[min(100vw-2rem,20rem)] md:-translate-x-1/2"
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
                            className={`${landingBody} w-full cursor-pointer rounded-lg px-3 py-2.5 text-left text-xs font-medium text-gray-200 transition hover:bg-white/10 hover:text-white sm:text-sm`}
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
