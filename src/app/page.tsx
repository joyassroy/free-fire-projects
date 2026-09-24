import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#130b20] text-white flex flex-col items-center justify-center space-y-8">
      <h1 className="text-5xl font-bold text-yellow-400">Match Stats Dashboard</h1>
      <div className="flex space-x-6">
        <Link href="/1" className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-xl text-xl font-bold transition">
          View Graph 1 (Bar + Line)
        </Link>
        <Link href="/2" className="px-8 py-4 bg-green-500 hover:bg-green-400 text-black rounded-xl text-xl font-bold transition">
          View Graph 2 (Double Bar)
        </Link>
        <Link href="/3" className="px-8 py-4 bg-pink-600 hover:bg-pink-500 text-white rounded-xl text-xl font-bold transition shadow-[0_0_15px_rgba(255,0,160,0.5)]">
          View Graph 3 (Matrix Grid)
        </Link>
      </div>
    </main>
  );
}
