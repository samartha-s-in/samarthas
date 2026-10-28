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
  title: 'Samartha S | Robotics & AI Engineer | Autonomous Systems Specialist',
  description: 'Official portfolio of Samartha S - Robotics & AI Engineer specializing in ROS/ROS 2, autonomous drone navigation, SLAM, embedded IoT, and computer vision. IEEE published researcher with 5,000+ students trained.',
  keywords: [
    'Samartha S',
    'Robotics Engineer',
    'AI Engineer',
    'ROS 2',
    'Autonomous Navigation',
    'SLAM',
    'MAVROS',
    'PX4 Drone',
    'Computer Vision',
    'TensorFlow',
    'Embedded Systems',
    'REVA University',
    'NMIT CRR'
  ],
  authors: [{ name: 'Samartha S' }],
  creator: 'Samartha S',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://samarthas.com',
    title: 'Samartha S | Robotics & AI Engineer',
    description: 'Autonomous Systems Specialist, ROS/ROS2, Drone Dynamics, Computer Vision & 5,000+ Engineers Trained.',
    siteName: 'Samartha S Portfolio',
  },
  icons: {
    icon: '/favicon.ico',
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
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