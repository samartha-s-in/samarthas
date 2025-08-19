import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google'; // Import new fonts
import { ThemeProvider } from '@/components/Common/ThemeProvider';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import './globals.css';

// Configure new fonts
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair-display',
});

export const metadata: Metadata = {
  // You can update this to reflect your company
  title: 'Samartha S',
  description: 'The official website of Samartha S, a leader in the robotics industry.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfairDisplay.variable}`}>
        <ThemeProvider>
          {/* LiveBackground component is now removed */}
          <Header />
          <main>{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}