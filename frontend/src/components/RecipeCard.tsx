import Link from 'next/link';
import type { Draft, Recipe } from '@/lib/api';

type Props = {
  recipe: Draft | Recipe;
  children?: React.ReactNode; // action buttons go here (Save, Delete, ...)
};

// Works for both unsaved drafts (no id) and saved recipes (has id).
export default function RecipeCard({ recipe, children }: Props) {
  const saved = 'id' in recipe ? recipe : null;

  return (
    <article className="flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm">
      {/* Plain <img>: the picture is generated on demand by an external service. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={recipe.imageUrl}
        alt={recipe.title}
        loading="lazy"
        className="h-44 w-full bg-gray-100 object-cover"
      />

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold">
          {saved ? (
            <Link href={`/recipes/${saved.id}`} className="hover:text-orange-600">
              {recipe.title}
            </Link>
          ) : (
            recipe.title
          )}
        </h3>
        <p className="text-sm text-gray-600">{recipe.description}</p>
        <p className="text-xs text-gray-500">⏱ {recipe.cookTimeMinutes} min · {recipe.ingredients.length} ingredients</p>

        {saved?.rating ? <p className="text-sm text-yellow-600">{'★'.repeat(saved.rating)}</p> : null}

        {/* React escapes text automatically, so AI output can't inject HTML/JS (XSS). */}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">{children}</div>
      </div>
    </article>
  );
}
