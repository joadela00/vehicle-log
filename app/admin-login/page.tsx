export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  const errorMessage =
    params?.error === "invalid"
      ? "비밀번호가 틀렸습니다. 다시 입력해 주세요."
      : params?.error === "config"
        ? "서버 설정(ADMIN_PASSWORD)이 필요합니다."
        : "";

  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">관리자 확인</h1>
      <p className="text-sm opacity-70 mt-2">비밀번호를 입력하세요.</p>

      {errorMessage ? (
        <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <form method="POST" action="/api/admin/login" className="mt-5 grid gap-3">
        <input
          name="password"
          type="password"
          required
          className="border rounded px-3 py-2"
          placeholder="관리자 비밀번호"
        />
        <button className="bg-black text-white rounded px-4 py-2">들어가기</button>
      </form>
    </main>
  );
}
