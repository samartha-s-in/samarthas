"use client";

import Link from 'next/link';
import { personalInfo } from '@/lib/portfolioData';
import { GithubIcon, LinkedinIcon } from '@/components/Common/Icons';
import { Mail, Phone, MapPin, ArrowUp, Bot, FileText } from 'lucide-react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContainer}`}>
        {/* Top Section */}
        <div className={styles.topRow}>
          <div className={styles.brandCol}>
            <div className={styles.brandLogo}>
              <Bot size={22} className={styles.botIcon} />
              <span className={styles.brandName}>Samartha S.</span>
            </div>
            <p className={styles.brandDesc}>
              Robotics &amp; AI Engineer | Autonomous Systems Specialist. Building next-generation mobile robots, autonomous drones, and embedded intelligence.
            </p>
            <div className={styles.locationPill}>
              <MapPin size={14} />
              <span>Bengaluru &amp; Vijayapura, Karnataka, India</span>
            </div>
          </div>

          <div className={styles.linksCol}>
            <h4 className={styles.colTitle}>Navigation</h4>
            <ul className={styles.linksList}>
              <li><Link href="/">Overview</Link></li>
              <li><Link href="/about">About &amp; Journey</Link></li>
              <li><Link href="/projects">Featured Projects</Link></li>
              <li><Link href="/#publication">IEEE Research</Link></li>
              <li><Link href="/resume">Curriculum Vitae</Link></li>
              <li><Link href="/contact">Get In Touch</Link></li>
            </ul>
          </div>

          <div className={styles.contactCol}>
            <h4 className={styles.colTitle}>Direct Connection</h4>
            <div className={styles.contactList}>
              <a href={`mailto:${personalInfo.email}`} className={styles.contactRow}>
                <Mail size={16} />
                <span>{personalInfo.email}</span>
              </a>
              <a href={`tel:${personalInfo.phone.replace(/[^0-9+]/g, '')}`} className={styles.contactRow}>
                <Phone size={16} />
                <span>{personalInfo.phone}</span>
              </a>
              <a href={personalInfo.resumePdf} download="SamarthaS_CV.pdf" className={styles.contactRow}>
                <FileText size={16} />
                <span>Download CV (PDF)</span>
              </a>
            </div>

            <div className={styles.socialButtons}>
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                title="GitHub"
                aria-label="GitHub Profile"
              >
                <GithubIcon size={18} />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialBtn}
                title="LinkedIn"
                aria-label="LinkedIn Profile"
              >
                <LinkedinIcon size={18} />
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                className={styles.socialBtn}
                title="Email"
                aria-label="Send Email"
              >
                <Mail size={18} />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            <span>&copy; {currentYear} Samartha S. All Rights Reserved. Built with Next.js &amp; TypeScript.</span>
          </div>

          <button
            onClick={scrollToTop}
            className={styles.backToTopBtn}
            title="Back to Top"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;