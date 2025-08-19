import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import styles from './Blog.module.css';

export default function BlogPage() {
  const allPosts = getSortedPostsData();

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Blog & Insights</h1>
      <p className={styles.pageSubtitle}>
        Thoughts on robotics, AI, and the future of technology and leadership.
      </p>

      <section className={styles.postsList}>
        {allPosts.map(({ slug, date, title, excerpt }) => (
          <Link href={`/blog/${slug}`} key={slug} className={styles.postCard}>
            <span className={styles.postDate}>{new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            <h2 className={styles.postTitle}>{title}</h2>
            <p className={styles.postExcerpt}>{excerpt}</p>
            <span className={styles.readMore}>Read Article &rarr;</span>
          </Link>
        ))}
      </section>
    </div>
  );
}