'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/AuthProvider';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <header className="border-b bg-gray-600">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-orange-600">
          🍳 RecipeAI
        </Link>

        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link href="/generate" className="hover:text-orange-600">Generate</Link>
              <Link href="/recipes" className="hover:text-orange-600">My recipes</Link>
              <button
                onClick={() => {
                  logout();
                  router.push('/');
                }}
                className="rounded border px-3 py-1 hover:bg-gray-100"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-black hover:text-orange-600">Log in</Link>
              <Link href="/register" className="rounded bg-orange-600 px-3 py-1 text-white hover:bg-orange-700">
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
