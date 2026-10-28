"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export const PageAnimation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();

  // Route transition effect & Scroll Reveal Observer
  useEffect(() => {
    // 1. Setup Intersection Observer for scroll-triggered card and section animations
    const observerCallback: IntersectionObserverCallback = (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      root: null,
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.05,
    });

    // Automatically observe elements with reveal classes or common cards
    const targets = document.querySelectorAll(
      '.reveal-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-stagger, .glass-panel'
    );

    targets.forEach((el, index) => {
      // Add stagger delay attribute if part of a list
      if (!el.getAttribute('style') || !el.getAttribute('style')?.includes('--stagger-delay')) {
        const staggerIndex = (index % 6) * 0.08;
        (el as HTMLElement).style.setProperty('--stagger-delay', `${staggerIndex}s`);
      }
      observer.observe(el);
    });

    return () => {
      observer.disconnect();
    };
  }, [pathname]);

  return (
    <div key={pathname} className="page-transition-container">
      {children}
    </div>
  );
};

export default PageAnimation;
