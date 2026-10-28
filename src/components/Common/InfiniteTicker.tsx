"use client";

import React from 'react';
import styles from './InfiniteTicker.module.css';

export const InfiniteTicker: React.FC = () => {
  const items = [
    { text: 'ROS 2 HUMBLE & JAZZY', tag: 'ROBOTICS' },
    { text: 'MAVROS & PX4 FLIGHT CONTROL', tag: 'AUTONOMOUS' },
    { text: '360° LIDAR SLAM NAV2', tag: 'MAPPING' },
    { text: 'NVIDIA JETSON TX2 & ESP32-S3', tag: 'EMBEDDED' },
    { text: 'CATIA V5 & FUSION 360 CAD', tag: 'MECHANICAL' },
    { text: 'TENSORFLOW & OPENCV DEEP LEARNING', tag: 'AI VISION' },
    { text: '5,000+ ENGINEERS MENTORED', tag: 'IMPACT' },
    { text: 'IEEE ICCCNT 2024 RESEARCH', tag: 'PUBLICATIONS' },
    { text: 'GSLV MK II AEROSPACE CAD', tag: '3D FAB' },
    { text: 'ROBOGLEAM DUAL-ARM AMR', tag: 'CLEANTECH' },
  ];

  return (
    <div className={styles.tickerWrapper}>
      <div className={styles.tickerTrack}>
        {items.concat(items).map((item, idx) => (
          <div key={idx} className={styles.tickerItem}>
            <span className={styles.itemTag}>{item.tag}</span>
            <span className={styles.itemText}>{item.text}</span>
            <span className={styles.separator}>✦</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfiniteTicker;
