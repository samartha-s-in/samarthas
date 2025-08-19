import styles from './Timeline.module.css';

interface TimelineItemProps {
  date: string;
  title: string;
  company: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItemProps[];
}

const Timeline = ({ items }: TimelineProps) => {
  return (
    <div className={styles.timeline}>
      {items.map((item, index) => (
        <div key={index} className={styles.timelineItem}>
          <div className={styles.timelineDot}></div>
          <div className={styles.timelineContent}>
            <span className={styles.date}>{item.date}</span>
            <h3 className={styles.title}>{item.title}</h3>
            <p className={styles.company}>{item.company}</p>
            <p className={styles.description}>{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;