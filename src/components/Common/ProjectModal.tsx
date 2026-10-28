"use client";

import React, { useEffect } from 'react';
import { Project } from '@/lib/portfolioData';
import { GithubIcon } from '@/components/Common/Icons';
import { X, ExternalLink, CheckCircle2, Calendar, Share2 } from 'lucide-react';
import styles from './ProjectModal.module.css';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.classList.add('no-scroll');
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.classList.remove('no-scroll');
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  return (
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close project modal">
          <X size={20} />
        </button>

        <div className={styles.header}>
          <div className={styles.categoryPill}>{project.category}</div>
          <h2 className={styles.title}>{project.title}</h2>
          <p className={styles.tagline}>{project.tagline}</p>
          {project.date && (
            <div className={styles.dateRow}>
              <Calendar size={14} />
              <span>{project.date}</span>
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Overview</h3>
            <p className={styles.description}>
              {project.longDescription || project.description}
            </p>
          </div>

          {project.highlights && project.highlights.length > 0 && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Key Technical Accomplishments</h3>
              <ul className={styles.highlightsList}>
                {project.highlights.map((item, idx) => (
                  <li key={idx} className={styles.highlightItem}>
                    <CheckCircle2 size={16} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Technology Stack</h3>
            <div className={styles.techGrid}>
              {project.techStack.map((tech) => (
                <span key={tech} className="tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <div className={styles.actions}>
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <span>View Project Demo / Drive</span>
                <ExternalLink size={16} />
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                <GithubIcon size={16} />
                <span>View Source Code</span>
              </a>
            )}
            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(window.location.origin + `/projects/${project.slug}`);
                  alert('Project link copied to clipboard!');
                }
              }}
              className="btn-ghost"
              title="Copy share link"
            >
              <Share2 size={16} />
              <span>Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectModal;
