export const dynamic = "force-dynamic";
export const revalidate = 0;

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">차량 운행일지 입력</h1>

      <div className="mt-3 flex gap-4 text-sm">
        <Link className="underline" href="/admin">관리자</Link>
        <Link className="underline" href="/trips">운행일지 목록</Link>
      </div>

      <form method="POST" action="/api/trips/create" className="mt-6 grid gap-4">
        {/* ✅ 날짜: 오늘로 기본 세팅 */}
        <label className="grid gap-1">
          <span>날짜</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={today}
            className="border rounded px-3 py-2"
          />
        </label>

        {/* ✅ 차량: 드롭다운 대신 버튼형(라디오) 선택 */}
        <div className="grid gap-2">
          <span>차량</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {vehicles.map((v, idx) => (
              <label key={v.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="vehicleId"
                  value={v.id}
                  defaultChecked={idx === 0}
                  className="peer sr-only"
                  required
                />
                <span className="relative block w-full rounded border-2 border-gray-300 bg-white px-3 py-3 text-center font-medium text-gray-800 shadow-sm transition
peer-checked:border-blue-700 peer-checked:bg-blue-600 peer-checked:text-white peer-checked:ring-4 peer-checked:ring-blue-200
after:hidden peer-checked:after:block peer-checked:after:content-['✓_선택됨'] peer-checked:after:mt-1 peer-checked:after:text-xs peer-checked:after:font-bold peer-checked:after:tracking-wide
peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-blue-500">
                  {v.model} / {v.plate}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* ✅ 운전자: 주관식 */}
        <label className="grid gap-1">
          <span>운전자</span>
          <input
            name="driverName"
            type="text"
            required
            placeholder="예: 홍길동"
            className="border rounded px-3 py-2"
          />
        </label>

        {/* ✅ 최종 계기판만 입력 */}
        <label className="grid gap-1">
          <span>계기판 최종 주행거리(누적 km)</span>
          <input
            name="odoEnd"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            placeholder="예: 12345"
            className="border rounded px-3 py-2"
          />
        </label>

<label className="grid gap-1">
  <span>전기 잔여(%)</span>
  <select
    name="evRemainPct"
    required
    defaultValue="80"
    className="border rounded px-3 py-2"
  >
    {[20, 40, 60, 80, 100].map((v) => (
      <option key={v} value={v}>
        {v}%
      </option>
    ))}
  </select>
</label>



        {/* ✅ 하이패스/통행료: 스피너(화살표) 없게 text+numeric */}
        <div className="grid grid-cols-2 gap-3">
          <label className="grid gap-1">
            <span>하이패스 잔액(원)</span>
            <input
              name="hipassBalance"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              placeholder="예: 35000"
              className="border rounded px-3 py-2"
            />
          </label>
        </div>

        <label className="grid gap-1">
          <span>메모(선택)</span>
          <input name="note" type="text" className="border rounded px-3 py-2" />
        </label>

        <button className="bg-black text-white rounded px-4 py-2">
          저장
        </button>
      </form>
    </main>
  );
}
