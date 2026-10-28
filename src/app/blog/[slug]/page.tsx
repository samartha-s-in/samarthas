import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Calendar, User, Clock } from 'lucide-react';
import styles from './Post.module.css';

const postsDirectory = path.join(process.cwd(), '_posts');

export async function generateStaticParams() {
  if (!fs.existsSync(postsDirectory)) return [];
  const filenames = fs.readdirSync(postsDirectory);
  return filenames.map((filename) => ({
    slug: filename.replace(/\.mdx$/, ''),
  }));
}

async function getPostData(slug: string) {
  const fullPath = path.join(postsDirectory, `${slug}.mdx`);

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

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { frontmatter, content } = await getPostData(slug);

  return (
    <div className={`container ${styles.postContainer}`}>
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
          </div>
        </header>

        <div className={styles.postBody}>
          <MDXRemote source={content} />
        </div>
      </article>
    </div>
  );
}