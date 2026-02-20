import Link from "next/link";

function NumItem({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <li className="grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
        {n}
      </span>
      <div className="break-keep leading-7">{children}</div>
    </li>
  );
}

function IconItem({
  icon,
  children,
  tone = "normal",
}: {
  icon: string;
  children: React.ReactNode;
  tone?: "normal" | "warn" | "danger";
}) {
  const box =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : tone === "warn"
      ? "border-orange-200 bg-orange-50"
      : "border-gray-200 bg-white";

  return (
    <li className={`grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border px-3 py-2 ${box}`}>
      <span className="mt-1 text-lg">{icon}</span>
      <div className="break-keep leading-7">{children}</div>
    </li>
  );
}

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow sm:p-7">

        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">📢 업무용 차량 운행 안내</h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              꼭 필요한 내용만 간단히 정리했어요 🙂
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
          >
            🏠 홈으로
          </Link>
        </div>

        {/* 사고 배너 */}
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="text-sm font-semibold text-red-800">
            🚨 사고 발생 시 먼저 안전을 확보해 주세요.
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border bg-white px-3 py-2">
              <div className="text-xs text-gray-500">렌트사 사고 신고</div>
              <div className="font-extrabold text-red-700">1544-4599</div>
            </div>
            <div className="rounded-xl border bg-white px-3 py-2">
              <div className="text-xs text-gray-500">행정지원부</div>
              <div className="font-extrabold text-red-700">031-5173-7667</div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-8 text-sm sm:text-base">

          {/* 1 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">1) 차량 사고 시 조치사항</h2>

            <ol className="mt-4 space-y-2">
              <NumItem n={1}>
                렌트업체에 전화 후 <b>차량번호</b>를 전달해 주세요.
              </NumItem>

              <NumItem n={2}>
                <b>상대차량 과실 사고도</b> 꼭 신고해 주세요.
              </NumItem>

              <NumItem n={3}>
                안전한 장소로 이동 후 <b>2차 사고</b>에 주의해 주세요.
              </NumItem>

              <NumItem n={4}>
                복귀 후 <b>사고 사진</b>과 함께 사고경위서를 제출해 주세요.
              </NumItem>

              <NumItem n={5}>
                작은 사고라도 <b className="text-red-700">행정지원부에 반드시 통보</b>해 주세요.
              </NumItem>
            </ol>
          </section>

          {/* 2 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">2) 유류/충전 카드 및 결제 안내</h2>

            <div className="mt-4 space-y-6">

              <div>
                <h3 className="font-semibold">전기차 충전</h3>
                <ol className="mt-3 space-y-2">
                  <NumItem n={1}>
                    충전방식은 <b>C타입 / DC콤보</b>를 선택해 주세요.
                  </NumItem>

                  <NumItem n={2}>
                    급속은 <b className="text-red-700">80%</b>, 완속은{" "}
                    <b className="text-red-700">90%</b> 정도로 충전해 주세요.
                  </NumItem>

                  <NumItem n={3}>
                    충전구 위치 — EV3(앞쪽), 아이오닉5(뒤쪽)
                  </NumItem>
                </ol>
              </div>

              <div>
                <h3 className="font-semibold">통행료/주차요금</h3>

                <ul className="mt-3 space-y-2">
                  <IconItem icon="⚠️" tone="warn">
                    주유카드로는 통행료 및 주차요금 결제가 불가합니다.
                  </IconItem>

                  <IconItem icon="📌">
                    우선 개인 결제 후, 차량 반납 시 영수증을 제출해 주세요.
                  </IconItem>

                  <IconItem icon="⚠️" tone="warn">
                    주차비 한도는 <b>3만원</b>이며, 사전 협의가 필요합니다.
                  </IconItem>
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">3) 기타 유의사항</h2>

            <ul className="mt-4 space-y-2">
              <IconItem icon="✅">
                사용 후 <b>충전기 연결</b>을 꼭 부탁드려요.
              </IconItem>

              <IconItem icon="📌">
                계기판 및 하이패스 잔액 확인 후 운행일지를 작성해 주세요.
              </IconItem>

              <IconItem icon="⚠️" tone="warn">
                과태료는 해당일 차량사용자가 납부해 주세요.
              </IconItem>

              <IconItem icon="🚫" tone="danger">
                차량 내 <b>금연</b>입니다.
              </IconItem>

              <IconItem icon="✅">
                소지품 확인 및 쓰레기 정리를 부탁드립니다.
              </IconItem>
            </ul>
          </section>

        </div>
      </section>
    </main>
  );
}
