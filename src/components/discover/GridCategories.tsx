'use client';

import React from 'react';
import { motion } from 'motion/react';
import {
  ArrowUpRight,
  Briefcase,
  Laptop,
  Hammer,
  Wrench,
  Palette,
  Camera,
  Music,
  Sprout,
  Compass,
  Sparkles,
  Truck,
  Paintbrush,
} from 'lucide-react';
import { GRID_CATEGORIES } from './mockData';
import { landingBody, landingHeadline, landingHeadlineSm } from '@/components/LangingHome/landingTypography';

interface GridCategoriesProps {
  onSelectGridCategory: (name: string) => void;
}

const IconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Laptop,
  Hammer,
  Wrench,
  Palette,
  Camera,
  Music,
  Sprout,
  Compass,
  Sparkles,
  Truck,
  Paintbrush,
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.04 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring' as const, stiffness: 130, damping: 18 },
  },
};

export default function GridCategories({ onSelectGridCategory }: GridCategoriesProps) {
  return (
    <section className="relative overflow-hidden bg-white py-12 sm:py-16 lg:py-20">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 10%, rgba(0, 95, 255, 0.08), transparent 45%),
            radial-gradient(circle at 80% 90%, rgba(0, 95, 255, 0.06), transparent 40%)
          `,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 95, 255, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0, 95, 255, 0.04) 1px, transparent 1px)`,
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-4 text-left sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-6 sm:mb-10 lg:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2
              className={`${landingHeadline} text-2xl leading-tight text-[#03113c] text-balance sm:text-4xl`}
            >
              Explore specialized services
            </h2>
            <p className={`${landingBody} mt-2 max-w-xl text-[13px] leading-relaxed font-medium text-gray-500 sm:mt-3 sm:text-sm`}>
              From speedy everyday tasks to custom programming. Describe what you need, post for
              free, and receive responses from fully verified specialists instantly.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-blue-100/80 bg-[#E7F0FF]/60 px-4 py-3 sm:px-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#005fff] text-sm font-bold text-white">
              {GRID_CATEGORIES.length}
            </div>
            <div>
              <p className={`${landingHeadlineSm} text-sm text-[#03113c]`}>Service areas</p>
              <p className={`${landingBody} text-xs text-gray-500`}>Tap any card to post a task</p>
            </div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
        >
          {GRID_CATEGORIES.map((grid) => {
            const IconComponent = IconMap[grid.iconName] || Compass;

            return (
              <motion.button
                key={grid.id}
                variants={itemVariants}
                type="button"
                onClick={() => onSelectGridCategory(grid.name)}
                className="group relative flex min-h-[108px] cursor-pointer select-none flex-col justify-between overflow-hidden rounded-2xl border border-blue-100/70 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#005fff]/35 hover:shadow-[0_12px_40px_-12px_rgba(0,95,255,0.35)] focus:outline-none focus:ring-2 focus:ring-[#005fff]/40 active:scale-[0.99] sm:min-h-[120px] sm:p-5"
              >
                <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[#005fff]/5 transition-transform duration-500 group-hover:scale-125" />

                <div className="relative flex items-start justify-between gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#005fff]/10 to-[#E7F0FF] text-[#005fff] transition-colors duration-300 group-hover:from-[#005fff] group-hover:to-[#0047ff] group-hover:text-white sm:h-12 sm:w-12">
                    <IconComponent className="h-5 w-5 sm:h-[22px] sm:w-[22px]" />
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-blue-100/80 bg-white text-gray-400 transition-all duration-300 group-hover:border-[#005fff]/20 group-hover:bg-[#005fff] group-hover:text-white">
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </div>

                <div className="relative mt-4 space-y-1">
                  <h3
                    className={`${landingHeadlineSm} text-base text-[#03113c] transition-colors duration-200 group-hover:text-[#005fff] sm:text-[17px]`}
                  >
                    {grid.name}
                  </h3>
                  <p className={`${landingBody} line-clamp-2 text-xs leading-snug text-gray-500 sm:text-[13px]`}>
                    {grid.tagline}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
