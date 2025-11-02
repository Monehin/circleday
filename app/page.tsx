export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-depth-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-celebration-600">
          CircleDay
        </h1>
        <p className="text-lg text-depth-600">
          Never miss a celebration 🎉
        </p>
        <div className="mt-6 px-4 py-2 bg-warmth-50 rounded-lg border border-warmth-200">
          <p className="text-sm text-depth-500">
            Running on Next.js 16.0.1 + React 19.0.0
          </p>
        </div>
      </div>
    </main>
  )
}

