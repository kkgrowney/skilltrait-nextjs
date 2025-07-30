'use client';

import { usePathname } from 'next/navigation';
import Navigation from './Navigation';

// List of pages where we don't want to show the Next.js navigation
  const hideNavigationPages = ['/', '/achievements', '/award-templates', '/pricing', '/signin', '/signup', '/send-props', '/app', '/dashboard', '/digital-awards-generator'];

export default function NavigationWrapper() {
  const pathname = usePathname();
  
  // Don't show Next.js navigation on iframe pages and sign-in page
  if (hideNavigationPages.includes(pathname)) {
    return null;
  }
  
  return <Navigation />;
} 