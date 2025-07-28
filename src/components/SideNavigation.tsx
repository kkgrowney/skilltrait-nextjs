'use client';

import React from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import SideNavAuth from './side_nav_auth';
import SideNavCollapsed from './side_nav_collapsed';

export default function SideNavigation() {
  const { isCollapsed } = useNavigation();

  return isCollapsed ? <SideNavCollapsed /> : <SideNavAuth />;
}

// Hook to get the current margin for main content
export const useSideNavMargin = () => {
  const { isCollapsed } = useNavigation();
  return isCollapsed ? 'ml-[66px]' : 'ml-60';
}; 