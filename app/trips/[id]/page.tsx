import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true },
  });

  if (!trip) return notFound();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">운행일지 수정</h1>

      <form method="POST" action="/api/trips/update" className="mt-6 grid gap-4">
        <input type="hidden" name="id" value={trip.id} />

        <label className="grid gap-1">
          <span>최종 주행거리</span>
          <input
            name="odoEnd"
            defaultValue={trip.odoEnd}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span>전기 잔여(%)</span>
          <input
            name="evRemainPct"
            defaultValue={trip.evRemainPct}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span>하이패스 잔액</span>
          <input
            name="hipassBalance"
            defaultValue={trip.hipassBalance}
            className="border rounded px-3 py-2"
          />
        </label>

        <label className="grid gap-1">
          <span>통행료</span>
          <input
            name="tollCost"
            defaultValue={trip.tollCost}
            className="border rounded px-3 py-2"
          />
        </label>

        <button className="bg-black text-white rounded px-4 py-2">
          수정 저장
        </button>
      </form>
    </main>
  );
export async function generateStaticParams() {
  const trips = await prisma.trip.findMany({
    select: { id: true },
  });

  return trips.map((t) => ({
    id: t.id,
  }));
}

