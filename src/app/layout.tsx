import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'စာရင်း',
  description: 'လွယ်ကူလျင်မြန်သော စာရင်းမှတ်တမ်း အက်ပ်',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
