import { projects } from '@/lib/projectsData';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './ProjectDetail.module.css';

// This function tells Next.js which slugs (project pages) to generate at build time
export async function generateStaticParams() {
  return projects.map((project) => ({
    slug: project.slug,
  }));
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);

  if (!project) {
    notFound(); // Display a 404 page if the project isn't found
  }

  return (
    <div className="container">
      <div className={styles.projectHeader}>
        <span className={styles.category}>{project.category}</span>
        <h1 className={styles.title}>{project.title}</h1>
        <p className={styles.tagline}>{project.tagline}</p>
      </div>

      <div className={styles.contentBody}>
        <div className={styles.mainContent}>
            <h2>Project Overview</h2>
            <p>{project.description}</p>
        </div>
        <aside className={styles.sidebar}>
            <div className={styles.sidebarModule}>
                <h3>Tech Stack</h3>
                <div className={styles.techList}>
                    {project.techStack.map(tech => (
                        <span key={tech} className={styles.techChip}>{tech}</span>
                    ))}
                </div>
            </div>
            
            {(project.githubUrl || project.liveUrl) && (
                 <div className={styles.sidebarModule}>
                    <h3>Links</h3>
                    <div className={styles.links}>
                        {project.githubUrl && <Link href={project.githubUrl} target="_blank" className={styles.projectLink}>View Code on GitHub</Link>}
                        {project.liveUrl && <Link href={project.liveUrl} target="_blank" className={styles.projectLink}>View Demo / Details</Link>}
                    </div>
                 </div>
            )}
        </aside>
      </div>
    </div>
  );
}