"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export type ThemeMode = 'system' | 'dark' | 'light';
export type ResolvedTheme = 'dark' | 'light';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark');

  // Apply theme to document element
  const applyTheme = useCallback((activeTheme: ResolvedTheme, activeMode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', activeTheme);
    root.setAttribute('data-mode', activeMode);
    root.style.colorScheme = activeTheme;
  }, []);

  // Update theme when mode changes or system changes
  const updateTheme = useCallback((targetMode: ThemeMode) => {
    let resolved: ResolvedTheme = 'dark';

    if (targetMode === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      resolved = prefersDark ? 'dark' : 'light';
    } else {
      resolved = targetMode;
    }

    setResolvedTheme(resolved);
    applyTheme(resolved, targetMode);
  }, [applyTheme]);

  // Set mode and persist to localStorage
  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem('theme-preference', newMode);
    updateTheme(newMode);
  }, [updateTheme]);

  // Quick cycle: system -> dark -> light -> system
  const toggleTheme = useCallback(() => {
    const nextModeMap: Record<ThemeMode, ThemeMode> = {
      system: 'dark',
      dark: 'light',
      light: 'system',
    };
    const next = nextModeMap[mode] || 'system';
    setMode(next);
  }, [mode, setMode]);

  useEffect(() => {
    // Check stored preference or default to system
    const saved = localStorage.getItem('theme-preference') as ThemeMode | null;
    const initialMode: ThemeMode = (saved === 'dark' || saved === 'light' || saved === 'system') ? saved : 'system';
    setModeState(initialMode);
    updateTheme(initialMode);

    // Media query listener for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemChange = (e: MediaQueryListEvent) => {
      const currentSaved = localStorage.getItem('theme-preference');
      if (!currentSaved || currentSaved === 'system') {
        const sysTheme: ResolvedTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(sysTheme);
        applyTheme(sysTheme, 'system');
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    return () => mediaQuery.removeEventListener('change', handleSystemChange);
  }, [updateTheme, applyTheme]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedTheme, setMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};