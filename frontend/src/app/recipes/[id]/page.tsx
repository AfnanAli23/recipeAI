import { Suspense } from 'react';
import RecipeDetail from '@/components/RecipeDetail';

// DYNAMIC route "/recipes/[id]": the folder name in square brackets is a variable.
// Visiting /recipes/abc-123 gives us params.id === 'abc-123'.
// In recent Next.js versions `params` is a Promise, so we `await` it. Because the value
// is only known per request, we read it inside <Suspense>: the page shell renders
// instantly and the part that depends on `params` streams in.
async function Resolved({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <RecipeDetail id={id} />; // hand the id to a client component
}

export default function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<p className="text-gray-500">Loading…</p>}>
      <Resolved params={params} />
    </Suspense>
  );
}
