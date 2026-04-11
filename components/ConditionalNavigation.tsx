'use client';

import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function ConditionalNavigation() {
  const pathname = usePathname();

  // Coding interview pages use a dedicated in-page navbar.
  if (pathname.startsWith('/coding-interview')) {
    return null;
  }

  return (
    <>
      <Navigation />
      <div className="h-6" />
    </>
  );
}
