'use client';

import { useState } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { useRequireAuth } from '@/lib/AuthProvider';
import { api, type Draft } from '@/lib/api';

// Pool for the "Surprise me" button.
const POOL = ['chicken', 'rice', 'tomato', 'egg', 'spinach', 'potato', 'onion', 'garlic', 'cheese', 'mushroom', 'pasta', 'beans', 'carrot', 'lemon'];

// STATIC route "/generate" (client component because it is interactive).
export default function GeneratePage() {
  const { user, loading } = useRequireAuth();
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [savedTitles, setSavedTitles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const addIngredient = () => {
    const value = input.trim();
    if (value && !ingredients.includes(value) && ingredients.length < 15) setIngredients([...ingredients, value]);
    setInput('');
  };

  // Takes the list as a parameter so "Surprise me" can reuse it with random ingredients.
  async function generate(list: string[]) {
    setBusy(true);
    setError('');
    setDrafts([]);
    try {
      setDrafts(await api.generate(list));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // ===== "SURPRISE ME" (the whole feature: ~7 lines, no new backend code) =====
  function surprise() {
    const picks = [...POOL].sort(() => Math.random() - 0.5).slice(0, 4); // shuffle, take 4
    setIngredients(picks);
    generate(picks); // same endpoint as the normal button
  }
  // ===========================================================================

  async function save(draft: Draft) {
    try {
      await api.save(draft);
      setSavedTitles((s) => [...s, draft.title]);
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (loading || !user) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">What do you have at home?</h1>

      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
          placeholder="e.g. chicken, then press Enter"
          maxLength={40}
          className="flex-1 rounded border bg-white px-3 py-2"
        />
        <button onClick={addIngredient} className="rounded border bg-white px-4 py-2 hover:bg-gray-50">Add</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {ingredients.map((item) => (
          <span key={item} className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm">
            {item}
            <button aria-label={`Remove ${item}`} onClick={() => setIngredients(ingredients.filter((i) => i !== item))}>×</button>
          </span>
        ))}
      </div>

      <div className="flex gap-3">
        <button
          disabled={busy || ingredients.length === 0}
          onClick={() => generate(ingredients)}
          className="rounded bg-orange-600 px-5 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
        >
          {busy ? 'Cooking up ideas…' : 'Get recipes'}
        </button>
        <button disabled={busy} onClick={surprise} className="rounded border bg-white px-5 py-2 font-medium hover:bg-gray-50 disabled:opacity-50">
          🎲 Surprise me
        </button>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {drafts.map((draft) => {
          const isSaved = savedTitles.includes(draft.title);
          return (
            <RecipeCard key={draft.title} recipe={draft}>
              <button
                disabled={isSaved}
                onClick={() => save(draft)}
                className="rounded bg-orange-600 px-3 py-1 text-sm text-white hover:bg-orange-700 disabled:bg-green-600"
              >
                {isSaved ? '✓ Saved' : 'Save'}
              </button>
            </RecipeCard>
          );
        })}
      </div>
    </div>
  );
}
