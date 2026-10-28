"use client";

import React from 'react';
import Link from 'next/link';
import Card3DTilt from '@/components/Spatial/Card3DTilt';
import BorderBeam from '@/components/Spatial/BorderBeam';
import { Calendar, ArrowRight, Clock } from 'lucide-react';
import styles from '@/app/blog/Blog.module.css';

interface PostItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

interface BlogListClientProps {
  posts: PostItem[];
}

export const BlogListClient: React.FC<BlogListClientProps> = ({ posts }) => {
  return (
    <section className={styles.postsList}>
      {posts.map(({ slug, date, title, excerpt }) => (
        <Card3DTilt key={slug} intensity={8}>
          <Link href={`/blog/${slug}`} className={`glass-panel ${styles.postCard}`}>
            <BorderBeam size={160} duration={8} />
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
        </Card3DTilt>
      ))}
    </section>
  );
};

export default BlogListClient;
