export default function Loading() {
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="mt-16 flex flex-col items-center gap-3 text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-black" />
        <p className="text-sm text-gray-600">불러오는 중입니다...</p>
      </div>
    </main>
  );
}
