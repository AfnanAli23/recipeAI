'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import StarRating from '@/components/StarRating';
import { useRequireAuth } from '@/lib/AuthProvider';
import { api, type Recipe } from '@/lib/api';

// Client component: needs the logged-in user's token (from localStorage) to load the recipe.
export default function RecipeDetail({ id }: { id: string }) {
  const { user, loading } = useRequireAuth();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) api.get(id).then(setRecipe).catch((e) => setError(e.message));
  }, [user, id]);

  if (loading || !user) return <p className="text-gray-500">Loading…</p>;
  if (error) return <p className="rounded bg-red-50 p-3 text-red-700">{error} <Link href="/recipes" className="underline">Back</Link></p>;
  if (!recipe) return <p className="text-gray-500">Loading recipe…</p>;

  return (
    <article className="mx-auto max-w-2xl space-y-6">
      <Link href="/recipes" className="text-sm text-orange-600">← Back to my recipes</Link>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={recipe.imageUrl} alt={recipe.title} className="h-64 w-full rounded-xl bg-gray-100 object-cover" />

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{recipe.title}</h1>
          <p className="mt-1 text-gray-600">{recipe.description}</p>
          <p className="mt-1 text-sm text-gray-500">⏱ {recipe.cookTimeMinutes} minutes</p>
        </div>
        <button
          onClick={async () => setRecipe(await api.toggleFavorite(recipe.id))}
          className="rounded border bg-white px-3 py-1 text-sm hover:bg-gray-50"
        >
          {recipe.isFavorite ? '❤ Favorited' : '♡ Favorite'}
        </button>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Your rating</p>
        <StarRating value={recipe.rating} onChange={async (r) => setRecipe(await api.rate(recipe.id, r))} />
      </div>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Ingredients</h2>
        <ul className="list-disc space-y-1 pl-5">
          {recipe.ingredients.map((item, i) => <li key={i}>{item}</li>)}
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-xl font-semibold">Steps</h2>
        <ol className="list-decimal space-y-2 pl-5">
          {recipe.steps.map((step, i) => <li key={i}>{step}</li>)}
        </ol>
      </section>

      <button
        onClick={async () => {
          if (!confirm('Delete this recipe?')) return;
          await api.remove(recipe.id);
          router.push('/recipes');
        }}
        className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50"
      >
        Delete recipe
      </button>
    </article>
  );
}
