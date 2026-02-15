export default function AdminLoginPage() {
  return (
    <main className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold">관리자 확인</h1>
      <p className="text-sm opacity-70 mt-2">비밀번호를 입력하세요.</p>

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
