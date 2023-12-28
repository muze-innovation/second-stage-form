import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <Link href="/surveys" className="p-4 border border-red-400 rounded-lg">
        Click to Surveys
      </Link>
      <Link href="/example-app" className="p-4 border border-red-400 rounded-lg">
        Click to Example App
      </Link>
    </main>
  )
}
