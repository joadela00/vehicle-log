import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatNumber } from "@/lib/number";
import HipassChargeField from "@/app/trips/[id]/hipass-charge-field";

export const revalidate = 0;

function errorMessage(code: string) {
  switch (code) {
    case "invalid_odo":
      return "주행거리 값이 올바르지 않습니다.";
    case "invalid_ev":
      return "전기 잔여(%) 값이 올바르지 않습니다.";
    case "invalid_hipass":
      return "하이패스 잔액 값이 올바르지 않습니다.";
    case "invalid_hipass_charge":
      return "하이패스 충전금액 값이 올바르지 않습니다.";
    case "prev_odo":
      return "주행거리가 이전 운행일지의 최종 주행거리보다 작을 수 없습니다.";
    case "next_odo":
      return "주행거리가 다음 운행일지의 최종 주행거리보다 클 수 없습니다.";
    default:
      return "입력값을 다시 확인해주세요.";
  }
}

export default async function TripEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ branchCode?: string; error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const branchCodeFromQuery = String(sp?.branchCode ?? "").trim();
  const errorCode = String(sp?.error ?? "").trim();

  const trip = await prisma.trip.findUnique({
    where: { id },
    select: {
      id: true,
      date: true,
      odoEnd: true,
      evRemainPct: true,
      hipassBalance: true,
      hipassCharge: true, // ✅ 이미 추가되어 있음
      vehicle: { select: { model: true, plate: true, branchCode: true } },
      driver: { select: { name: true } },
    },
  });

  if (!trip) notFound();

  const branchCode = branchCodeFromQuery || trip.vehicle?.branchCode || "";
  const backHref = branchCode
    ? `/trips?branchCode=${encodeURIComponent(branchCode)}`
    : "/trips";

  const FieldInput =
    "w-full rounded-xl border bg-white px-3 py-3 text-base shadow-sm";

  return (
    <main className="mx-auto w-full max-w-2xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">✏️ 운행일지 수정</h1>
          <Link
            className="inline-flex shrink-0 items-center rounded-lg border border-red-200 bg-white px-3 py-2 hover:text-red-600"
            href={backHref}
          >
            📋 목록으로
          </Link>
        </div>

        {/* ✅ 검증 에러 메시지 표시 */}
        {errorCode ? (
          <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800">
            🚨 {errorMessage(errorCode)}
          </p>
        ) : null}

        <div className="mt-4 grid gap-2 rounded-2xl border border-red-100 bg-red-50/40 p-4 text-sm sm:text-base">
          <p>
            <b>날짜</b> {trip.date.toISOString().slice(0, 10)}
          </p>
          <p>
            <b>차량</b>{" "}
            {trip.vehicle ? `${trip.vehicle.model} / ${trip.vehicle.plate}` : "-"}
          </p>
          <p>
            <b>운전자</b> {trip.driver?.name ?? "-"}
          </p>
        </div>

        <form
          method="POST"
          action="/api/trips/update"
          className="mt-5 grid gap-4 rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm"
        >
          <input type="hidden" name="id" value={trip.id} />
          {/* ✅ 저장 후 돌아갈 위치(지사 유지) */}
          <input type="hidden" name="returnTo" value={backHref} />
          {/* ✅ 에러 리다이렉트 때도 지사 유지 */}
          <input type="hidden" name="branchCode" value={branchCode} />

          <label className="grid gap-1">
            <span className="text-sm font-semibold sm:text-base">
              📍 최종 주행거리(누적 km)
            </span>
            <input
              name="odoEnd"
              required
              inputMode="numeric"
              defaultValue={trip.odoEnd}
              className={FieldInput}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold sm:text-base">🔋 전기 잔여(%)</span>
            <select
              name="evRemainPct"
              required
              defaultValue={String(trip.evRemainPct)}
              className={FieldInput}
            >
              {[20, 40, 60, 80, 100].map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </label>

          {/* ✅ 하이패스 잔액(원) + 충전 체크(컴팩트) + 체크 시 충전금액 열림 */}
          <HipassChargeField
            fieldInputClass={FieldInput}
            defaultHipassBalance={trip.hipassBalance}
            defaultHipassCharge={trip.hipassCharge}
          />

          <p className="text-xs text-gray-500 sm:text-sm">
            기존값: 주행거리 {formatNumber(trip.odoEnd)} km / 하이패스{" "}
            {formatNumber(trip.hipassBalance)} 원
            {trip.hipassCharge ? (
              <>
                {" "}
                / 충전 {formatNumber(trip.hipassCharge)} 원
              </>
            ) : null}
          </p>

          <button className="w-full rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition hover:bg-red-500 sm:w-auto">
            저장
          </button>
        </form>
      </section>
    </main>
  );
}