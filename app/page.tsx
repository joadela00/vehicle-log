import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const getVehicles = unstable_cache(
  () => prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
  ["home-vehicles"],
  { revalidate: 60 }
);

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string }>;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const params = await searchParams;
  const saved = params?.saved === "1";

  const vehicles = await getVehicles();

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <h1 className="text-xl font-bold sm:text-2xl">🚗 인천경기 차량 운행일지</h1>

      {saved ? (
        <p className="mt-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          💾 저장되었습니다.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <Link className="rounded border border-red-200 bg-white px-3 py-2 hover:text-red-600" href="/admin">
          🛠️ 관리자
        </Link>
        <Link className="rounded border border-red-200 bg-white px-3 py-2 hover:text-red-600" href="/trips">
          📚 운행일지 목록
        </Link>
      </div>

      <form method="POST" action="/api/trips/create" className="mt-6 grid gap-4 rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm">
        <label className="grid gap-1">
          <span className="text-sm sm:text-base">날짜</span>
          <input
            name="date"
            type="date"
            required
            defaultValue={today}
            className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
          />
        </label>

        <div className="grid gap-2">
          <span className="text-sm sm:text-base">차량</span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
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
                <span className="relative block w-full rounded border border-gray-300 bg-white px-3 py-3 text-center text-sm font-medium text-gray-800 transition hover:border-gray-400 peer-checked:border-black peer-checked:bg-gray-100 peer-checked:text-black peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-black dark:border-white/20 dark:bg-red-600 dark:text-white dark:hover:border-white/30 dark:peer-checked:border-white dark:peer-checked:bg-white/10 dark:peer-checked:text-white dark:peer-focus-visible:outline-white">
                  <span className="hidden text-xs font-bold tracking-wide peer-checked:block">
                    ✅ 선택됨
                  </span>
                  <span>
                    {v.model} / {v.plate}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        <label className="grid gap-1">
          <span className="text-sm sm:text-base">운전자</span>
          <input
            name="driverName"
            type="text"
            required
            placeholder="예: 홍길동"
            className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm sm:text-base">계기 최종 주행거리(누적 km)</span>
          <input
            name="odoEnd"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            placeholder="예: 12345"
            className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm sm:text-base">전기 잔여(%)</span>
          <select
            name="evRemainPct"
            required
            defaultValue="80"
            className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
          >
            {[20, 40, 60, 80, 100].map((v) => (
              <option key={v} value={v}>
                {v}%
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span className="text-sm sm:text-base">하이패스 잔액(원)</span>
          <input
            name="hipassBalance"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            required
            placeholder="예: 35000"
            className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm sm:text-base">메모(선택)</span>
          <input name="note" type="text" className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm" />
        </label>

        <button className="rounded bg-red-600 px-4 py-3 text-base font-semibold text-white">
          💾 저장
        </button>
      </form>
    </main>
  );
}
