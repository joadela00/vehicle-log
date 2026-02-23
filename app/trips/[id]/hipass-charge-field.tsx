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
    <>
      <label className="grid gap-1">
        <span className="text-sm font-semibold sm:text-base">💳 하이패스 잔액(원)</span>
        <input
          name="hipassBalance"
          required
          inputMode="numeric"
          defaultValue={defaultHipassBalance}
          className={fieldInputClass}
        />
      </label>

      <label className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/40 px-3 py-2 text-sm font-medium sm:text-base">
        <input
          type="checkbox"
          checked={hipassCharged}
          onChange={(e) => setHipassCharged(e.target.checked)}
        />
        하이패스 충전했어요
      </label>

      {hipassCharged ? (
        <label className="grid gap-1">
          <span className="text-sm font-semibold sm:text-base">💸 하이패스 충전금액(원)</span>
          <input
            name="hipassCharge"
            inputMode="numeric"
            defaultValue={defaultHipassCharge ?? ""}
            className={fieldInputClass}
            placeholder="예: 10000"
          />
        </label>
      ) : null}
    </>
  );
}
