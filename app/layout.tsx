import type { Metadata } from 'next';
import { Heebo } from 'next/font/google';
import './globals.css';

const heebo = Heebo({
  variable: '--font-heebo',
  subsets: ['hebrew'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'מחשבון זכויות לסטודנטים במילואים — אוניברסיטת חיפה',
  description:
    'מחשבון זכויות אקדמיות לסטודנטים במילואים (תואר ראשון) באוניברסיטת חיפה — שנת הלימודים תשפ"ו.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
