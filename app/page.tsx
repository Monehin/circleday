import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-depth-50">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold mb-4 text-celebration-600">
          CircleDay
        </h1>
        <p className="text-xl text-depth-600 mb-8">
          Never miss a celebration 🎉
        </p>
        <p className="text-depth-500 mb-8">
          Celebrate birthdays, anniversaries, and special moments with the people you care about.
          CircleDay helps you remember, reminds you on time, and makes celebrating together easy.
        </p>
        
        <div className="flex gap-4 justify-center mb-8">
          <Button asChild size="lg">
            <Link href="/login">Get Started</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign In</Link>
          </Button>
        </div>

        <div className="mt-12 px-4 py-2 bg-warmth-50 rounded-lg border border-warmth-200 inline-block">
          <p className="text-xs text-depth-500">
            Running on Next.js 16.0.1 + React 19.0.0
          </p>
        </div>
      </div>
    </main>
  )
}

