import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getPostsDirectory } from '@/lib/posts';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import styles from './Post.module.css';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const postsDirectory = getPostsDirectory();
  if (!fs.existsSync(postsDirectory)) return [];
  const filenames = fs
    .readdirSync(postsDirectory)
    .filter((f) => f.endsWith('.mdx') || f.endsWith('.md'));

  return filenames.map((filename) => ({
    slug: filename.replace(/\.(mdx|md)$/, ''),
  }));
}

async function getPostData(slug: string) {
  const postsDirectory = getPostsDirectory();
  let fullPath = path.join(postsDirectory, `${slug}.mdx`);
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${slug}.md`);
  }

  if (!fs.existsSync(fullPath)) {
    notFound();
  }

  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);
  return {
    frontmatter: data,
    content,
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { frontmatter } = await getPostData(slug);
    const title = `${frontmatter.title} | Samartha S`;
    const description = frontmatter.excerpt || 'Technical robotics and AI engineering article by Samartha S.';
    const canonical = `https://samarthas.vercel.app/blog/${slug}`;

    return {
      title,
      description,
      keywords: frontmatter.tags || ['Robotics', 'ROS 2', 'AI', 'Embedded Systems', 'Samartha S'],
      authors: [{ name: frontmatter.author || 'Samartha S' }],
      alternates: {
        canonical,
      },
      openGraph: {
        title,
        description,
        type: 'article',
        publishedTime: frontmatter.date,
        authors: [frontmatter.author || 'Samartha S'],
        url: canonical,
        siteName: 'Samartha S Portfolio & Research Lab',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
    };
  } catch {
    return {
      title: 'Article | Samartha S',
      description: 'Technical engineering article by Samartha S.',
    };
  }
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const { frontmatter, content } = await getPostData(slug);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: frontmatter.title,
    description: frontmatter.excerpt,
    author: {
      '@type': 'Person',
      name: frontmatter.author || 'Samartha S',
      url: 'https://samarthas.vercel.app',
    },
    datePublished: frontmatter.date,
    dateModified: frontmatter.date,
    mainEntityOfPage: `https://samarthas.vercel.app/blog/${slug}`,
    keywords: Array.isArray(frontmatter.tags) ? frontmatter.tags.join(', ') : '',
    publisher: {
      '@type': 'Person',
      name: 'Samartha S',
    },
  };

  return (
    <div className={`container ${styles.postContainer}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className={styles.backNav}>
        <Link href="/blog" className={styles.backLink}>
          <ArrowLeft size={16} />
          <span>Back to Articles</span>
        </Link>
      </div>

      <article className={`glass-panel ${styles.postArticle}`}>
        <header className={styles.postHeader}>
          <h1 className={styles.postTitle}>{frontmatter.title}</h1>
          <div className={styles.postMetaRow}>
            <span className={styles.metaItem}>
              <Calendar size={14} />
              {new Date(frontmatter.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                timeZone: 'UTC',
              })}
            </span>
            <span className={styles.metaItem}>
              <User size={14} />
              {frontmatter.author || 'Samartha S'}
            </span>
            <span className={styles.metaItem}>
              <Clock size={14} />
              5 min read
            </span>
            {frontmatter.category && (
              <span
                style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--accent-primary)',
                  color: 'var(--accent-primary)',
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                }}
              >
                {frontmatter.category}
              </span>
            )}
          </div>
          {frontmatter.tags && Array.isArray(frontmatter.tags) && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '14px' }}>
              {frontmatter.tags.map((t: string) => (
                <span key={t} className="tech-chip">
                  #{t}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className={styles.postBody}>
          <MDXRemote source={content} />
        </div>
      </article>
    </div>
  );
}
