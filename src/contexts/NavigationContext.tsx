'use client';

import { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  isCollapsed: boolean;
  toggleCollapsed: () => void;
}

const NavigationContext = createContext<NavigationContextType>({
  isCollapsed: false,
  toggleCollapsed: () => {},
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

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <NavigationContext.Provider value={{ isCollapsed, toggleCollapsed }}>
      {children}
    </NavigationContext.Provider>
  );
} 