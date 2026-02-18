import Link from "next/link";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const error = params?.error;

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">관리자 로그인</h1>

      {error ? (
        <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
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
            className="border rounded px-3 py-2"
          />
        </label>

        <button className="bg-black text-white rounded px-4 py-2">
          로그인
        </button>
      </form>

      <p className="mt-6">
        <Link className="underline" href="/">
          입력으로
        </Link>
      </p>
    </main>
  );
}
