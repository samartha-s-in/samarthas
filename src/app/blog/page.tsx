import { getSortedPostsData } from '@/lib/posts';
import BlogListClient from '@/components/Blog/BlogListClient';
import styles from './Blog.module.css';

export const metadata = {
  title: 'Articles & Insights | Samartha S - Robotics & AI Engineer',
  description: 'Technical articles and deep-dives on ROS 2, autonomous mobile robotics, computer vision, and embedded systems by Samartha S.',
};

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

      <BlogListClient posts={allPosts} />
    </div>
  );
}