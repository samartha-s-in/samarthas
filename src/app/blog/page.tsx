import Link from 'next/link';
import { getSortedPostsData } from '@/lib/posts';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import styles from './Blog.module.css';

export default function BlogPage() {
  const allPosts = getSortedPostsData();

  return (
    <div className={`container ${styles.blogPage}`}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>RESEARCH &amp; THOUGHT LEADERSHIP</span>
        <h1 className={styles.pageTitle}>
          Articles &amp; <span className="gradient-text">Engineering Insights</span>
        </h1>
        <p className={styles.pageSubtitle}>
          Technical deep-dives into autonomous navigation algorithms, ROS 2 architecture, drone flight stacks, and industrial AI automation.
        </p>
      </div>

      <section className={styles.postsList}>
        {allPosts.map(({ slug, date, title, excerpt }) => (
          <Link href={`/blog/${slug}`} key={slug} className={`glass-panel ${styles.postCard}`}>
            <div className={styles.postMetaRow}>
              <span className={styles.postDate}>
                <Calendar size={13} />
                {new Date(date).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className={styles.readTime}>
                <Clock size={13} />
                5 min read
              </span>
            </div>

            <h2 className={styles.postTitle}>{title}</h2>
            <p className={styles.postExcerpt}>{excerpt}</p>

            <div className={styles.cardAction}>
              <span>Read Article</span>
              <ArrowRight size={15} />
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}