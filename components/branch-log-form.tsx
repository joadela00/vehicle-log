"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MAIN_BRANCH_CODE } from "@/lib/branches";

type VehicleOption = {
  id: string;
  model: string;
  plate: string;
  branchCode: string;
};

type BranchOption = {
  code: string;
  name: string;
};

export default function BranchLogForm({
  initialBranchCode,
  vehicles,
  branches,
  saved,
}: {
  initialBranchCode: string;
  vehicles: VehicleOption[];
  branches: BranchOption[];
  saved: boolean;
}) {
  const today = new Date().toISOString().slice(0, 10);

  // ✅ 지역본부는 맨 마지막
  const safeBranches = useMemo(() => {
    const list = branches
      .map((b) => ({
        code: String(b.code ?? "").trim(),
        name: String(b.name ?? "").trim(),
      }))
      .filter((b) => b.code.length > 0);

    const normal = list.filter((b) => b.code !== MAIN_BRANCH_CODE);
    const main = list.filter((b) => b.code === MAIN_BRANCH_CODE);
    return [...normal, ...main];
  }, [branches]);

  const initialSafe =
    safeBranches.find((b) => b.code === initialBranchCode)?.code ??
    safeBranches[0]?.code ??
    initialBranchCode;

  const [selectedBranchCode, setSelectedBranchCode] = useState(initialSafe);
  const [branchPickerOpen, setBranchPickerOpen] = useState(true);

  useEffect(() => {
    const next =
      safeBranches.find((b) => b.code === initialBranchCode)?.code ??
      safeBranches[0]?.code ??
      initialBranchCode;

    if (next && next !== selectedBranchCode) {
      setSelectedBranchCode(next);
      setBranchPickerOpen(false);
    }
  }, [initialBranchCode, safeBranches]);

  const selectedBranchName =
    safeBranches.find((b) => b.code === selectedBranchCode)?.name ??
    selectedBranchCode;

  const filteredVehicles = useMemo(
    () => vehicles.filter((v) => v.branchCode === selectedBranchCode),
    [vehicles, selectedBranchCode]
  );

  const [selectedVehicleId, setSelectedVehicleId] = useState("");

  useEffect(() => {
    const first = filteredVehicles[0]?.id ?? "";
    setSelectedVehicleId(first);
  }, [filteredVehicles, selectedBranchCode]);

  const showAdminButton = selectedBranchCode === MAIN_BRANCH_CODE;

  const tripsHref = useMemo(() => {
    const q = new URLSearchParams();
    if (selectedBranchCode) q.set("branchCode", selectedBranchCode);
    return `/trips?${q.toString()}`;
  }, [selectedBranchCode]);

  const FieldInput =
    "w-full rounded-xl border border-red-200 bg-white px-3 py-3 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-100";

  const chooseBranch = (code: string) => {
    setSelectedBranchCode(code);
    setBranchPickerOpen(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white p-5 shadow-sm sm:p-7">

        <h1 className="text-2xl font-bold sm:text-3xl text-red-600">
          🚘 차량 운행일지
        </h1>

        {saved && (
          <p className="mt-4 rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            💾 저장되었습니다.
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link className="rounded-lg border border-red-200 px-3 py-2 hover:bg-red-50" href="/guide">
            📢 운행안내
          </Link>

          <Link className="rounded-lg border border-red-200 px-3 py-2 hover:bg-red-50" href={tripsHref}>
            📚 운행목록
          </Link>

          {showAdminButton && (
            <Link className="rounded-lg border border-red-200 px-3 py-2 hover:bg-red-50"
              href={`/admin/${selectedBranchCode}`}>
              🛠️ 관리자
            </Link>
          )}
        </div>

        {/* 지사 선택 */}
        <div className={`mt-4 rounded-xl border border-red-100 ${
          branchPickerOpen ? "p-3 bg-red-50/40" : "px-3 py-2"
        }`}>

          {branchPickerOpen ? (
            <div className="flex flex-wrap gap-2 text-sm">
              {safeBranches.map((branch) => {
                const active = branch.code === selectedBranchCode;
                return (
                  <button
                    key={branch.code}
                    type="button"
                    onClick={() => chooseBranch(branch.code)}
                    className={`rounded-lg border px-3 py-1 transition ${
                      active
                        ? "border-red-600 border-2 font-semibold text-red-700"
                        : "border-red-200 hover:bg-red-50"
                    }`}
                  >
                    🏢 {branch.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 truncate rounded-lg border border-red-400 px-3 py-2 text-sm font-semibold text-red-700">
                🏢 {selectedBranchName}
              </div>

              <button
                type="button"
                onClick={() => setBranchPickerOpen(true)}
                className="rounded-lg border border-red-200 px-3 py-2 text-sm hover:bg-red-50"
              >
                변경
              </button>
            </div>
          )}
        </div>

        <form
          method="POST"
          action="/api/trips/create"
          className="mt-6 grid gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm"
        >
          <input
            type="hidden"
            name="returnTo"
            value={`/?branch=${encodeURIComponent(selectedBranchCode)}`}
          />

          <label className="grid gap-1">
            <span className="text-sm font-semibold">📅 날짜</span>
            <input name="date" type="date" required defaultValue={today}
              className={FieldInput} />
          </label>

          {/* 차량 라디오 카드 (테두리만 빨강 강조) */}
          <div className="grid gap-2">
            <span className="text-sm font-semibold">🚗 차량</span>

            {filteredVehicles.length === 0 ? (
              <p className="rounded-lg border border-red-100 bg-red-50 px-3 py-3 text-sm text-gray-600">
                선택한 지사에 등록된 차량이 없습니다.
              </p>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3">
                {filteredVehicles.map((v) => (
                  <label key={v.id} className="cursor-pointer">
                    <input
                      type="radio"
                      name="vehicleId"
                      value={v.id}
                      checked={selectedVehicleId === v.id}
                      onChange={() => setSelectedVehicleId(v.id)}
                      className="peer sr-only"
                      required
                    />

                    <span className="block rounded-xl border border-red-200 px-3 py-2 text-center text-sm transition
                      peer-checked:border-red-600 peer-checked:border-2 peer-checked:font-semibold
                      hover:bg-red-50">

                      <div className="truncate text-[11px] opacity-70">
                        🚘 {v.model}
                      </div>
                      <div className="truncate">
                        {v.plate}
                      </div>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">🙋 운전자</span>
            <input name="driverName" required className={FieldInput} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">📍 최종 주행거리</span>
            <input name="odoEnd" required inputMode="numeric" className={FieldInput} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">🔋 전기 잔여(%)</span>
            <select name="evRemainPct" required defaultValue="80" className={FieldInput}>
              {[20, 40, 60, 80, 100].map((v) => (
                <option key={v} value={v}>{v}%</option>
              ))}
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">💳 하이패스 잔액</span>
            <input name="hipassBalance" required inputMode="numeric" className={FieldInput} />
          </label>

          <label className="grid gap-1">
            <span className="text-sm">📝 메모</span>
            <input name="note" className={FieldInput} />
          </label>

          <button className="rounded-xl bg-red-600 px-4 py-3 text-white hover:bg-red-700">
            저장
          </button>
        </form>

      </section>
    </main>
  );
}
