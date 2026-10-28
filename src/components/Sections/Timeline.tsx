import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import styles from './Timeline.module.css';

export interface TimelineItemProps {
  date: string;
  title: string;
  company: string;
  description: string;
  highlights?: string[];
}

export interface TimelineProps {
  items: TimelineItemProps[];
}

export const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelineDot}></div>
          <div className={`glass-panel ${styles.timelineContent}`}>
            <div className={styles.headerRow}>
              <div>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.company}>{item.company}</p>
              </div>
              <span className={styles.date}>
                <Calendar size={13} />
                {item.date}
              </span>
            </div>
            <p className={styles.description}>{item.description}</p>
            {item.highlights && item.highlights.length > 0 && (
              <ul className={styles.highlights}>
                {item.highlights.map((h, hIdx) => (
                  <li key={hIdx}>
                    <CheckCircle2 size={14} className={styles.checkIcon} />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;