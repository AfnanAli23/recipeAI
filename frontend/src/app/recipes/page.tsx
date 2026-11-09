'use client';

import { useEffect, useState } from 'react';
import RecipeCard from '@/components/RecipeCard';
import { useRequireAuth } from '@/lib/AuthProvider';
import { api, type Recipe } from '@/lib/api';

// STATIC route "/recipes" -> the list. Its child "/recipes/[id]" is the DYNAMIC route.
export default function RecipesPage() {
  const { user, loading } = useRequireAuth();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  // Re-runs whenever the user or the All/Favorites tab changes.
  useEffect(() => {
    if (!user) return;
    let ignore = false; // avoids updating state from an outdated request
    api
      .list(favoritesOnly)
      .then((list) => !ignore && setRecipes(list))
      .catch((e) => !ignore && setError(e.message))
      .finally(() => !ignore && setFetching(false));
    return () => {
      ignore = true;
    };
  }, [user, favoritesOnly]);

  async function toggleFavorite(id: string) {
    const updated = await api.toggleFavorite(id);
    setRecipes((list) =>
      list
        .map((r) => (r.id === id ? updated : r))
        .filter((r) => !favoritesOnly || r.isFavorite), // un-favorited items leave the Favorites tab
    );
  }

  async function remove(id: string) {
    if (!confirm('Delete this recipe?')) return;
    await api.remove(id);
    setRecipes((list) => list.filter((r) => r.id !== id));
  }

  if (loading || !user) return <p className="text-gray-500">Loading…</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My recipes</h1>
        <div className="flex overflow-hidden rounded border bg-white text-sm">
          <button onClick={() => setFavoritesOnly(false)} className={`px-3 py-1 ${!favoritesOnly ? 'bg-orange-600 text-white' : ''}`}>All</button>
          <button onClick={() => setFavoritesOnly(true)} className={`px-3 py-1 ${favoritesOnly ? 'bg-orange-600 text-white' : ''}`}>❤ Favorites</button>
        </div>
      </div>

      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!fetching && recipes.length === 0 && <p className="text-gray-500">Nothing here yet. Generate and save a recipe first!</p>}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe}>
            <button onClick={() => toggleFavorite(recipe.id)} className="rounded border px-3 py-1 text-sm hover:bg-gray-50">
              {recipe.isFavorite ? '❤ Favorited' : '♡ Favorite'}
            </button>
            <button onClick={() => remove(recipe.id)} className="rounded border px-3 py-1 text-sm text-red-600 hover:bg-red-50">
              Delete
            </button>
          </RecipeCard>
        ))}
      </div>
    </div>
  );
}
