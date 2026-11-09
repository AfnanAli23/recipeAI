import Link from "next/link";

// STATIC route "/": a Server Component with no data fetching.
// Next.js pre-renders it at build time into plain HTML -> super fast, CDN-friendly.
export default function Home() {
	return (
		<section className="py-16 text-center">
			<h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
				What&apos;s in your <span className="text-orange-600">kitchen</span>?
			</h1>
			<p className="mx-auto mt-4 max-w-xl text-gray-600">
				Type the ingredients you have, and AI will suggest recipes you can cook
				right now. Save your favorites, rate them, and build your own cookbook.
			</p>
			<div className="mt-8 flex justify-center gap-3">
				<Link
					href="/generate"
					className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700">
					Get recipes
				</Link>
				<Link
					href="/register"
					className="rounded-lg border text-black bg-white px-6 py-3 font-medium hover:bg-gray-50">
					Create account
				</Link>
			</div>
		</section>
	);
}
