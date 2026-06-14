'use client';

import { cn } from '@/lib/utils';

type HeroCardDecorProps = {
  /** Larger accent for map preview / modal cards */
  size?: 'default' | 'large';
  /** Yellow blob placement */
  accentPosition?: 'top-left' | 'top-right' | 'bottom-right';
};

export default function HeroCardDecor({
  size = 'default',
  accentPosition = 'top-left',
}: HeroCardDecorProps) {
  const blobSizeClass =
    size === 'large'
      ? 'h-32 w-32 sm:h-40 sm:w-40'
      : 'h-24 w-24 sm:h-28 sm:w-28';

  const blobPositionClass =
    accentPosition === 'bottom-right'
      ? size === 'large'
        ? '-bottom-10 -right-10 sm:-bottom-12 sm:-right-12'
        : '-bottom-8 -right-8 sm:-bottom-10 sm:-right-10'
      : accentPosition === 'top-right'
        ? size === 'large'
          ? '-right-12 -top-12 sm:-right-16 sm:-top-16'
          : '-right-8 -top-8 sm:-right-10 sm:-top-10'
        : size === 'large'
          ? '-left-12 -top-12 sm:-left-16 sm:-top-16'
          : '-left-8 -top-8 sm:-left-10 sm:-top-10';

  return (
    <>
      <div
        className={cn(
          'pointer-events-none absolute z-0 select-none rounded-full bg-[#fcd074]',
          blobSizeClass,
          blobPositionClass,
        )}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden opacity-[0.18] mix-blend-overlay"
        aria-hidden
      >
        <svg
          className="h-full w-full text-neutral-500"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 800 400"
          preserveAspectRatio="none"
        >
          <path d="M-50,100 C150,150 250,50 450,180 C650,310 750,150 850,220" strokeWidth="1.5" />
          <path d="M-50,130 C150,180 250,80 450,210 C650,340 750,180 850,250" strokeWidth="1.5" />
          <path d="M-50,160 C150,210 250,110 450,240 C650,370 750,210 850,280" strokeWidth="1.5" />
          <path
            d="M-20,50 C180,80 270,10 470,120 C670,230 770,90 870,140"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
        </svg>
      </div>
    </>
  );
}
