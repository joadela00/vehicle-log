import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="mx-auto w-full max-w-md p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">🔐 관리자 로그인</h1>
          <Link
            className="inline-flex items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href="/"
          >
            🏠 홈으로
          </Link>
        </div>

        {error === "1" && (
          <p className="mt-3 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm">
            비밀번호가 틀렸습니다.
          </p>
        )}

        <form method="POST" action="/api/admin/login" className="mt-6 grid gap-3">
          <label className="grid gap-1">
            <span className="text-sm font-semibold">🔑 비밀번호</span>
            <input
              name="password"
              type="password"
              required
              className="rounded-xl border border-red-200 bg-white px-3 py-2 shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-100"
            />
          </label>

          <button className="rounded-xl bg-red-600 px-4 py-2 font-semibold text-white">
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}