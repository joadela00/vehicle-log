import Link from "next/link";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export const revalidate = 60;

const getVehicles = unstable_cache(
  () => prisma.vehicle.findMany({ orderBy: { plate: "asc" } }),
  ["home-vehicles"],
  { revalidate: 60 },
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
    <main className="mx-auto w-full max-w-full p-4 sm:max-w-3xl sm:p-6">
      <section className="max-w-full overflow-hidden rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div>
          <p className="text-sm font-semibold tracking-wide text-red-500">
            🚘 DAILY LOG
          </p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            인천경기 차량 운행일지
          </h1>
        </div>

        {saved ? (
          <p className="mt-4 rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            💾 저장되었습니다.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            className="min-w-0 break-words rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href="/admin"
          >
            🛠️ 관리자
          </Link>
          <Link
            className="min-w-0 break-words rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href="/trips"
          >
            📚 운행일지 목록
          </Link>
        </div>

        <form
          method="POST"
          action="/api/trips/create"
          className="mt-6 grid w-full max-w-full gap-4 overflow-hidden rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm"
        >
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

          <div className="grid gap-2 overflow-hidden">
            <span className="text-sm font-semibold sm:text-base">🚗 차량</span>
            <div className="grid w-full max-w-full grid-cols-1 gap-2 sm:grid-cols-3">
              {vehicles.map((v, idx) => (
                <label key={v.id} className="block min-w-0 cursor-pointer">
                  <input
                    type="radio"
                    name="vehicleId"
                    value={v.id}
                    defaultChecked={idx === 0}
                    className="peer sr-only"
                    required
                  />
                  <span className="relative block w-full max-w-full overflow-hidden rounded-2xl border border-red-100 bg-white px-3 py-3 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:border-red-300 peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:text-white peer-checked:shadow-[0_10px_25px_rgba(220,38,38,0.25)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-red-500">
                    <span className="absolute right-2 top-2 hidden h-6 w-6 place-items-center rounded-full bg-white/20 text-xs peer-checked:grid">
                      ✔
                    </span>
                    <span className="block truncate text-xs opacity-80">
                      {v.model}
                    </span>
                    <span className="mt-0.5 block truncate">{v.plate}</span>
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
            <span className="text-sm font-semibold sm:text-base">
              📍 계기 최종 주행거리(누적 km)
            </span>
            <input
              name="odoEnd"
              required
              placeholder="예: 12345"
              className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold sm:text-base">
              🔋 전기 잔여(%)
            </span>
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
            <span className="text-sm font-semibold sm:text-base">
              💳 하이패스 잔액(원)
            </span>
            <input
              name="hipassBalance"
              required
              placeholder="예: 35000"
              className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm sm:text-base">메모(선택)</span>
            <input
              name="note"
              type="text"
              className="rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <button className="rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition hover:bg-red-500">
            💾 저장
          </button>
        </form>
      </section>
    </main>
  );
}
