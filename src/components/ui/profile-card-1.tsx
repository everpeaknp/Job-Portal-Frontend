'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, type LucideIcon } from 'lucide-react';

export interface SocialLink {
  id: string;
  icon: LucideIcon;
  label: string;
  href: string;
}

export interface ActionButtonProps {
  text: string;
  href: string;
}

export interface GlassmorphismProfileCardProps {
  avatarUrl?: string | null;
  name: string;
  title: string;
  bio?: string;
  socialLinks?: SocialLink[];
  actionButton: ActionButtonProps;
  className?: string;
}

export function GlassmorphismProfileCard({
  avatarUrl,
  name,
  title,
  bio = '',
  socialLinks = [],
  actionButton,
  className,
}: GlassmorphismProfileCardProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const initial = (name.trim().charAt(0) || 'U').toUpperCase();
  const fallbackAvatar = `https://placehold.co/96x96/6366f1/white?text=${encodeURIComponent(initial)}`;

  return (
    <div className={`relative h-full w-full ${className ?? ''}`}>
      <div
        className="relative flex h-full min-h-[420px] flex-col items-center rounded-3xl border border-white/10 bg-card/40 p-8 backdrop-blur-xl transition-all duration-500 ease-out"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)' }}
      >
        <div className="mb-4 h-24 w-24 shrink-0 rounded-full border-2 border-white/20 p-1">
          <img
            src={avatarUrl || fallbackAvatar}
            alt={`${name}'s avatar`}
            className="h-full w-full rounded-full object-cover"
            onError={(e) => {
              const img = e.currentTarget;
              img.onerror = null;
              img.src = fallbackAvatar;
            }}
          />
        </div>

        <h2 className="line-clamp-2 w-full text-center text-2xl font-bold text-card-foreground">
          {name}
        </h2>
        <p className="mt-1 line-clamp-2 w-full text-center text-sm font-medium text-primary">
          {title}
        </p>

        <p className="mt-4 min-h-[4.5rem] w-full text-center text-sm leading-relaxed text-muted-foreground line-clamp-3">
          {bio || 'No bio yet.'}
        </p>

        <div className="mt-auto flex w-full flex-col items-center pt-6">
          <div className="mb-6 h-px w-1/2 rounded-full bg-border" />
          <div className="flex min-h-12 items-center justify-center gap-3">
            {socialLinks.map((item) => (
              <SocialButton
                key={item.id}
                item={item}
                setHoveredItem={setHoveredItem}
                hoveredItem={hoveredItem}
              />
            ))}
          </div>
          <ActionButton action={actionButton} />
        </div>
      </div>

      <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-500/50 to-purple-500/50 opacity-30 blur-2xl transition-all duration-500 ease-out" />
    </div>
  );
}

function SocialButton({
  item,
  setHoveredItem,
  hoveredItem,
}: {
  item: SocialLink;
  setHoveredItem: (id: string | null) => void;
  hoveredItem: string | null;
}) {
  const Icon = item.icon;
  const className =
    'group relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-secondary/50 transition-all duration-300 ease-out hover:bg-secondary';
  const iconEl = (
    <Icon
      size={20}
      className="text-secondary-foreground/70 transition-all duration-200 ease-out group-hover:text-secondary-foreground"
    />
  );

  return (
    <div className="relative">
      {item.href === '#' ? (
        <button
          type="button"
          className={className}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          aria-label={item.label}
        >
          {iconEl}
        </button>
      ) : (
        <a
          href={item.href}
          className={className}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          aria-label={item.label}
          target={item.href.startsWith('http') ? '_blank' : undefined}
          rel={item.href.startsWith('http') ? 'noopener noreferrer' : undefined}
        >
          {iconEl}
        </a>
      )}
      <Tooltip item={item} hoveredItem={hoveredItem} />
    </div>
  );
}

function ActionButton({ action }: { action: ActionButtonProps }) {
  return (
    <Link
      href={action.href}
      className="group mt-6 flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-base font-semibold text-primary-foreground backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.03] active:scale-95"
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}
    >
      <span>{action.text}</span>
      <ArrowUpRight
        size={16}
        className="transition-transform duration-300 ease-out group-hover:rotate-45"
      />
    </Link>
  );
}

function Tooltip({
  item,
  hoveredItem,
}: {
  item: SocialLink;
  hoveredItem: string | null;
}) {
  return (
    <div
      role="tooltip"
      className={`pointer-events-none absolute -top-12 left-1/2 z-50 -translate-x-1/2 whitespace-nowrap rounded-lg border border-border bg-popover px-3 py-1.5 text-xs font-medium text-popover-foreground backdrop-blur-md transition-all duration-300 ease-out ${
        hoveredItem === item.id ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
      }`}
      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
    >
      {item.label}
      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-border bg-popover" />
    </div>
  );
}

/** Demo wrapper (optional preview). */
export function ProfileCardDemo() {
  const cardProps: GlassmorphismProfileCardProps = {
    avatarUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    name: 'Ravi Katiyar',
    title: 'Sr. Designer',
    bio: 'Building beautiful and intuitive digital experiences. Passionate about design systems and web animation.',
    actionButton: { text: 'View profile', href: '#' },
  };

  return <GlassmorphismProfileCard {...cardProps} />;
}

export function Component() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4 font-sans transition-colors duration-500 sm:p-8">
      <ProfileCardDemo />
    </div>
  );
}
