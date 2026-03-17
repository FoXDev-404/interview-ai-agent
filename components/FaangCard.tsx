'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DisplayTechIcons from './DisplayTechIcons';

interface FaangCardProps {
  name: string;
  logo: string;
  description: string;
  techstack: string[];
  role: string;
  type: string;
  glowColor: string;
  interviewUrl: string;
}

const FaangCard = ({
  name,
  logo,
  description,
  techstack,
  role,
  type,
  glowColor,
  interviewUrl,
}: FaangCardProps) => {
  return (
    <Link href={interviewUrl} className="group block">
      <div
        className="faang-card"
        style={{ '--glow': glowColor } as React.CSSProperties}
      >
        {/* Glow layer behind the card */}
        <div className="faang-card-glow" />

        {/* Glass surface */}
        <div className="faang-card-glass">
          {/* Top row: logo + badge */}
          <div className="flex items-center justify-between">
            <div className="faang-logo-wrap">
              <Image
                src={logo}
                alt={name}
                width={44}
                height={44}
                className="object-contain size-[44px] transition-transform duration-300 group-hover:scale-110"
              />
            </div>
            <span className="faang-badge">{type}</span>
          </div>

          {/* Company name */}
          <h3 className="text-[22px] font-bold tracking-tight text-white mt-5 mb-0.5">
            {name}
          </h3>

          {/* Role subtitle */}
          <p className="text-sm text-light-400 font-medium mb-3">{role}</p>

          {/* Description */}
          <p className="text-[13px] leading-relaxed text-light-100/70 line-clamp-2 mb-4">
            {description}
          </p>

          {/* Divider */}
          <div className="h-px w-full bg-gradient-to-r from-transparent via-light-600/40 to-transparent mb-4" />

          {/* Tech stack */}
          <div className="mb-5">
            <DisplayTechIcons techStack={techstack} />
          </div>

          {/* CTA button */}
          <div className="faang-cta">
            <span className="relative z-10 flex items-center justify-center gap-2 font-semibold text-sm">
              Start Interview
              <svg
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default FaangCard;
