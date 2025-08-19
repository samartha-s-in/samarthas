"use client";

import { useState, useMemo } from 'react';
import { projects, Project } from '@/lib/projectsData';
import styles from './Projects.module.css';
import Link from 'next/link';

// Component for a single project card
const ProjectCard = ({ project }: { project: Project }) => (
  <Link href={`/projects/${project.slug}`} className={styles.card}>
    <div>
      <h3 className={styles.cardTitle}>{project.title}</h3>
      <p className={styles.cardTagline}>{project.tagline}</p>
    </div>
    <div className={styles.techStack}>
      {project.techStack.slice(0, 4).map(tech => (
        <span key={tech} className={styles.techChip}>{tech}</span>
      ))}
    </div>
  </Link>
);

export default function ProjectsPage() {
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const categories = ['All', 'Robotics & ROS', 'AI & CV', 'IoT', 'CAD'];

  const filteredProjects = useMemo(() => {
    if (activeFilter === 'All') {
      return projects;
    }
    return projects.filter(p => p.category === activeFilter);
  }, [activeFilter]);

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Our Work & Innovations</h1>
      <p className={styles.pageSubtitle}>
        A selection of projects that demonstrate our expertise in robotics, artificial intelligence, and automation.
      </p>

      {/* Filter Buttons */}
      <div className={styles.filterContainer}>
        {categories.map(category => (
          <button
            key={category}
            className={`${styles.filterButton} ${activeFilter === category ? styles.active : ''}`}
            onClick={() => setActiveFilter(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className={styles.projectsGrid}>
        {filteredProjects.map(project => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </div>
  );
}