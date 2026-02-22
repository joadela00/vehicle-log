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

  const initialSafe = useMemo(() => {
    const code = String(initialBranchCode ?? "").trim();
    if (!code) return "";
    return safeBranches.find((b) => b.code === code)?.code ?? "";
  }, [initialBranchCode, safeBranches]);

  const [selectedBranchCode, setSelectedBranchCode] = useState(initialSafe);
  const [branchPickerOpen, setBranchPickerOpen] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const guardNeedBranch = (e: React.MouseEvent) => {
    if (selectedBranchCode) return;
    e.preventDefault();
    setToast("먼저 소속을 선택해주세요");
    setBranchPickerOpen(true);
  };

  const selectedBranchName = useMemo(() => {
    const found = safeBranches.find((b) => b.code === selectedBranchCode);
    return found?.name || "";
  }, [safeBranches, selectedBranchCode]);

  const filteredVehicles = useMemo(() => {
    if (!selectedBranchCode) return [];
    return vehicles.filter((v) => v.branchCode === selectedBranchCode);
  }, [vehicles, selectedBranchCode]);

  useEffect(() => {
    const first = filteredVehicles[0]?.id ?? "";
    setSelectedVehicleId(first);
  }, [filteredVehicles]);

  const tripsHref = useMemo(() => {
    const q = new URLSearchParams();
    if (selectedBranchCode) q.set("branchCode", selectedBranchCode);
    const qs = q.toString();
    return qs ? `/trips?${qs}` : `/trips`;
  }, [selectedBranchCode]);

  const chooseBranch = (code: string) => {
    setSelectedBranchCode(code);
    setBranchPickerOpen(false);
  };

  const FieldInput =
    "block w-full rounded-xl border border-red-200 bg-white px-3 py-3 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-100";

  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-red-600">차량 운행일지</h1>

        {saved && (
          <p className="mt-4 rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
            💾 저장되었습니다.
          </p>
        )}

        {toast && (
          <p className="mt-3 rounded-2xl border border-red-400 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
            🚨 {toast}
          </p>
        )}

        <div className="mt-4 flex gap-2">
          <Link
            href={tripsHref}
            onClick={guardNeedBranch}
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:bg-red-50 hover:text-red-600"
          >
            📚 운행목록
          </Link>
        </div>

        <div className="mt-6">
          {branchPickerOpen ? (
            <div className="flex flex-wrap gap-2">
              {safeBranches.map((branch) => (
                <button
                  key={branch.code}
                  type="button"
                  onClick={() => chooseBranch(branch.code)}
                  className="rounded-lg border border-red-200 bg-white px-3 py-1 hover:bg-red-50"
                >
                  {branch.name}
                </button>
              ))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setBranchPickerOpen(true)}
              className="rounded-xl border border-red-300 bg-white px-3 py-2 font-semibold"
            >
              {selectedBranchName || "지사를 선택하세요"}
            </button>
          )}
        </div>

        <form
          method="POST"
          action="/api/trips/create"
          className="mt-6 grid gap-4"
        >
          <input
            type="hidden"
            name="returnTo"
            value={`/?branch=${encodeURIComponent(selectedBranchCode)}`}
          />

          <label className="grid gap-1">
            <span className="text-sm font-semibold">📅 날짜</span>
            <input
              name="date"
              type="date"
              defaultValue={today}
              required
              className={FieldInput}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-semibold">🙋 운전자</span>
            <input
              name="driverName"
              required
              className={FieldInput}
            />
          </label>

          <button className="rounded-2xl bg-red-600 px-4 py-3 text-white font-semibold hover:bg-red-700">
            저장
          </button>
        </form>
      </section>
    </main>
  );
}
