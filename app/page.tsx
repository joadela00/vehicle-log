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
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">차량 운행일지 입력</h1>

      {saved ? (
        <p className="mt-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
          저장되었습니다.
        </p>
      ) : null}

      <div className="mt-3 flex gap-4 text-sm">
        <a className="underline" href="/admin">관리자</a>
        <a className="underline" href="/trips">운행일지 목록</a>
      </div>

      <form method="POST" action="/api/trips/create" className="mt-6 grid gap-4">
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
<span
  className="relative block w-full rounded border border-gray-300 bg-white px-3 py-3 text-center font-medium text-gray-800 transition

  hover:border-gray-400

  peer-checked:border-black
  peer-checked:bg-gray-100
  peer-checked:text-black

  peer-focus-visible:outline
  peer-focus-visible:outline-2
  peer-focus-visible:outline-black

  dark:border-white/20
  dark:bg-black
  dark:text-white

  dark:hover:border-white/30

  dark:peer-checked:border-white
  dark:peer-checked:bg-white/10
  dark:peer-checked:text-white

  dark:peer-focus-visible:outline-white"
>


                  <span className="hidden text-xs font-bold tracking-wide peer-checked:block">
                    선택됨
                  </span>
                  <span>{v.model} / {v.plate}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

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
