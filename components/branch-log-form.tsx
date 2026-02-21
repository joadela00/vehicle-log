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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialBranchCode, safeBranches]);

  const selectedBranchName = useMemo(() => {
    const found = safeBranches.find((b) => b.code === selectedBranchCode);
    return found?.name || selectedBranchCode;
  }, [safeBranches, selectedBranchCode]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => v.branchCode === selectedBranchCode);
  }, [vehicles, selectedBranchCode]);

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

  // ✅ 입력칸이 삐져나가지 않게: w-full + min-w-0 + max-w-full + box-border
  const FieldInput =
    "block w-full max-w-full box-border min-w-0 rounded-xl border border-red-200 bg-white px-3 py-3 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-100";

  return (
    <main className="mx-auto w-full max-w-3xl overflow-x-clip p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pr-[calc(1rem+env(safe-area-inset-right))] sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide text-red-500">🚘 DAILY LOG</p>
          <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl text-red-600">
            차량 운행일지
          </h1>
          <p className="mt-1 text-sm text-gray-500">오늘도 안전운전 하셨지요?</p>
        </div>

        {saved ? (
          <p className="mt-4 rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            💾 저장되었습니다.
          </p>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            href="/guide"
          >
            📢 운행안내
          </Link>

          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            href={tripsHref}
          >
            📚 운행목록
          </Link>

          {showAdminButton ? (
            <Link
              className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              href={`/admin/${selectedBranchCode}`}
            >
              🛠️ 관리자
            </Link>
          ) : null}
        </div>

        {/* ✅ 지사 선택: 펼침/접힘 */}
        <div
          className={`mt-4 rounded-2xl border border-red-100 bg-red-50/40 transition-all ${
            branchPickerOpen ? "p-3" : "px-3 py-2 bg-white"
          }`}
        >
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
                        ? "border-red-600 text-red-700 font-semibold"
                        : "border-red-200 bg-white hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                    }`}
                  >
                    {branch.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setBranchPickerOpen(true)}
                className="min-w-0 flex-1 truncate rounded-xl border border-red-300 bg-white px-3 py-2 text-left text-sm font-semibold text-gray-900 hover:border-red-400"
                title={selectedBranchName}
              >
                {selectedBranchName}
              </button>

              <button
                type="button"
                onClick={() => setBranchPickerOpen(true)}
                className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                지사 변경
              </button>
            </div>
          )}
        </div>

        <form
          method="POST"
          action="/api/trips/create"
          className="mt-6 grid gap-4 rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm"
        >
          <input
            type="hidden"
            name="returnTo"
            value={`/?branch=${encodeURIComponent(selectedBranchCode)}`}
          />

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">📅 날짜</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className={FieldInput}
              style={{ WebkitAppearance: "none", appearance: "none" }}
            />
          </label>

          {/* ✅ 차량 라디오 카드: 슬림 + 테두리만 빨강 강조 + 차종 이모지 제거 */}
          <div className="grid gap-2 min-w-0">
            <span className="text-sm font-semibold sm:text-base">🚗 차량</span>

            {filteredVehicles.length === 0 ? (
              <p className="rounded-xl border border-red-100 bg-red-50/40 px-3 py-3 text-sm text-gray-600">
                선택한 지사에 등록된 차량이 없습니다.
              </p>
            ) : (
              <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-3">
                {filteredVehicles.map((v) => (
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

                    <span
                      className="block w-full min-w-0 overflow-hidden rounded-xl border border-red-200 bg-white px-3 py-2 text-center text-sm text-gray-800 transition hover:bg-red-50
                                 peer-checked:border-red-600 peer-checked:border-2 peer-checked:font-semibold"
                    >
                      <span className="block truncate text-[11px] opacity-70">
                        {v.model}
                      </span>
                      <span className="block truncate">{v.plate}</span>
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
              className={FieldInput}
            />
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">📍 최종 주행거리(누적 km)</span>
            <input
              name="odoEnd"
              required
              placeholder="예: 12345"
              inputMode="numeric"
              className={FieldInput}
            />
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm font-semibold sm:text-base">🔋 전기 잔여(%)</span>
            <select
              name="evRemainPct"
              required
              defaultValue="80"
              className={FieldInput}
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
              className={FieldInput}
            />
          </label>

          <label className="grid gap-1 min-w-0">
            <span className="text-sm sm:text-base">📝 메모(선택)</span>
            <input name="note" type="text" className={FieldInput} />
          </label>

          <button className="w-full rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition hover:bg-red-700 sm:w-auto">
            저장
          </button>
        </form>
      </section>
    </main>
  );
}
