import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase/client-provider';

export const metadata: Metadata = {
  title: 'Bright-Net - ဆောက်လုပ်ရေး တွက်ချက်မှုစနစ်',
  description: 'အုတ်၊ ဘိလပ်မြေနှင့် သဲ လိုအပ်ချက်များကို တိကျစွာ တွက်ချက်ပေးသော Bright-Net စနစ်',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="my">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-black">
        <FirebaseClientProvider>
          <div className="min-h-screen">
            {children}
          </div>
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
