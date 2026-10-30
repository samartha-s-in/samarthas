import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { ThemeProvider } from '@/components/Common/ThemeProvider';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import RobotCompanion from '@/components/Spatial/RobotCompanion';
import PageAnimation from '@/components/Common/PageAnimation';
import RoboticsCanvas from '@/components/Common/RoboticsCanvas';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://samarthas.vercel.app'),
  title: {
    default: 'Samartha S | Robotics & AI Engineer | Autonomous Systems Specialist',
    template: '%s | Samartha S',
  },
  description:
    'Official portfolio of Samartha S - Robotics & AI Engineer specializing in ROS/ROS 2, autonomous drone navigation, SLAM, embedded IoT, and computer vision. IEEE published researcher with 5,000+ students trained.',
  keywords: [
    'Samartha S',
    'samartha-s',
    'samptec',
    'samarthas',
    'Robotics Engineer Bengaluru',
    'Robotics Engineer India',
    'AI Engineer',
    'Autonomous Systems Specialist',
    'ROS 2 Jazzy',
    'ROS 2 Humble',
    'Autonomous Navigation',
    'SLAM',
    'Cartographer SLAM',
    'Nav2',
    'MAVROS PX4 Drone',
    'Computer Vision',
    'TensorFlow',
    'REVA University Robotics',
    'NMIT CRR Research Associate',
    'RoboGleam IEEE',
  ],
  authors: [{ name: 'Samartha S', url: 'https://samarthas.vercel.app' }],
  creator: 'Samartha S',
  publisher: 'Samartha S',
  alternates: {
    canonical: 'https://samarthas.vercel.app',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://samarthas.vercel.app',
    title: 'Samartha S | Robotics & AI Engineer | Autonomous Systems Specialist',
    description:
      'Official portfolio of Samartha S - Autonomous Systems Specialist, ROS/ROS 2, Drone Dynamics, Computer Vision & 5,000+ Engineers Trained.',
    siteName: 'Samartha S Portfolio & Research Lab',
    images: [
      {
        url: '/samartha.png',
        width: 600,
        height: 600,
        alt: 'Samartha S - Robotics & AI Engineer',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samartha S | Robotics & AI Engineer',
    description:
      'Autonomous Systems Specialist, ROS 2, Drone Dynamics, Computer Vision & 5,000+ Engineers Mentored.',
    images: ['/samartha.png'],
    creator: '@samptec',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inline theme initialization script to prevent theme flash (FOUC)
  const themeInitScript = `
    (function() {
      try {
        var preference = localStorage.getItem('theme-preference') || 'system';
        var resolvedTheme = 'dark';
        if (preference === 'system') {
          resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        } else {
          resolvedTheme = preference;
        }
        document.documentElement.setAttribute('data-theme', resolvedTheme);
        document.documentElement.setAttribute('data-mode', preference);
        document.documentElement.style.colorScheme = resolvedTheme;
      } catch (e) {}
    })();
  `;

  // Schema.org Structured Data for Google Rich Snippets & Search Knowledge Graph
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': 'https://samarthas.vercel.app/#person',
        name: 'Samartha S',
        givenName: 'Samartha',
        familyName: 'S',
        url: 'https://samarthas.vercel.app',
        image: 'https://samarthas.vercel.app/samartha.png',
        jobTitle: 'Robotics and AI Engineer',
        worksFor: {
          '@type': 'Organization',
          name: 'Independent Freelance & Technical Training',
        },
        alumniOf: [
          {
            '@type': 'CollegeOrUniversity',
            name: 'REVA University',
            sameAs: 'https://reva.edu.in',
          },
        ],
        knowsAbout: [
          'Robotics',
          'Robot Operating System (ROS / ROS 2)',
          'Autonomous Drone Navigation',
          'Simultaneous Localization and Mapping (SLAM)',
          'Computer Vision',
          'Deep Learning',
          'Embedded Systems',
          'MAVROS & PX4',
        ],
        sameAs: [
          'https://github.com/samptec',
          'https://github.com/samartha-s-in',
          'https://www.linkedin.com/in/samartha-s',
        ],
        email: 'samarthas312@gmail.com',
        telephone: '+918861486949',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Bengaluru',
          addressRegion: 'Karnataka',
          addressCountry: 'India',
        },
      },
      {
        '@type': 'WebSite',
        '@id': 'https://samarthas.vercel.app/#website',
        url: 'https://samarthas.vercel.app',
        name: 'Samartha S Portfolio & Robotics Lab',
        description:
          'Official portfolio of Samartha S - Robotics & AI Engineer specializing in ROS 2, drone autonomy, SLAM, and computer vision.',
        publisher: {
          '@id': 'https://samarthas.vercel.app/#person',
        },
      },
      {
        '@type': 'ProfilePage',
        '@id': 'https://samarthas.vercel.app/#webpage',
        url: 'https://samarthas.vercel.app',
        name: 'Samartha S | Robotics & AI Engineer',
        isPartOf: {
          '@id': 'https://samarthas.vercel.app/#website',
        },
        about: {
          '@id': 'https://samarthas.vercel.app/#person',
        },
        primaryImageOfPage: 'https://samarthas.vercel.app/samartha.png',
      },
    ],
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <ThemeProvider>
          <div className="portfolio-app">
            <RoboticsCanvas />
            <Header />
            <main id="main-content">
              <PageAnimation>{children}</PageAnimation>
            </main>
            <Footer />
            <RobotCompanion />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
