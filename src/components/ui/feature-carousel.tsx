'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { landingBody, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

export type FeatureCarouselItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  description: string;
};

type FeatureCarouselProps = {
  items: FeatureCarouselItem[];
  onSelectItem?: (item: FeatureCarouselItem) => void;
  accentColor?: string;
  autoPlayInterval?: number;
  badgeLabel?: string;
  /** Replaces solid accentColor on the left panel (e.g. TaskCard gradient). */
  panelClassName?: string;
  rightPanelClassName?: string;
};

const AUTO_PLAY_INTERVAL = 3000;
const ITEM_HEIGHT = 65;

const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

export function FeatureCarousel({
  items,
  onSelectItem,
  accentColor = '#005fff',
  autoPlayInterval = AUTO_PLAY_INTERVAL,
  badgeLabel = 'Popular service',
  panelClassName,
  rightPanelClassName,
}: FeatureCarouselProps) {
  const [step, setStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentIndex = ((step % items.length) + items.length) % items.length;
  const currentItem = items[currentIndex];

  const nextStep = useCallback(() => {
    setStep((prev) => prev + 1);
  }, []);

  const handleChipClick = (index: number) => {
    let diff = index - currentIndex;
    if (diff > items.length / 2) diff -= items.length;
    if (diff < -items.length / 2) diff += items.length;
    if (diff !== 0) {
      setStep((s) => s + diff);
      return;
    }
    onSelectItem?.(items[index]);
  };

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const interval = setInterval(nextStep, autoPlayInterval);
    return () => clearInterval(interval);
  }, [nextStep, isPaused, autoPlayInterval, items.length]);

  const getCardStatus = (index: number) => {
    const diff = index - currentIndex;
    const len = items.length;

    let normalizedDiff = diff;
    if (diff > len / 2) normalizedDiff -= len;
    if (diff < -len / 2) normalizedDiff += len;

    if (normalizedDiff === 0) return 'active';
    if (normalizedDiff === -1) return 'prev';
    if (normalizedDiff === 1) return 'next';
    return 'hidden';
  };

  if (items.length === 0) return null;

  return (
    <div className="relative flex min-h-[360px] flex-row overflow-hidden rounded-[2rem] border border-blue-100/60 sm:min-h-[440px] md:min-h-[520px] lg:aspect-video lg:min-h-0 lg:rounded-[3rem]">
      <div
        className={cn(
          'relative z-30 flex min-h-0 w-[42%] shrink-0 flex-col items-start justify-center overflow-hidden px-3 py-8 sm:w-[40%] sm:px-6 sm:py-10 md:px-10 lg:h-full lg:pl-14 lg:pr-8',
          panelClassName,
        )}
        style={panelClassName ? undefined : { backgroundColor: accentColor }}
      >
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 top-0 z-40 h-12 bg-gradient-to-b md:h-16 lg:h-14',
            panelClassName && 'from-[#000d45] via-[#000d45]/80 to-transparent',
          )}
          style={
            panelClassName
              ? undefined
              : {
                  backgroundImage: `linear-gradient(to bottom, ${accentColor}, ${accentColor}cc, transparent)`,
                }
          }
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 z-40 h-12 bg-gradient-to-t md:h-16 lg:h-14',
            panelClassName && 'from-[#1161fe] via-[#1161fe]/80 to-transparent',
          )}
          style={
            panelClassName
              ? undefined
              : {
                  backgroundImage: `linear-gradient(to top, ${accentColor}, ${accentColor}cc, transparent)`,
                }
          }
        />

        <div className="relative z-20 flex h-full w-full items-center justify-center lg:justify-start">
          {items.map((feature, index) => {
            const isActive = index === currentIndex;
            const distance = index - currentIndex;
            const wrappedDistance = wrap(-(items.length / 2), items.length / 2, distance);
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.id}
                style={{ height: ITEM_HEIGHT, width: 'fit-content' }}
                animate={{
                  y: wrappedDistance * ITEM_HEIGHT,
                  opacity: 1 - Math.abs(wrappedDistance) * 0.25,
                }}
                transition={{ type: 'spring', stiffness: 90, damping: 22, mass: 1 }}
                className="absolute flex items-center justify-start"
              >
                <button
                  type="button"
                  onClick={() => handleChipClick(index)}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                  onFocus={() => setIsPaused(true)}
                  onBlur={() => setIsPaused(false)}
                  className={cn(
                    'group relative flex items-center gap-2 rounded-full border px-3 py-2 text-left transition-all duration-700 sm:gap-4 sm:px-8 sm:py-4',
                    isActive
                      ? 'z-10 border-white bg-white text-[#005fff]'
                      : 'border-white/20 bg-transparent text-white/60 hover:border-white/40 hover:text-white'
                  )}
                  style={isActive ? { color: accentColor } : undefined}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center transition-colors duration-500',
                      isActive ? '' : 'text-white/40 group-hover:text-white/70'
                    )}
                    style={isActive ? { color: accentColor } : undefined}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </div>
                  <span className={`${landingHeadlineSm} text-[11px] tracking-tight uppercase sm:whitespace-nowrap sm:text-[15px]`}>
                    {feature.label}
                  </span>
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div
        className={cn(
          'relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden border-l border-blue-100/40 bg-[#E7F0FF]/60 px-3 py-6 sm:px-6 sm:py-10 md:px-10 md:py-12',
          rightPanelClassName,
        )}
      >
        <div className="relative flex aspect-[4/5] w-full max-w-[280px] items-center justify-center sm:max-w-[340px] md:max-w-[420px]">
          {items.map((feature, index) => {
            const status = getCardStatus(index);
            const isActive = status === 'active';
            const isPrev = status === 'prev';
            const isNext = status === 'next';

            return (
              <motion.div
                key={feature.id}
                initial={false}
                animate={{
                  x: isActive ? 0 : isPrev ? -100 : isNext ? 100 : 0,
                  scale: isActive ? 1 : isPrev || isNext ? 0.85 : 0.7,
                  opacity: isActive ? 1 : isPrev || isNext ? 0.4 : 0,
                  rotate: isPrev ? -3 : isNext ? 3 : 0,
                  zIndex: isActive ? 20 : isPrev || isNext ? 10 : 0,
                  pointerEvents: isActive ? 'auto' : 'none',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 25, mass: 0.8 }}
                className="absolute inset-0 origin-center overflow-hidden rounded-[1.75rem] border-4 border-white bg-white sm:rounded-[2.25rem] sm:border-[6px] md:rounded-[2.5rem] md:border-8"
              >
                <img
                  src={feature.image}
                  alt={feature.label}
                  className={cn(
                    'h-full w-full object-cover transition-all duration-700',
                    isActive ? 'blur-0 grayscale-0' : 'brightness-75 blur-[2px] grayscale'
                  )}
                />

                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute inset-x-0 bottom-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent p-6 pt-24 sm:p-8 sm:pt-28 md:p-10 md:pt-32"
                    >
                      <div className={`${landingHeadlineSm} mb-3 w-fit rounded-full border border-gray-200/50 bg-white px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-[#03113c] shadow-lg sm:text-[11px]`}>
                        {index + 1} • {feature.label}
                      </div>
                      <p className={`${landingBody} text-lg font-medium leading-tight tracking-tight text-white drop-shadow-md sm:text-xl md:text-2xl`}>
                        {feature.description}
                      </p>
                      {onSelectItem && (
                        <button
                          type="button"
                          onClick={() => onSelectItem(feature)}
                          className={`${landingBody} mt-4 w-fit cursor-pointer rounded-full bg-white px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-50 active:scale-[0.98]`}
                          style={{ color: accentColor }}
                        >
                          Post {feature.label.toLowerCase()} task
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                <div
                  className={cn(
                    'absolute left-6 top-6 flex items-center gap-2 transition-opacity duration-300 sm:left-8 sm:top-8 sm:gap-3',
                    isActive ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <div className="h-2 w-2 rounded-full bg-white shadow-[0_0_10px_white]" />
                  <span className={`${landingHeadlineSm} text-[9px] uppercase tracking-[0.3em] text-white/80 sm:text-[10px]`}>
                    {badgeLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {currentItem && onSelectItem && (
          <p className={`${landingBody} mt-4 text-center text-xs text-gray-600 sm:mt-6 sm:text-sm`}>
            Tap a category on the left or{' '}
            <button
              type="button"
              onClick={() => onSelectItem(currentItem)}
              className={`${landingBody} cursor-pointer font-semibold text-[#005fff] underline-offset-2 hover:underline`}
            >
              post a {currentItem.label.toLowerCase()} task
            </button>
          </p>
        )}
      </div>
    </div>
  );
}

export default FeatureCarousel;
