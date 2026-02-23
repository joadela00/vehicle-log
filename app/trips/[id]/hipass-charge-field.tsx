"use client";

import { useState } from "react";

type HipassChargeFieldProps = {
  fieldInputClass: string;
  defaultHipassBalance: number;
  defaultHipassCharge: number | null;
};

export default function HipassChargeField({
  fieldInputClass,
  defaultHipassBalance,
  defaultHipassCharge,
}: HipassChargeFieldProps) {
  const [hipassCharged, setHipassCharged] = useState(defaultHipassCharge !== null);

  return (
    <div className="grid gap-1 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-semibold sm:text-base">💳 하이패스 잔액(원)</span>

        <label className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700">
          <input
            type="checkbox"
            checked={hipassCharged}
            onChange={(e) => setHipassCharged(e.target.checked)}
            className="h-4 w-4 accent-red-600"
          />
          💸충전액 수정
        </label>
      </div>

      <input
        name="hipassBalance"
        required
        inputMode="numeric"
        defaultValue={defaultHipassBalance}
        className={fieldInputClass}
      />

      {hipassCharged ? (
        <div className="mt-2 space-y-2 rounded-xl border border-red-100 bg-red-50/30 p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-gray-800">➕ 충전금액(원)</span>
            <span className="text-xs font-medium text-gray-500">충전한 날만</span>
          </div>

          <input
            name="hipassCharge"
            inputMode="numeric"
            defaultValue={defaultHipassCharge ?? ""}
            className={fieldInputClass}
            placeholder="예: 10000"
            required
          />
        </div>
      ) : null}
    </div>
  );
}
