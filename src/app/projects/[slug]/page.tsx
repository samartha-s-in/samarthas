import { projects } from '@/lib/portfolioData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { GithubIcon } from '@/components/Common/Icons';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import styles from './ProjectDetail.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    return {
      title: 'Project Not Found | Samartha S',
      description: 'Project could not be found.',
    };
  }

  const title = `${project.title} | Samartha S`;
  const description = project.description || project.tagline;
  const canonical = `https://samarthas.vercel.app/projects/${slug}`;

  return {
    title,
    description,
    keywords: [...project.techStack, project.category, 'Robotics', 'Samartha S'],
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: canonical,
      siteName: 'Samartha S Portfolio & Robotics Lab',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);

  if (!project) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.description,
    creator: {
      '@type': 'Person',
      name: 'Samartha S',
      url: 'https://samarthas.vercel.app',
    },
    keywords: project.techStack.join(', '),
    url: `https://samarthas.vercel.app/projects/${project.slug}`,
    ...(project.githubUrl ? { codeRepository: project.githubUrl } : {}),
  };

  return (
    <div className={`container ${styles.detailPage}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Back button */}
      <div className={styles.backNav}>
        <Link href="/projects" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to All Projects</span>
        </Link>
      </div>

      {/* Hero Header */}
      <div className={`glass-panel ${styles.headerCard}`}>
        <div className={styles.categoryRow}>
          <span className={styles.categoryPill}>{project.category}</span>
          {project.date && (
            <span className={styles.dateLabel}>
              <Calendar size={13} />
              {project.date}
            </span>
          )}
        </div>

        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.tagline}>{project.tagline}</p>

        <div className={styles.actionsRow}>
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
              <span>GitHub Repository</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className={styles.contentLayout}>
        <div className={styles.mainCol}>
          <div className={`glass-panel ${styles.contentCard}`}>
            <h2 className={styles.sectionHeading}>System Architecture &amp; Overview</h2>
            <p className={styles.narrative}>
              {project.longDescription || project.description}
            </p>
          </div>

          {project.highlights && project.highlights.length > 0 && (
            <div className={`glass-panel ${styles.contentCard}`}>
              <h2 className={styles.sectionHeading}>Engineering Accomplishments</h2>
              <ul className={styles.highlightsList}>
                {project.highlights.map((item, idx) => (
                  <li key={idx} className={styles.highlightItem}>
                    <CheckCircle2 size={18} className={styles.checkIcon} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={`glass-panel ${styles.sidebarCard}`}>
            <h3 className={styles.sidebarTitle}>Technology Stack</h3>
            <div className={styles.techGrid}>
              {project.techStack.map((tech) => (
                <span key={tech} className="tech-chip">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className={`glass-panel ${styles.sidebarCard}`}>
            <h3 className={styles.sidebarTitle}>Connect &amp; Discuss</h3>
            <p className={styles.sidebarText}>
              Interested in integrating or reproducing this architecture? Let&apos;s talk about robotics applications.
            </p>
            <Link href="/contact" className="btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
              <span>Contact Samartha</span>
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
