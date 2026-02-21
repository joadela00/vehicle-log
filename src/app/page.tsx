import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: "asc" } });
  const drivers = await prisma.driver.findMany({ orderBy: { name: "asc" } });

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">차량 운행일지 입력</h1>

      <form method="POST" action="/api/trips/create" className="mt-6 grid gap-4">
        <label className="grid gap-1">
          <span>날짜</span>
          <input name="date" type="date" required className="border rounded px-3 py-2" />
        </label>

        <label className="grid gap-1">
          <span>차량</span>
          <select name="vehicleId" required className="border rounded px-3 py-2">
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.model} / {v.plate}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-1">
          <span>운전자</span>
          <select name="driverId" required className="border rounded px-3 py-2">
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

       <label className="grid gap-1">
  <span>계기판 최종 주행거리(누적 km)</span>
  <input name="odoEnd" type="number" min="0" required className="border rounded px-3 py-2" />
</label>

        <div className="grid grid-cols-3 gap-3">
          <label className="grid gap-1">
            <span>전기 잔여(%)</span>
            <input name="evRemainPct" type="number" min="0" max="100" required className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span>하이패스 잔액(원)</span>
            <input name="hipassBalance" type="number" min="0" required className="border rounded px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span>통행료 지출(원)</span>
            <input name="tollCost" type="number" min="0" required className="border rounded px-3 py-2" />
          </label>
        </div>

        <label className="grid gap-1">
          <span>메모(선택)</span>
          <input name="note" type="text" className="border rounded px-3 py-2" />
        </label>

        <div className="flex gap-3">
          <button className="bg-black text-white rounded px-4 py-2">저장</button>
          <Link className="underline self-center" href="/admin">관리자(누적)</Link>
        </div>
      </form>
    </main>
  );
}
