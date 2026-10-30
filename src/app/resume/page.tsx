import type { Metadata } from 'next';
import ResumeClient from '@/components/Resume/ResumeClient';
import styles from './Resume.module.css';

export const metadata: Metadata = {
  title: 'Curriculum Vitae (CV) & Resume',
  description:
    'Comprehensive professional CV of Samartha S - Robotics & AI Engineer with expertise in ROS/ROS 2, autonomous navigation, drone telemetry, and embedded systems.',
  alternates: {
    canonical: 'https://samarthas.vercel.app/resume',
  },
  openGraph: {
    title: 'Curriculum Vitae | Samartha S - Robotics Engineer',
    description:
      'Curriculum Vitae and credentials of Samartha S. View interactive profile or download PDF.',
    url: 'https://samarthas.vercel.app/resume',
  },
};

export default function ResumePage() {
  return (
    <div className={`container ${styles.resumePage}`}>
      <ResumeClient />
    </div>
  );
}
