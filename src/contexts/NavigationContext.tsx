'use client';

import { createContext, useContext, useState } from 'react';

type ViewType = 'home' | 'digital-awards';

interface NavigationContextType {
  isCollapsed: boolean;
  currentView: ViewType;
  toggleCollapsed: () => void;
  setCurrentView: (view: ViewType) => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isCollapsed: false,
  currentView: 'home',
  toggleCollapsed: () => {},
  setCurrentView: () => {},
});

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
};

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<ViewType>('home');

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <NavigationContext.Provider value={{ 
      isCollapsed, 
      currentView, 
      toggleCollapsed, 
      setCurrentView 
    }}>
      {children}
    </NavigationContext.Provider>
  );
} 