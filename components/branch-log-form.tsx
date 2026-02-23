"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
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

type Notice = { type: "success" | "error"; message: string } | null;

function pickOne(list: string[]) {
  if (list.length === 0) return "";
  return list[Math.floor(Math.random() * list.length)];
}

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

  // ✅ 첫 화면 문구(랜덤) - 한 번 뽑으면 리렌더돼도 고정
  const HERO_MESSAGES = useMemo(
    () => [
      "출장 수고 많으셨습니다.",
      "먼 길 다녀오시느라 고생하셨습니다.",
      "운전하느라 피곤하시죠?",
      "차키 반납, 전기 충전 잊지 말아주세요",
      "운행 후 차량 상태를 점검해주세요.",
      "차량 정리 후 마무리 부탁드립니다.",
    ],
    [],
  );
  const [heroMessage] = useState(() => pickOne(HERO_MESSAGES));

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

  // ✅ 초기값: 쿼리로 들어온 값이 "유효할 때만" 선택, 아니면 빈 값(미선택)
  const initialSafe = useMemo(() => {
    const code = String(initialBranchCode ?? "").trim();
    if (!code) return "";
    return safeBranches.find((b) => b.code === code)?.code ?? "";
  }, [initialBranchCode, safeBranches]);

  const [selectedBranchCode, setSelectedBranchCode] = useState(initialSafe);

  // ✅ 첫 화면: 오므림(닫힘)
  const [branchPickerOpen, setBranchPickerOpen] = useState(false);

  // ✅ 성공/에러 알림(자동으로 사라짐)
  const [notice, setNotice] = useState<Notice>(null);

  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(null), 1800);
    return () => clearTimeout(t);
  }, [notice]);

  // ✅ 저장 후(saved=1) 들어오면 '저장되었습니다'도 토스트처럼 잠깐 띄우고 사라짐
  useEffect(() => {
    if (!saved) return;
    setNotice({ type: "success", message: "저장되었습니다." });
    setBranchPickerOpen(false);
  }, [saved]);

  // ✅ initialBranchCode가 실제로 있을 때만 동기화(없으면 자동선택 금지)
  useEffect(() => {
    if (!initialSafe) return;

    if (initialSafe !== selectedBranchCode) {
      setSelectedBranchCode(initialSafe);
    }
    setBranchPickerOpen(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialSafe]);

  const selectedBranchName = useMemo(() => {
    const found = safeBranches.find((b) => b.code === selectedBranchCode);
    return found?.name || selectedBranchCode;
  }, [safeBranches, selectedBranchCode]);

  const filteredVehicles = useMemo(() => {
    if (!selectedBranchCode) return [];
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
    const qs = q.toString();
    return qs ? `/trips?${qs}` : `/trips`;
  }, [selectedBranchCode]);

  const chooseBranch = (code: string) => {
    setSelectedBranchCode(code);
    setBranchPickerOpen(false);
  };

  // ✅ 운행목록 클릭 가드: 소속 미선택이면 알림 띄우고 이동 막기
  const guardNeedBranch = (e: MouseEvent<HTMLAnchorElement>) => {
    if (selectedBranchCode) return;
    e.preventDefault();
    setNotice({ type: "error", message: "먼저 소속을 선택해주세요" });
    setBranchPickerOpen(true);
  };

  const FieldInput =
    "block h-12 w-full max-w-full box-border min-w-0 appearance-none rounded-xl border border-red-200 bg-white px-3 text-base shadow-sm focus:border-red-500 focus:ring-2 focus:ring-red-100";

  // ✅ iOS 사파리에서 type=date 텍스트 상단 붙는 현상 보정(날짜칸만)
  const DateInput =
    FieldInput +
    " flex items-center leading-none [-webkit-appearance:none]";

  // ✅ 전기 잔여(%) 상태(선택값에 따라 뱃지 표시)
  const [evRemainPct, setEvRemainPct] = useState<string>("80");

  const evBadge = useMemo(() => {
    if (evRemainPct === "20" || evRemainPct === "40") {
      return {
        text: "🚨 절대충전",
        className:
          "inline-flex items-center rounded-full border border-red-300 bg-red-100 px-2 py-0.5 text-xs font-extrabold text-red-800 shadow-sm",
      };
    }
    if (evRemainPct === "60") {
      return {
        text: "⚡ 충전요망",
        className:
          "inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800",
      };
    }
    return null;
  }, [evRemainPct]);

  // ✅ 최근값 자동 채움 (하이패스/최종주행거리)
  const [hipassBalance, setHipassBalance] = useState<string>("");
  const [odoEnd, setOdoEnd] = useState<string>("");
  const [latestOdoEnd, setLatestOdoEnd] = useState<number | null>(null);
  const odoEndInputRef = useRef<HTMLInputElement | null>(null);

  // ✅ (추가) 하이패스 충전: 체크 시에만 입력칸 노출 + 서버로 전송
  const [hipassCharged, setHipassCharged] = useState(false);
  const [hipassCharge, setHipassCharge] = useState<string>("");

  useEffect(() => {
    if (!selectedBranchCode || !selectedVehicleId) {
      setHipassBalance("");
      setOdoEnd("");
      setLatestOdoEnd(null);
      setHipassCharged(false);
      setHipassCharge("");
      return;
    }

    const ac = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/trips/latest?branchCode=${encodeURIComponent(
            selectedBranchCode,
          )}&vehicleId=${encodeURIComponent(selectedVehicleId)}`,
          { cache: "no-store", signal: ac.signal },
        );
        if (!res.ok) return;

        const data: {
          hipassBalance: number | null;
          odoEnd: number | null;
        } = await res.json();

        setHipassBalance(
          data.hipassBalance == null ? "" : String(data.hipassBalance),
        );
        setOdoEnd(data.odoEnd == null ? "" : String(data.odoEnd));
        setLatestOdoEnd(data.odoEnd ?? null);

        // ✅ 차량/지사 바뀌어 최신값 로드되면 충전 입력은 기본 OFF
        setHipassCharged(false);
        setHipassCharge("");
      } catch {
        // ignore
      }
    })();

    return () => ac.abort();
  }, [selectedBranchCode, selectedVehicleId]);

  useEffect(() => {
    if (!hipassCharged) setHipassCharge("");
  }, [hipassCharged]);

  const validateOdoEnd = (value: string) => {
    const input = odoEndInputRef.current;
    if (!input) return;

    const normalizedValue = value.replaceAll(",", "").trim();
    const numericValue = Number(normalizedValue);
    if (
      latestOdoEnd !== null &&
      Number.isFinite(numericValue) &&
      normalizedValue !== "" &&
      numericValue < latestOdoEnd
    ) {
      input.setCustomValidity(
        `최종 주행거리는 이전 기록(${latestOdoEnd}km)보다 작을 수 없습니다.`,
      );
      return;
    }

    input.setCustomValidity("");
  };

  // ✅ 닫힘 상태에서 “선택된 후” 지사 버튼만 차량 선택처럼 굵은 빨간 테두리
  const branchClosedButtonClass =
    "min-w-0 flex-1 truncate rounded-xl bg-white px-3 py-3 text-left text-sm hover:bg-red-50 " +
    (selectedBranchCode
      ? "border border-red-200 border-2 border-red-600 font-semibold text-gray-900"
      : "border border-red-200 font-medium text-gray-500");

  return (
    <main className="mx-auto w-full max-w-3xl overflow-x-clip p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pr-[calc(1rem+env(safe-area-inset-right))] sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="min-w-0">
          <p className="text-sm font-bold tracking-wide text-red-500">
            🚘 DAILY LOG
          </p>
          <h1 className="mt-1 text-2xl font-extrabold text-red-600 sm:text-3xl">
            차량 운행일지
          </h1>
          <p className="mt-1 text-sm text-gray-500">{heroMessage}</p>
        </div>

        {notice ? (
          notice.type === "success" ? (
            <p className="mt-4 rounded-2xl border border-green-300 bg-green-50 px-3 py-2 text-sm font-semibold text-green-800">
              💾 {notice.message}
            </p>
          ) : (
            <p className="mt-4 rounded-2xl border border-red-400 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
              🚨 {notice.message}
            </p>
          )
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
            onClick={guardNeedBranch}
          >
            📚 운행목록
          </Link>

          {showAdminButton ? (
            <Link
              className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              href="/admin"
            >
              🛠️ 관리자
            </Link>
          ) : null}
        </div>

        {/* ✅ 지사 선택: 펼침/접힘 */}
        <div
          className={`mt-3 rounded-2xl border border-red-100 bg-red-50/40 transition-all ${
            branchPickerOpen ? "p-3" : "px-3 py-3 bg-white"
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
                className={branchClosedButtonClass}
                title={selectedBranchName}
              >
                {selectedBranchName || "소속을 선택해주세요"}
              </button>

              <button
                type="button"
                onClick={() => setBranchPickerOpen(true)}
                className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-3 text-sm font-medium hover:border-red-300 hover:bg-red-50 hover:text-red-600"
              >
                변경
              </button>
            </div>
          )}
        </div>

        <form
          method="POST"
          action="/api/trips/create"
          onSubmit={(e) => {
            validateOdoEnd(odoEnd);
            if (!e.currentTarget.reportValidity()) {
              e.preventDefault();
            }
          }}
          className="mt-3 grid gap-4 rounded-2xl border border-red-100 bg-white/90 p-5 shadow-sm"
        >
          <input
            type="hidden"
            name="returnTo"
            value={
              selectedBranchCode
                ? `/?branch=${encodeURIComponent(selectedBranchCode)}`
                : "/"
            }
          />

          <label className="grid min-w-0 gap-1">
            <span className="text-sm font-semibold sm:text-base">📅 날짜</span>
            <input
              name="date"
              type="date"
              required
              defaultValue={today}
              className={DateInput}   // ✅ 여기만 변경
            />
          </label>

          {/* ✅ 차량 */}
          <div className="grid min-w-0 gap-2">
            <span className="text-sm font-semibold sm:text-base">🚗 차량</span>

            {!selectedBranchCode ? (
              <p className="rounded-xl border border-red-100 bg-red-50/40 px-3 py-3 text-sm text-gray-600">
                먼저 소속을 선택해 주세요.
              </p>
            ) : filteredVehicles.length === 0 ? (
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
                      required={!!selectedBranchCode}
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

          <label className="grid min-w-0 gap-1">
            <span className="text-sm font-semibold sm:text-base">🙋 운전자</span>
            <input
              name="driverName"
              type="text"
              required
              placeholder="예: 정태훈"
              className={FieldInput}
            />
          </label>

          {/* ✅ 최종 주행거리 */}
          <label className="grid min-w-0 gap-1">
            <span className="text-sm font-semibold sm:text-base">
              📍 최종 주행거리(누적 km)
            </span>
            <input
              name="odoEnd"
              required
              placeholder="예: 12345"
              inputMode="numeric"
              className={FieldInput}
              value={odoEnd}
              ref={odoEndInputRef}
              onChange={(e) => {
                const nextValue = e.target.value;
                setOdoEnd(nextValue);
                validateOdoEnd(nextValue);
              }}
            />
          </label>

          {/* ✅ 전기 잔여(%) */}
          <label className="grid min-w-0 gap-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold sm:text-base">
                🔋 현재 전기 잔여(%)
              </span>
              {evBadge ? (
                <span className={evBadge.className}>{evBadge.text}</span>
              ) : null}
            </div>

            <select
              name="evRemainPct"
              required
              value={evRemainPct}
              onChange={(e) => setEvRemainPct(e.target.value)}
              className={
                evRemainPct === "20" || evRemainPct === "40"
                  ? `${FieldInput} border-red-400 focus:border-red-600 focus:ring-red-200`
                  : evRemainPct === "60"
                    ? `${FieldInput} border-amber-200 focus:border-amber-400 focus:ring-amber-100`
                    : FieldInput
              }
            >
              {[20, 40, 60, 80, 100].map((v) => (
                <option key={v} value={String(v)}>
                  {v}%
                </option>
              ))}
            </select>
          </label>

          {/* ✅ 하이패스 잔액 + (컴팩트) 충전 체크 */}
          <div className="grid min-w-0 gap-1">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold sm:text-base">
                💳 최종 하이패스 잔액(원)
              </span>

              <label className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-gray-700">
                <input
                  type="checkbox"
                  checked={hipassCharged}
                  onChange={(e) => setHipassCharged(e.target.checked)}
                  className="h-4 w-4 accent-red-600"
                />
                💸충전
              </label>
            </div>

            <input
              name="hipassBalance"
              required
              placeholder="예: 35000"
              inputMode="numeric"
              className={FieldInput}
              value={hipassBalance}
              onChange={(e) => setHipassBalance(e.target.value)}
            />

            {/* ✅ 체크하면 아래가 열림 */}
            {hipassCharged ? (
              <div className="mt-2 space-y-2 rounded-xl border border-red-100 bg-red-50/30 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-gray-800">
                    ➕ 충전금액(원)
                  </span>
                  <span className="text-xs font-medium text-gray-500">
                    충전한 날만
                  </span>
                </div>

                <input
                  name="hipassCharge"
                  inputMode="numeric"
                  placeholder="예: 27000"
                  className={FieldInput}
                  value={hipassCharge}
                  onChange={(e) => setHipassCharge(e.target.value)}
                  required
                />
              </div>
            ) : null}
          </div>

          <label className="grid min-w-0 gap-1">
            <span className="text-sm sm:text-base">📝 메모(선택)</span>
            <input
              name="note"
              type="text"
              placeholder="예: 세차해주세요"
              className={FieldInput}
            />
          </label>

          <button className="w-full rounded-2xl bg-red-600 px-4 py-3 text-base font-semibold text-white shadow-[0_10px_25px_rgba(220,38,38,0.35)] transition hover:bg-red-700 sm:w-auto">
            저장
          </button>
        </form>
      </section>
    </main>
  );
}
