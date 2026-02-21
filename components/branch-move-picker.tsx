"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type BranchOption = {
  code: string;
  name: string;
};

export default function BranchMovePicker({
  branches,
  currentCode,
}: {
  branches: BranchOption[];
  currentCode: string;
}) {
  const router = useRouter();
  const validBranches = useMemo(
    () =>
      branches
        .map((branch) => ({
          code: String(branch.code ?? "").trim(),
          name: String(branch.name ?? "").trim(),
        }))
        .filter((branch) => branch.code.length > 0),
    [branches]
  );

  const [selectedCode, setSelectedCode] = useState(
    validBranches.find((branch) => branch.code === currentCode)?.code ??
      validBranches[0]?.code ??
      currentCode
  );

  const onMove = () => {
    if (!selectedCode) return;
    router.push(`/branches/${selectedCode}`);
  };

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <select
        className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm"
        value={selectedCode}
        onChange={(event) => setSelectedCode(event.target.value)}
      >
        {validBranches.map((branch) => (
          <option key={branch.code} value={branch.code}>
            {branch.name || branch.code}
          </option>
        ))}
      </select>

      <button
        type="button"
        className="rounded-lg border border-red-300 bg-white px-3 py-2 text-sm font-semibold hover:border-red-500 hover:text-red-600"
        onClick={onMove}
      >
        이동
      </button>
    </div>
  );
}
