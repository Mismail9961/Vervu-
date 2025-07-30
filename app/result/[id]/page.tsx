async function getScore(sessionId: string) {
  // For server-side fetching, use absolute URL with proper base
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.VERCEL_URL || 'localhost:3000';
  const res = await fetch(`${protocol}://${host}/api/result/${sessionId}`);
  return res.json();
}

export default async function ResultPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const { score, total } = await getScore(resolvedParams.id);

  return (
    <div className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">🎉 Session Complete</h1>
      <p className="text-xl">You scored <strong>{score}</strong> out of <strong>{total}</strong></p>
      <a href="/dashboard" className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded">Start New Session</a>
    </div>
  );
}
