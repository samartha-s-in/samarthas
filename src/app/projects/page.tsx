import type { Metadata } from 'next';
import ProjectsClient from '@/components/Projects/ProjectsClient';
import styles from './Projects.module.css';

export const metadata: Metadata = {
  title: 'Robotics & Autonomous Systems Projects',
  description:
    'Portfolio of production-grade robotics hardware, autonomous drone flight algorithms, computer vision pipelines, and embedded IoT architectures by Samartha S.',
  alternates: {
    canonical: 'https://samarthas.vercel.app/projects',
  },
  openGraph: {
    title: 'Featured Projects | Samartha S - Robotics & AI Engineer',
    description:
      'Autonomous drone flight (MAVROS/PX4), SKU classification (Flipkart GRID), RoboGleam IEEE floor cleaner, and CATIA aerospace CAD.',
    url: 'https://samarthas.vercel.app/projects',
  },
};

export default function ProjectsPage() {
  return (
    <div className={`container ${styles.projectsPage}`}>
      {/* Page Header */}
      <div className={`${styles.pageHeader} reveal-up`}>
        <span className={styles.eyebrow}>INNOVATION SHOWCASE</span>
        <h1 className={styles.title}>
          Robotics &amp; <span className="gradient-text">Autonomous Systems</span>
        </h1>
        <p className={styles.subtitle}>
          A portfolio of production-grade robotics hardware, autonomous drone flight algorithms, computer vision pipelines, and embedded IoT architectures.
        </p>
      </div>

      <ProjectsClient />
    </div>
  );
}
