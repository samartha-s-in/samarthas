import type { Metadata } from 'next';
import ContactClient from '@/components/Contact/ContactClient';
import styles from './Contact.module.css';

export const metadata: Metadata = {
  title: 'Contact & Collaboration',
  description:
    'Get in touch with Samartha S for autonomous robotics engineering, drone telemetry consulting, research collaboration, and hands-on technical training workshops.',
  alternates: {
    canonical: 'https://samarthas.vercel.app/contact',
  },
  openGraph: {
    title: 'Contact Samartha S | Robotics & AI Engineer',
    description:
      'Discuss robotics engineering opportunities, drone navigation frameworks, or technical workshops.',
    url: 'https://samarthas.vercel.app/contact',
  },
};

export default function ContactPage() {
  return (
    <div className={`container ${styles.contactPage}`}>
      {/* Header */}
      <div className={`${styles.headerBlock} reveal-up`}>
        <span className={styles.eyebrow}>GET IN TOUCH</span>
        <h1 className={styles.title}>
          Let&apos;s Build Something <span className="gradient-text">Exceptional</span>
        </h1>
        <p className={styles.subtitle}>
          Have an autonomous robotics project, technical training requirement, or research inquiry? Reach out directly using the form below or contact channels.
        </p>
      </div>

      <ContactClient />
    </div>
  );
}
