"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type VehicleOption = {
  id: string;
  model: string;
  plate: string;
};

type BranchOption = {
  code: string;
  name: string;
};

type VehiclesByBranch = Record<string, VehicleOption[]>;

export default function BranchLogForm({
  initialBranchCode,
  initialBranchName,
  vehiclesByBranch,
  branches,
  saved,
}: {
  initialBranchCode: string;
  initialBranchName: string;
  vehiclesByBranch: VehiclesByBranch;
  branches: BranchOption[];
  saved: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);

  const [branchCode, setBranchCode] = useState(initialBranchCode);

  // branchCode -> branchName (branches 목록에서 찾고, 없으면 initialBranchName 사용)
  const branchName = useMemo(() => {
    const found = branches.find((b) => b.code === branchCode)?.name;
    return found || (branchCode === initialBranchCode ? initialBranchName : branchCode);
  }, [branches, branchCode, initialBranchCode, initialBranchName]);

  const vehicles = vehiclesByBranch[branchCode] ?? [];

  // ✅ 소속이 바뀌면 라디오 기본 선택도 그 소속의 첫 차량으로 바뀌게
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles[0]?.id ?? ""
  );

  useEffect(() => {
    setSelectedVehicleId(vehicles[0]?.id ?? "");
  }, [branchCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const tripsHref = `/trips?branchCode=${encodeURIComponent(branchCode)}`;
  const adminHref = `/admin/${encodeURIComponent(branchCode)}`;

  // ✅ 지역본부는 맨 끝으로
  const sortedBranches = useMemo(() => {
    const copy = [...branches];
    copy.sort((a, b) => {
      const aIsHQ = a.name.includes("지역본부");
      const bIsHQ = b.name.includes("지역본부");
      if (aIsHQ === bIsHQ) return a.name.localeCompare(b.name, "ko");
      return aIsHQ ? 1 : -1;
    });
    return copy;
  }, [branches]);

  return (
    <main className="mx-auto w-full max-w-3xl overflow-x-clip p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pr-[calc(1rem+env(safe-area-inset-right))] sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-bold tracking-wide text-red-500">🚘 DAILY LOG</p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {branchName} 차량 운행일지
            </h1>
            <p className="mt-1 text-sm text-gray-500">오늘도 안전운전 하셨지요?</p>
          </div>
        </div>

        {saved ? (
          <p className="mt-4 rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            💾 저장되었습니다.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href="/guide"
          >
            📢 운행안내
          </Link>

          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href={tripsHref}
          >
            📚 운행목록
          </Link>

          {/* ✅ 선택된 소속 기준 관리자 */}
          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href={adminHref}
          >
            🛠️ 관리자
          </Link>
        </div>

        {/* ✅ 여기: Link 금지. 버튼으로 상태만 변경 */}
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/40 p-3">
          <p className="mb-2 text-sm font-semibold text-gray-700">소속 선택</p>
          <div className="flex flex-wrap gap-2 text-sm">
            {sortedBranches.map((branch) => (
              <button
                key={branch.code}
                type="button"
                onClick={() => setBranchCode(branch.code)}
                className={`rounded-lg border px-2 py-1 ${
                  branch.code === branchCode
                    ? "border-red-500 bg-red-600 text-white"
                    : "border-red-200 bg-white hover:text-red-600"
                }`}
              >
                {branch.name}
              </button>
            ))}
          </div>
        </div>

        <form
          method="POST"
          action="/api/trips/create"
          className="mt-6 grid gap-4 rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm"
        >
          {/* ✅ 저장 후 돌아갈 곳도 선택된 소속 기준 */}
          <input
            type="hidden"
            name="returnTo"
            value={branchCode === "0230" ? "/" : `/branches/${branchCode}`}
          />

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">📅 날짜</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className="block w-full max-w-full box-border min-w-0 rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
              style={{ WebkitAppearance: "none", appearance: "none" }}
            />
          </label>

          <div className="grid gap-2 min-w-0">
            <span className="text-sm font-semibold sm:text-base">🚗 차량</span>

            {vehicles.length === 0 ? (
              <p className="rounded-2xl border border-red-100 bg-white px-3 py-3 text-sm text-gray-600">
                이 소속에 등록된 차량이 없습니다.
              </p>
            ) : (
              <div className="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
                {vehicles.map((v) => (
                  <label key={v.id} className="block min-w-0 cursor-pointer">
                    <input
                      type="radio"
                      name="vehicleId"
                      value={v.id}
                      checked={selectedVehicleId === v.id}
                      onChange={() => setSelectedVehicleId(v.id)}
                      className="peer sr-only"
                      required
                    />

                    <span className="relative block w-full min-w-0 overflow-hidden rounded-2xl border border-red-100 bg-white px-3 py-3 text-center text-base font-semibold text-gray-700 shadow-sm transition hover:border-red-300 peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:text-white peer-checked:shadow-[0_10px_25px_rgba(220,38,38,0.25)] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-red-500">
                      <span className="absolute right-2 top-2 hidden h-6 w-6 place-items-center rounded-full bg-white/20 text-sm peer-checked:grid">
                        ✔
                      </span>
                      <span className="block truncate text-xs opacity-80">{v.model}</span>
                      <span className="mt-0.5 block truncate">{v.plate}</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">🙋 운전자</span>
            <input
              name="driverName"
              type="text"
              required
              placeholder="예: 정태훈"
              className="w-full min-w-0 rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">📍 최종 주행거리(누적 km)</span>
            <input
              name="odoEnd"
              required
              placeholder="예: 12345"
              inputMode="numeric"
              className="w-full min-w-0 rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">🔋 전기 잔여(%)</span>
            <select
              name="evRemainPct"
              required
              defaultValue="80"
              className="w-full min-w-0 rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            >
              {[20, 40, 60, 80, 100].map((v) => (
                <option key={v} value={v}>
                  {v}%
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">💳 하이패스 잔액(원)</span>
            <input
              name="hipassBalance"
              required
              placeholder="예: 35000"
              inputMode="numeric"
              className="w-full min-w-0 rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm sm:text-base">메모(선택)</span>
            <input
              name="note"
              type="text"
              className="w-full min-w-0 rounded-xl border bg-white px-3 py-3 text-base shadow-sm"
            />
          </label>

          <button className="w-full rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition hover:bg-red-500 sm:w-auto">
            저장
          </button>
        </form>
      </section>
    </main>
  );
}
