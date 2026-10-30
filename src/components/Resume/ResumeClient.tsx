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
import styles from '@/app/resume/Resume.module.css';

export default function ResumeClient() {
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
    <>
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
              <a href={`tel:${personalInfo.phone.replace(/[^0-9+]/g, '')}`}>
                {personalInfo.phone}
              </a>
            </div>
            <div className={styles.cvContactItem}>
              <MapPin size={15} />
              <span>{personalInfo.location}</span>
            </div>
          </div>

          {/* Executive Summary */}
          <div className={styles.cvSection}>
            <h3 className={styles.cvSectionTitle}>
              <BookOpen size={18} />
              <span>Executive Profile</span>
            </h3>
            <p className={styles.cvSummaryText}>{personalInfo.bio}</p>
          </div>

          {/* Work Experience */}
          <div className={styles.cvSection}>
            <h3 className={styles.cvSectionTitle}>
              <Briefcase size={18} />
              <span>Professional &amp; Research Experience</span>
            </h3>
            <div className={styles.cvTimeline}>
              {workExperience.map((job, idx) => (
                <div key={idx} className={styles.cvTimelineItem}>
                  <div className={styles.cvTimelineHeader}>
                    <div>
                      <h4 className={styles.cvRole}>{job.role}</h4>
                      <h5 className={styles.cvCompany}>
                        {job.company} {job.department && `• ${job.department}`}
                      </h5>
                    </div>
                    <div className={styles.cvTimelineDate}>
                      <span>{job.period}</span>
                      <span className={styles.cvLocation}>{job.location}</span>
                    </div>
                  </div>
                  <p className={styles.cvJobDesc}>{job.description}</p>
                  <ul className={styles.cvBullets}>
                    {job.highlights.map((h, hIdx) => (
                      <li key={hIdx}>
                        <CheckCircle2 size={13} className={styles.cvCheck} />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Published Research */}
          <div className={styles.cvSection}>
            <h3 className={styles.cvSectionTitle}>
              <BookOpen size={18} />
              <span>Academic Publications</span>
            </h3>
            <div className={styles.cvPubCard}>
              <h4 className={styles.cvPubTitle}>{publications[0].title}</h4>
              <p className={styles.cvPubVenue}>
                {publications[0].journal} ({publications[0].year}) • {publications[0].publisher}
              </p>
              <p className={styles.cvPubAuthors}>
                Authors: {publications[0].authors.join(', ')}
              </p>
              <p className={styles.cvPubCitation}>
                <strong>Citation:</strong> {publications[0].citation}
              </p>
            </div>
          </div>

          {/* Education */}
          <div className={styles.cvSection}>
            <h3 className={styles.cvSectionTitle}>
              <GraduationCap size={18} />
              <span>Education &amp; Credentials</span>
            </h3>
            <div className={styles.cvTimeline}>
              {educationList.map((edu, idx) => (
                <div key={idx} className={styles.cvTimelineItem}>
                  <div className={styles.cvTimelineHeader}>
                    <div>
                      <h4 className={styles.cvRole}>{edu.degree}</h4>
                      <h5 className={styles.cvCompany}>{edu.institution}</h5>
                    </div>
                    <div className={styles.cvTimelineDate}>
                      <span>{edu.period}</span>
                      <span className={styles.cvGrade}>{edu.grade}</span>
                    </div>
                  </div>
                  <p className={styles.cvJobDesc}>{edu.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technical Skills Overview */}
          <div className={styles.cvSection}>
            <h3 className={styles.cvSectionTitle}>
              <Layers size={18} />
              <span>Core Technical Competencies</span>
            </h3>
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
    </>
  );
}
