import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="mx-auto max-w-md p-6">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold sm:text-2xl">🔐 관리자 로그인</h1>
        <Link
          className="inline-flex items-center rounded-lg border border-red-200 px-3 py-2 underline decoration-red-300 underline-offset-4 hover:text-red-600"
          href="/"
        >
          🏠 홈으로
        </Link>
      </div>

      {error ? (
        <p className="mt-3 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800 shadow-sm">
          {error === "1" ? "비밀번호가 틀렸습니다." : "서버 설정 오류(ADMIN_PASSWORD)."}
        </p>
      ) : null}

      <form method="POST" action="/api/admin/login" className="mt-6 grid gap-3">
        <label className="grid gap-1">
          <span>비밀번호</span>
          <input
            name="password"
            type="password"
            required
            className="rounded border px-3 py-2"
          />
        </label>

        <button className="rounded bg-red-600 px-4 py-2 text-white">🔑 로그인</button>
      </form>
    </main>
  );
}
