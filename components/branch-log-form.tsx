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

  // ✅ 지역본부는 항상 맨 마지막
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

  const chooseBranch = (code: string) => {
    setSelectedBranchCode(code);
    setBranchPickerOpen(false);
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-sm sm:p-7">

        {/* 헤더 */}
        <div>
          <p className="text-sm font-bold text-red-500">🚘 DAILY LOG</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
            {selectedBranchName} 차량 운행일지
          </h1>
        </div>

        {saved && (
          <p className="mt-4 rounded-xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            💾 저장되었습니다.
          </p>
        )}

        {/* 상단 버튼들 */}
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link className="rounded-xl border border-red-200 bg-white px-3 py-2 hover:text-red-600" href="/guide">
            📢 운행안내
          </Link>

          <Link className="rounded-xl border border-red-200 bg-white px-3 py-2 hover:text-red-600" href={tripsHref}>
            📚 운행목록
          </Link>

          {showAdminButton && (
            <Link className="rounded-xl border border-red-200 bg-white px-3 py-2 hover:text-red-600"
              href={`/admin/${selectedBranchCode}`}>
              🛠️ 관리자
            </Link>
          )}
        </div>

        {/* ✅ 지사 선택 영역 */}
        <div className={`mt-4 rounded-2xl border border-red-100 bg-red-50/40 transition-all ${
          branchPickerOpen ? "p-3" : "px-3 py-2"
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
                        ? "border-red-500 bg-red-600 text-white"
                        : "border-red-200 bg-white hover:border-red-300 hover:text-red-600"
                    }`}
                  >
                    {branch.name}
                  </button>
                );
              })}
            </div>
          ) : (
            // ✅ 접힌 상태: 제목 없이 한 줄
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 truncate rounded-xl border border-red-500 bg-red-600 px-3 py-2 text-sm font-semibold text-white">
                {selectedBranchName}
              </div>

              <button
                type="button"
                onClick={() => setBranchPickerOpen(true)}
                className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm hover:text-red-600"
              >
                변경
              </button>
            </div>
          )}
        </div>

        {/* 폼 */}
        <form method="POST"
          action="/api/trips/create"
          className="mt-6 grid gap-4 rounded-2xl border border-red-100 bg-white p-5 shadow-sm">

          <input type="hidden" name="returnTo"
            value={`/?branch=${encodeURIComponent(selectedBranchCode)}`} />

          <label className="grid gap-1">
            <span className="text-sm font-semibold">📅 날짜</span>
            <input name="date" type="date" required defaultValue={today}
              className="rounded-xl border px-3 py-3 text-base shadow-sm" />
          </label>

          <div>
            <span className="text-sm font-semibold">🚗 차량</span>

            {filteredVehicles.length === 0 ? (
              <p className="mt-2 rounded-xl border border-red-100 bg-red-50 px-3 py-3 text-sm text-gray-600">
                선택한 지사에 등록된 차량이 없습니다.
              </p>
            ) : (
              <div className="mt-2 grid gap-2 sm:grid-cols-3">
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
                    <span className="block rounded-2xl border border-red-100 bg-white px-3 py-3 text-center font-semibold shadow-sm transition peer-checked:border-red-600 peer-checked:bg-red-600 peer-checked:text-white">
                      <div className="text-xs opacity-80">{v.model}</div>
                      <div>{v.plate}</div>
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">🙋 운전자</span>
            <input name="driverName" required
              className="rounded-xl border px-3 py-3 text-base shadow-sm" />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">📍 최종 주행거리</span>
            <input name="odoEnd" required inputMode="numeric"
              className="rounded-xl border px-3 py-3 text-base shadow-sm" />
          </label>

          <button className="rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-md hover:bg-red-500">
            저장
          </button>
        </form>

      </section>
    </main>
  );
}
