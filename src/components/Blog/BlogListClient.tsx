"use client";

import React, { useState } from 'react';
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
  category?: string;
  tags?: string[];
}

interface BlogListClientProps {
  posts: PostItem[];
}

export const BlogListClient: React.FC<BlogListClientProps> = ({ posts }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Robotics', 'AI', 'IoT', 'Hardware'];

  const filteredPosts =
    selectedCategory === 'All'
      ? posts
      : posts.filter(
          (p) =>
            p.category?.toLowerCase() === selectedCategory.toLowerCase() ||
            p.tags?.some((t) => t.toLowerCase().includes(selectedCategory.toLowerCase()))
        );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Category Filter Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              background: selectedCategory === cat ? 'var(--accent-gradient)' : 'var(--bg-glass-card)',
              color: selectedCategory === cat ? '#ffffff' : 'var(--text-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '9999px',
              padding: '6px 16px',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      <section className={`${styles.postsList} reveal-stagger`}>
        {filteredPosts.map(({ slug, date, title, excerpt, category, tags }) => (
          <Card3DTilt key={slug} intensity={8}>
            <Link href={`/blog/${slug}`} className={`glass-panel ${styles.postCard}`}>
              <BorderBeam size={160} duration={8} />

              <div className={styles.postMetaRow}>
                {category && (
                  <span
                    style={{
                      background: 'var(--surface-muted)',
                      border: '1px solid var(--accent-primary)',
                      color: 'var(--accent-primary)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {category}
                  </span>
                )}
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

              {tags && tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {tags.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      style={{
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono), monospace',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        padding: '2px 6px',
                        color: 'var(--text-muted)',
                      }}
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}

              <div className={styles.cardAction}>
                <span>Read Article</span>
                <ArrowRight size={15} />
              </div>
            </Link>
          </Card3DTilt>
        ))}
      </section>
    </div>
  );
};

export default BlogListClient;
