"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import ThemeToggle from '@/components/Common/ThemeToggle';
import { FileDown, Menu, X, Bot } from 'lucide-react';
import styles from './Header.module.css';

const Header = () => {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => document.body.classList.remove('no-scroll');
  }, [isMenuOpen]);

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/about', label: 'About & Journey' },
    { href: '/projects', label: 'Projects' },
    { href: '/#publication', label: 'IEEE Research' },
    { href: '/blog', label: 'Articles' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
      <nav className={`${styles.nav} container`}>
        {/* Logo & Identity */}
        <Link href="/" className={styles.logo} onClick={() => setIsMenuOpen(false)}>
          <div className={styles.logoIcon}>
            <Bot size={20} className={styles.botIcon} />
            <span className={styles.statusDot} />
          </div>
          <div className={styles.logoText}>
            <span className={styles.name}>Samartha S.</span>
            <span className={styles.roleTitle}>Robotics & AI</span>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <div className={styles.desktopNav}>
          <div className={styles.linksRow}>
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`${styles.navLink} ${isActive ? styles.activeLink : ''}`}
                >
                  {link.label}
                  {isActive && <span className={styles.activeIndicator} />}
                </Link>
              );
            })}
          </div>

          <div className={styles.actionCluster}>
            <ThemeToggle />
            <Link href="/resume" className={styles.resumeBtn}>
              <FileDown size={16} />
              <span>Resume</span>
            </Link>
          </div>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className={styles.mobileActions}>
          <ThemeToggle />
          <button
            className={styles.hamburger}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation drawer"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`${styles.mobileDrawer} ${isMenuOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerContent}>
          <div className={styles.drawerSectionHeader}>
            <span className={styles.sectionHeaderLabel}>NAVIGATION</span>
          </div>
          <div className={styles.drawerLinks}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`${styles.drawerLink} ${pathname === link.href ? styles.activeDrawerLink : ''}`}
                onClick={() => setIsMenuOpen(false)}
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className={styles.drawerFooter}>
            <div className={styles.themeRow}>
              <span className={styles.themeLabel}>Theme Preference</span>
              <ThemeToggle />
            </div>

            <Link
              href="/resume"
              className={styles.drawerResumeBtn}
              onClick={() => setIsMenuOpen(false)}
            >
              <FileDown size={18} />
              <span>Download Full CV (PDF)</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;