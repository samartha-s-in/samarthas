"use client";

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  personalInfo,
  workExperience,
  educationList,
  skillCategories,
  publications,
} from '@/lib/portfolioData';
import {
  FileDown,
  Printer,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  BookOpen,
  Briefcase,
  GraduationCap,
  Layers,
} from 'lucide-react';
import styles from './Resume.module.css';

export default function ResumePage() {
  const [viewMode, setViewMode] = useState<'interactive' | 'pdf'>('interactive');
  const resumeUrl = '/SamarthaS_CV.pdf';

  const handleDownload = () => {
    confetti({
      particleCount: 90,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00e5ff', '#3b82f6', '#8b5cf6', '#10b981'],
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`container ${styles.resumePage}`}>
      {/* Header and Controls */}
      <div className={`glass-panel ${styles.headerCard} reveal-up`}>
        <div className={styles.headerInfo}>
          <span className={styles.eyebrow}>CURRICULUM VITAE</span>
          <h1 className={styles.title}>{personalInfo.name}</h1>
          <p className={styles.subtitle}>
            {personalInfo.title} • {personalInfo.location}
          </p>
        </div>

        <div className={styles.controlsRow}>
          {/* Mode Switcher */}
          <div className={styles.modeSwitch}>
            <button
              className={`${styles.modeBtn} ${viewMode === 'interactive' ? styles.activeMode : ''}`}
              onClick={() => setViewMode('interactive')}
            >
              Interactive Profile
            </button>
            <button
              className={`${styles.modeBtn} ${viewMode === 'pdf' ? styles.activeMode : ''}`}
              onClick={() => setViewMode('pdf')}
            >
              Embedded PDF
            </button>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button onClick={handlePrint} className="btn-secondary" title="Print Resume">
              <Printer size={16} />
              <span>Print</span>
            </button>

            <a
              href={resumeUrl}
              download="SamarthaS_CV.pdf"
              onClick={handleDownload}
              className="btn-primary"
            >
              <FileDown size={16} />
              <span>Download PDF</span>
            </a>
          </div>
        </div>
      </div>

      {/* View Mode 1: Interactive ATS-Optimized Web CV */}
      {viewMode === 'interactive' && (
        <div className={`glass-panel ${styles.interactiveDoc}`}>
          {/* Contact Bar */}
          <div className={styles.cvContactBar}>
            <div className={styles.cvContactItem}>
              <Mail size={15} />
              <a href={`mailto:${personalInfo.email}`}>{personalInfo.email}</a>
            </div>
            <div className={styles.cvContactItem}>
              <Phone size={15} />
              <a href={`tel:${personalInfo.phone.replace(/[^0-9+]/g, '')}`}>{personalInfo.phone}</a>
            </div>
            <div className={styles.cvContactItem}>
              <MapPin size={15} />
              <span>{personalInfo.location}</span>
            </div>
          </div>

          {/* Summary */}
          <div className={styles.cvSection}>
            <h2 className={styles.cvHeading}>Professional Summary</h2>
            <p className={styles.cvText}>{personalInfo.bio}</p>
          </div>

          {/* Work Experience */}
          <div className={styles.cvSection}>
            <div className={styles.cvHeadingRow}>
              <Briefcase size={20} className={styles.headingIcon} />
              <h2 className={styles.cvHeading}>Work Experience</h2>
            </div>
            <div className={styles.cvList}>
              {workExperience.map((job, idx) => (
                <div key={idx} className={styles.cvItem}>
                  <div className={styles.cvItemHead}>
                    <div>
                      <h3 className={styles.cvItemRole}>{job.role}</h3>
                      <h4 className={styles.cvItemCompany}>{job.company}</h4>
                    </div>
                    <div className={styles.cvItemMeta}>
                      <span className={styles.cvPeriod}>{job.period}</span>
                      <span className={styles.cvLocation}>{job.location}</span>
                    </div>
                  </div>
                  <p className={styles.cvItemDesc}>{job.description}</p>
                  <ul className={styles.cvHighlights}>
                    {job.highlights.map((h, hIdx) => (
                      <li key={hIdx}>
                        <CheckCircle2 size={14} className={styles.cvCheck} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Research Publications */}
          <div className={styles.cvSection}>
            <div className={styles.cvHeadingRow}>
              <BookOpen size={20} className={styles.headingIcon} />
              <h2 className={styles.cvHeading}>Peer-Reviewed Publications</h2>
            </div>
            <div className={styles.cvItem}>
              <h3 className={styles.cvItemRole}>{publications[0].title}</h3>
              <p className={styles.cvItemCompany}>
                {publications[0].journal} • {publications[0].pages} ({publications[0].year})
              </p>
              <p className={styles.cvItemDesc}>{publications[0].abstract}</p>
            </div>
          </div>

          {/* Education */}
          <div className={styles.cvSection}>
            <div className={styles.cvHeadingRow}>
              <GraduationCap size={20} className={styles.headingIcon} />
              <h2 className={styles.cvHeading}>Education &amp; Training</h2>
            </div>
            <div className={styles.cvList}>
              {educationList.map((edu, idx) => (
                <div key={idx} className={styles.cvItem}>
                  <div className={styles.cvItemHead}>
                    <div>
                      <h3 className={styles.cvItemRole}>{edu.degree}</h3>
                      <h4 className={styles.cvItemCompany}>{edu.institution}</h4>
                    </div>
                    <div className={styles.cvItemMeta}>
                      <span className={styles.cvGradeBadge}>{edu.grade}</span>
                      <span className={styles.cvPeriod}>{edu.period}</span>
                    </div>
                  </div>
                  <p className={styles.cvItemDesc}>{edu.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Categorized */}
          <div className={styles.cvSection}>
            <div className={styles.cvHeadingRow}>
              <Layers size={20} className={styles.headingIcon} />
              <h2 className={styles.cvHeading}>Technical Skills</h2>
            </div>
            <div className={styles.cvSkillsGrid}>
              {skillCategories.map((cat) => (
                <div key={cat.name} className={styles.cvSkillBox}>
                  <h4 className={styles.cvSkillCategory}>{cat.name}</h4>
                  <p className={styles.cvSkillList}>
                    {cat.skills.map((s) => s.name).join(' • ')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* View Mode 2: Embedded PDF Viewer */}
      {viewMode === 'pdf' && (
        <div className={`glass-panel ${styles.pdfViewerCard}`}>
          <object
            data={resumeUrl}
            type="application/pdf"
            width="100%"
            height="100%"
            className={styles.pdfObject}
            aria-label="Samartha S Resume PDF"
          >
            <div className={styles.fallbackMsg}>
              <p>Your browser doesn&apos;t support direct PDF embedding.</p>
              <a href={resumeUrl} download="SamarthaS_CV.pdf" className="btn-primary">
                <FileDown size={16} />
                <span>Download CV Directly</span>
              </a>
            </div>
          </object>
        </div>
      )}
    </div>
  );
}