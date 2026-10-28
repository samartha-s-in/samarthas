"use client";

import React, { useEffect, useState } from 'react';
import { useTheme, ThemeMode } from './ThemeProvider';
import { Sun, Moon, Laptop } from 'lucide-react';
import styles from './ThemeToggle.module.css';

interface ThemeToggleProps {
  compact?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ compact = false }) => {
  const { mode, resolvedTheme, setMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={styles.skeletonToggle} aria-hidden="true">
        <span className={styles.placeholderDot} />
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={toggleTheme}
        className={styles.compactButton}
        title={`Theme: ${mode} (${resolvedTheme}). Click to cycle.`}
        aria-label={`Current theme is ${mode}. Click to toggle theme.`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className={styles.icon} size={18} />
        ) : (
          <Sun className={styles.icon} size={18} />
        )}
        <span className={styles.modeBadge}>{mode === 'system' ? 'SYS' : mode.toUpperCase()}</span>
      </button>
    );
  }

  const modes: { id: ThemeMode; label: string; icon: React.ReactNode }[] = [
    { id: 'light', label: 'Light', icon: <Sun size={15} /> },
    { id: 'system', label: 'System', icon: <Laptop size={15} /> },
    { id: 'dark', label: 'Dark', icon: <Moon size={15} /> },
  ];

  return (
    <div className={styles.segmentedControl} role="radiogroup" aria-label="Theme selector">
      {modes.map((item) => {
        const isActive = mode === item.id;
        return (
          <button
            key={item.id}
            role="radio"
            aria-checked={isActive}
            className={`${styles.segmentButton} ${isActive ? styles.active : ''}`}
            onClick={() => setMode(item.id)}
            title={`Switch to ${item.label} theme`}
          >
            {item.icon}
            <span className={styles.segmentLabel}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ThemeToggle;
