"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  personalInfo,
  workExperience,
  educationList,
} from '@/lib/portfolioData';
import Card3DTilt from '@/components/Spatial/Card3DTilt';
import BorderBeam from '@/components/Spatial/BorderBeam';
import {
  Bot,
  GraduationCap,
  Briefcase,
  MapPin,
  ExternalLink,
  Languages,
  Heart,
  FileDown,
  CheckCircle2,
  Mail,
  Award,
} from 'lucide-react';
import styles from './About.module.css';

export default function AboutPage() {
  return (
    <div className={`container ${styles.aboutPage}`}>
      {/* Header Profile Hero */}
      <Card3DTilt intensity={8}>
        <section className={`glass-panel ${styles.introCard}`}>
          <BorderBeam size={200} duration={8} />
          <div className={styles.introFlex}>
          <div className={styles.avatarWrapper}>
            <Image
              src="/samartha.png"
              alt="Samartha S - Robotics Engineer"
              width={220}
              height={220}
              priority
              className={styles.avatarImg}
            />
            <div className={styles.avatarBadge}>
              <Bot size={16} />
              <span>Robotics &amp; AI</span>
            </div>
          </div>

          <div className={styles.introInfo}>
            <div className="status-pill">
              <span className="pulse-dot" />
              <span>Robotics Engineer &amp; Researcher</span>
            </div>

            <h1 className={styles.introName}>{personalInfo.name}</h1>
            <h2 className={styles.introTitle}>
              <span className="gradient-text">{personalInfo.title}</span>
            </h2>

            <p className={styles.introBio}>
              {personalInfo.bio}
            </p>

            <div className={styles.quickDetailsRow}>
              <div className={styles.detailPill}>
                <MapPin size={14} />
                <span>{personalInfo.location}</span>
              </div>
              <div className={styles.detailPill}>
                <Award size={14} />
                <span>REVA Univ (8.21 CGPA)</span>
              </div>
              <div className={styles.detailPill}>
                <Mail size={14} />
                <span>{personalInfo.email}</span>
              </div>
            </div>

            <div className={styles.introActions}>
              <Link href="/contact" className="btn-primary">
                <span>Connect with Me</span>
              </Link>
              <a
                href={personalInfo.resumePdf}
                download="SamarthaS_CV.pdf"
                className="btn-secondary"
              >
                <FileDown size={16} />
                <span>Download Full CV</span>
              </a>
            </div>
          </div>
        </div>
      </section>
      </Card3DTilt>

      {/* Work Experience & Research Timeline */}
      <section id="experience" className={`${styles.sectionBlock} reveal-up`}>
        <div className={styles.sectionHeader}>
          <div className={styles.iconCircle}>
            <Briefcase size={22} />
          </div>
          <div>
            <span className={styles.eyebrow}>CAREER CHRONOLOGY</span>
            <h2 className={styles.sectionTitle}>
              Work Experience &amp; <span className="gradient-text">Research Fellowship</span>
            </h2>
          </div>
        </div>

        <div className={`${styles.timelineContainer} reveal-stagger`}>
          {workExperience.map((exp, idx) => (
            <Card3DTilt key={idx} intensity={8}>
              <div className={`glass-panel ${styles.timelineItem}`}>
                <div className={styles.itemHeader}>
                <div>
                  <span className={styles.typeTag}>{exp.type}</span>
                  <h3 className={styles.itemRole}>{exp.role}</h3>
                  <h4 className={styles.itemOrg}>
                    {exp.company} {exp.department ? `• ${exp.department}` : ''}
                  </h4>
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.itemPeriod}>{exp.period}</span>
                  <span className={styles.itemLocation}>{exp.location}</span>
                </div>
              </div>

              <p className={styles.itemDescription}>{exp.description}</p>

              <ul className={styles.itemHighlights}>
                {exp.highlights.map((h, hIdx) => (
                  <li key={hIdx}>
                    <CheckCircle2 size={15} className={styles.bulletCheck} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {exp.link && (
                <div className={styles.itemFooter}>
                  <a
                    href={exp.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.certLink}
                  >
                    <ExternalLink size={14} />
                    <span>View Official Association Verification</span>
                  </a>
                </div>
              )}
            </div>
            </Card3DTilt>
          ))}
        </div>
      </section>

      {/* Education & Academic Foundation */}
      <section className={`${styles.sectionBlock} reveal-up`}>
        <div className={styles.sectionHeader}>
          <div className={styles.iconCircle}>
            <GraduationCap size={22} />
          </div>
          <div>
            <span className={styles.eyebrow}>ACADEMIC EXCELLENCE</span>
            <h2 className={styles.sectionTitle}>
              Education &amp; <span className="gradient-text">Engineering Training</span>
            </h2>
          </div>
        </div>

        <div className={`${styles.timelineContainer} reveal-stagger`}>
          {educationList.map((edu, idx) => (
            <Card3DTilt key={idx} intensity={8}>
              <div className={`glass-panel ${styles.timelineItem}`}>
                <div className={styles.itemHeader}>
                  <div>
                    <h3 className={styles.itemRole}>{edu.degree}</h3>
                  <h4 className={styles.itemOrg}>
                    {edu.institution} • {edu.location}
                  </h4>
                </div>
                <div className={styles.itemMeta}>
                  <span className={styles.gradeBadge}>{edu.grade}</span>
                  <span className={styles.itemPeriod}>{edu.period}</span>
                </div>
              </div>

              <p className={styles.itemDescription}>{edu.details}</p>

              <ul className={styles.itemHighlights}>
                {edu.highlights.map((h, hIdx) => (
                  <li key={hIdx}>
                    <CheckCircle2 size={15} className={styles.bulletCheck} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
            </Card3DTilt>
          ))}
        </div>
      </section>

      {/* Languages & Interests Grid */}
      <section className={`${styles.dualBlock} reveal-up`}>
        {/* Languages */}
        <div className={`glass-panel ${styles.sideCard}`}>
          <div className={styles.sideCardHeader}>
            <Languages size={20} className={styles.sideIcon} />
            <h3 className={styles.sideTitle}>Language Proficiency</h3>
          </div>
          <div className={styles.languagesList}>
            {personalInfo.languages.map((lang) => (
              <div key={lang.language} className={styles.languageRow}>
                <span className={styles.langName}>{lang.language}</span>
                <span className={styles.langProficiency}>{lang.proficiency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Interests & Pursuits */}
        <div className={`glass-panel ${styles.sideCard}`}>
          <div className={styles.sideCardHeader}>
            <Heart size={20} className={styles.sideIcon} />
            <h3 className={styles.sideTitle}>Technical Pursuits &amp; Interests</h3>
          </div>
          <div className={styles.interestsList}>
            {personalInfo.interests.map((interest, idx) => (
              <div key={idx} className={styles.interestPill}>
                <span className="pulse-dot" />
                <span>{interest}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}