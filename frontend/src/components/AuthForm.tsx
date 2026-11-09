'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/lib/AuthProvider';

// One form for both /login and /register.
export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth();
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isLogin = mode === 'login';

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email'));
    const password = String(form.get('password'));

    setBusy(true);
    setError('');
    try {
      await (isLogin ? login(email, password) : register(email, password));
      router.push('/generate');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-8 max-w-sm space-y-4 rounded-xl border bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold">{isLogin ? 'Log in' : 'Create account'}</h1>

      <input name="email" type="email" required placeholder="Email" className="w-full rounded border px-3 py-2" />
      <input
        name="password"
        type="password"
        required
        minLength={8}
        placeholder="Password (min 8 characters)"
        className="w-full rounded border px-3 py-2"
      />

      {error && <p className="rounded bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <button disabled={busy} className="w-full rounded bg-orange-600 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50">
        {busy ? 'Please wait…' : isLogin ? 'Log in' : 'Sign up'}
      </button>

      <p className="text-center text-sm text-gray-600">
        {isLogin ? (
          <>No account? <Link href="/register" className="text-orange-600">Sign up</Link></>
        ) : (
          <>Already registered? <Link href="/login" className="text-orange-600">Log in</Link></>
        )}
      </p>
    </form>
  );
}
