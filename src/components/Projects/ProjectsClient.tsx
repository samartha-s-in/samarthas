"use client";

import React, { useState, useMemo } from 'react';
import { projects } from '@/lib/portfolioData';
import { Project } from '@/lib/portfolioData';
import ProjectModal from '@/components/Common/ProjectModal';
import { GithubIcon } from '@/components/Common/Icons';
import Card3DTilt from '@/components/Spatial/Card3DTilt';
import BorderBeam from '@/components/Spatial/BorderBeam';
import {
  ExternalLink,
  ArrowRight,
  Search,
  Calendar,
} from 'lucide-react';
import styles from '@/app/projects/Projects.module.css';

export default function ProjectsClient() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const categories = [
    'All',
    'Robotics & ROS',
    'Drones & UAVs',
    'AI & CV',
    'Embedded & IoT',
    'CAD & 3D',
    'Web Dev',
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesCategory = activeFilter === 'All' || project.category === activeFilter;
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        project.title.toLowerCase().includes(query) ||
        project.tagline.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query) ||
        project.techStack.some((tech) => tech.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  return (
    <>
      {/* Filter and Search Bar */}
      <div className={`${styles.controlBar} reveal-up`}>
        <div className={styles.categoryFilters}>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.filterButton} ${activeFilter === category ? styles.activeFilter : ''}`}
              onClick={() => setActiveFilter(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search projects by tech (e.g. ROS, LiDAR)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className={`${styles.grid} reveal-stagger`}>
        {filteredProjects.length > 0 ? (
          filteredProjects.map((project) => (
            <Card3DTilt key={project.slug} intensity={10}>
              <div className={`glass-panel ${styles.card}`}>
                <BorderBeam size={140} duration={8} />
                <div className={styles.cardHeader}>
                  <span className={styles.categoryBadge}>{project.category}</span>
                  {project.date && (
                    <span className={styles.dateLabel}>
                      <Calendar size={12} />
                      {project.date}
                    </span>
                  )}
                </div>

                <h2 className={styles.cardTitle}>{project.title}</h2>
                <p className={styles.cardTagline}>{project.tagline}</p>
                <p className={styles.cardDescription}>{project.description}</p>

                <div className={styles.techStack}>
                  {project.techStack.map((tech) => (
                    <span key={tech} className="tech-chip">
                      {tech}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <button
                    onClick={() => setSelectedProject(project)}
                    className={styles.specsBtn}
                  >
                    <span>System Architecture</span>
                    <ArrowRight size={14} />
                  </button>

                  <div className={styles.linksCluster}>
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionIcon}
                        title="View Demo / Google Drive Files"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.actionIcon}
                        title="View GitHub Repository"
                      >
                        <GithubIcon size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </Card3DTilt>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No projects matched your search criteria.</p>
            <button
              onClick={() => {
                setActiveFilter('All');
                setSearchQuery('');
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Project Detail Modal */}
      <ProjectModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
      />
    </>
  );
}
