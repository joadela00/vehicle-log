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

function BulletItem({
  icon = "•",
  children,
  tone = "normal",
}: {
  icon?: string;
  children: React.ReactNode;
  tone?: "normal" | "warn" | "danger";
}) {
  const box =
    tone === "danger"
      ? "border-red-200 bg-red-50"
      : tone === "warn"
      ? "border-orange-200 bg-orange-50"
      : "border-gray-200 bg-white";

  const iconStyle =
    tone === "danger"
      ? "text-red-700"
      : tone === "warn"
      ? "text-orange-800"
      : "text-gray-500";

  return (
    <li className={`grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border px-3 py-2 ${box}`}>
      <span className={`mt-1 text-lg leading-none ${iconStyle}`}>{icon}</span>
      <div className="break-keep leading-7">{children}</div>
    </li>
  );
}

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">📢 업무용 차량 운행 안내</h1>

          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
          >
            🏠 홈으로
          </Link>
        </div>

        {/* 상단 배너 */}
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-bold text-red-800">🚨 사고가 나면 먼저 안전을 확인해 주세요 🚨</div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-red-200 bg-white px-3 py-2">
                <div className="text-xs text-gray-500">사고 신고 (redcap투어)</div>
                <div className="text-base font-extrabold text-red-700">1544-4599</div>
              </div>
              <div className="rounded-xl border border-red-200 bg-white px-3 py-2">
                <div className="text-xs text-gray-500">행정지원부</div>
                <div className="text-base font-extrabold text-red-700">031-5173-7667</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-8 text-base text-gray-800 sm:text-lg">
          {/* 1 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold">1) 차량 사고 시 조치사항</h2>

            <ol className="mt-4 space-y-2">
              <NumItem n={1}>
                렌트업체에 전화해서 <b>차량번호</b>를 알려주시고, 조치를 요청해 주세요.
                <div className="mt-1 text-sm text-orange-800">
                  사고 신고 콜센터: <b>1544-4599</b>
                </div>
              </NumItem>

              <NumItem n={2}>
                <b>상대차량 과실</b>로 보이더라도 신고는 꼭 부탁드려요.
              </NumItem>

              <NumItem n={3}>
                가능한 안전한 곳으로 이동한 뒤, <b>2차 사고</b>에 주의해 주세요.
              </NumItem>

              <NumItem n={4}>
                복귀 후 <b>사고 사진</b>을 포함해서 <b>사고경위서</b>를 행정지원부로 전달해 주세요.
              </NumItem>

              <BulletItem icon="😥" tone="danger">
                작은 접촉이라도 <b className="text-red-700">행정지원부에 꼭 알려주세요.</b>
              </BulletItem>
            
            
            
            </ol>
          </section>

          {/* 2 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold">2) 유류/충전 카드 및 결제 안내</h2>

            <div className="mt-4 space-y-6">
              <div>
                <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold">
                  전기차 충전카드
                </div>

                {/* 순서가 있어서 1,2,3 */}
                <ol className="mt-3 space-y-2">
                  <NumItem n={1}>
                    충전방식은 <b className="text-red-700">C타입 / DC콤보</b>를 선택해 주세요.
                    <span className="text-gray-600"> (운전석쪽 카드꽂이 카드 사용)</span>
                  </NumItem>

                  <NumItem n={2}>
                    <b>급속</b>은 <b className="text-red-700">80%</b>, <b>완속</b>은{" "}
                    <b className="text-red-700">90%</b> 정도면 충분해요.
                    <div className="mt-1 text-sm text-gray-600">
                      복귀 전에는 <b>사용한 만큼</b> 충전해 주시면 좋아요.
                    </div>
                  </NumItem>

                  <NumItem n={3}>
                    충전구 위치 — EV3: 조수석 앞쪽 / 아이오닉5: 조수석 뒤쪽
                  </NumItem>
                </ol>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold">
                    통행료/주차요금
                  </span>
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    주유카드 결제 불가
                  </span>
                </div>

                {/* 이것도 “절차”라 1,2,3 유지 */}
                <ol className="mt-3 space-y-2">
                  <NumItem n={1}>
                    하이패스 잔액이 부족하거나 주차료가 생기면, <b>운전자가 먼저 결제</b>해 주세요.
                  </NumItem>

                  <NumItem n={2}>
                    차량키 반납할 때 <b>영수증</b>을 함께 제출해 주세요.
                  </NumItem>

                  <NumItem n={3}>
                    주차비는 <b className="text-orange-800">최대 3만원</b>까지 가능해요.
                  </NumItem>
                </ol>
              </div>
            </div>
          </section>

          {/* 3 */}

<section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
  <h2 className="text-lg font-bold">3) 기타 유의사항</h2>

  <ul className="mt-4 space-y-2">

    {/* 기본 항목 */}
    <li className="grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <div className="break-keep leading-7">
        전기차는 사용 후 <b className="text-red-700">충전기를 꼭 연결</b>해 주세요.
      </div>
    </li>

    <li className="grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <div className="break-keep leading-7">
        운행 후 <b>계기판</b>과 <b>하이패스 잔액</b>을 확인하고
        <b className="text-red-700"> 운행일지를 작성</b>해 주세요.
      </div>
    </li>

    <li className="grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <div className="break-keep leading-7">
        과태료는 <b className="text-red-700">해당일 차량사용자</b>가 납부해 주세요.
      </div>
    </li>

    {/* 🚭 금연 항목 (요청한 코드 적용) */}
    <li className="grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
      <span className="mt-1 text-lg">🚭</span>
      <div className="break-keep leading-7">
        차량 내{" "}
        <span className="inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-xs font-extrabold text-white">
          금연
        </span>
        입니다.
        <span className="ml-2 inline-flex items-center rounded bg-white px-2 py-0.5 text-xs font-semibold text-red-700">
          꼭 지켜주세요
        </span>
      </div>
    </li>

    <li className="grid grid-cols-[28px_1fr] items-start gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
      <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900">
        <span className="h-2 w-2 rounded-full bg-white" />
      </span>
      <div className="break-keep leading-7">
        하차 전 <b>소지품</b>을 확인하고 차량 내 <b>쓰레기 정리</b>를 부탁드립니다.
      </div>
    </li>

  </ul>
</section>

          
        </div>
      </section>
    </main>
  );
}
