import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/AuthProvider';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'RecipeAI',
  description: 'Turn the ingredients you have into recipes with AI',
};

// The root layout wraps EVERY page. Navbar + AuthProvider live here once.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-orange-50/40 text-gray-900 antialiased">
        <AuthProvider>
          <Navbar />
          <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
