"use client"

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import styles from './Home.module.css';
// import Image from 'next/image'; // We can add this later for your headshot

export default function HomePage() {
  const contentRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(contentRef.current, 
        { y: 40, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 1.2, ease: 'power3.out' }
    );
  }, []);

  return (
    <div className="container">
      <section className={styles.hero}>
        <div ref={contentRef} className={styles.heroContent}>
          <h1 className={styles.headline}>
            Robotic Engineer
          </h1>
          <p className={styles.subheadline}>
            I am leading a team dedicated to pioneering the next generation of intelligent robotic systems, driving innovation and transforming industries.
          </p>
          <div className={styles.ctaButtons}>
            <Link href="/projects" className={styles.ctaPrimary}>
              Our Work
            </Link>
            <Link href="/contact" className={styles.ctaSecondary}>
              Get In Touch
            </Link>
          </div>
        </div>
        
        {/*
          <div className={styles.heroImage}>
            A professional headshot would be perfect here.
            <Image src="/your-photo.jpg" alt="Samartha S, Founder and CEO" width={400} height={400} />
          </div>
        */}
      </section>
    </div>
  );
}