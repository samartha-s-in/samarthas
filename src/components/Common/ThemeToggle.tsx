"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useTheme, ThemeMode } from './ThemeProvider';
import { Sun, Moon, Laptop, Check } from 'lucide-react';
import styles from './ThemeToggle.module.css';

export const ThemeToggle: React.FC = () => {
  const { mode, resolvedTheme, setMode } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div className={styles.iconButtonSkeleton} aria-hidden="true">
        <span className={styles.placeholderDot} />
      </div>
    );
  }

  // Get active display icon
  const getDisplayIcon = () => {
    if (mode === 'system') {
      return <Laptop size={18} className={styles.activeIcon} />;
    }
    if (mode === 'light') {
      return <Sun size={18} className={styles.activeIcon} />;
    }
    return <Moon size={18} className={styles.activeIcon} />;
  };

  const options: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'light', label: 'Light', icon: <Sun size={16} />, desc: 'Bright & clean' },
    { id: 'dark', label: 'Dark', icon: <Moon size={16} />, desc: 'Cyber obsidian' },
    { id: 'system', label: 'System', icon: <Laptop size={16} />, desc: 'Matches device' },
  ];

  return (
    <div className={styles.dropdownContainer} ref={dropdownRef}>
      {/* Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`${styles.iconButton} ${isOpen ? styles.iconButtonActive : ''}`}
        aria-label={`Current theme: ${mode} (${resolvedTheme}). Click to change.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title={`Theme: ${mode === 'system' ? 'System Default' : mode.charAt(0).toUpperCase() + mode.slice(1)}`}
      >
        {getDisplayIcon()}
        {mode === 'system' && <span className={styles.systemDot} title="System theme active" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={styles.menu} role="menu" aria-orientation="vertical">
          <div className={styles.menuHeader}>
            <span>APPEARANCE</span>
          </div>

          <div className={styles.optionsList}>
            {options.map((item) => {
              const isSelected = mode === item.id;
              return (
                <button
                  key={item.id}
                  role="menuitem"
                  className={`${styles.optionItem} ${isSelected ? styles.selectedOption : ''}`}
                  onClick={() => {
                    setMode(item.id);
                    setIsOpen(false);
                  }}
                >
                  <div className={styles.optionLeft}>
                    <span className={styles.optionIcon}>{item.icon}</span>
                    <div className={styles.optionText}>
                      <span className={styles.optionLabel}>{item.label}</span>
                      <span className={styles.optionDesc}>{item.desc}</span>
                    </div>
                  </div>

                  {isSelected && (
                    <span className={styles.checkIcon}>
                      <Check size={15} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeToggle;
