import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        {/* 헤더 */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-bold sm:text-2xl">📢 업무용 차량 운행 안내</h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm break-keep">
              사고 발생 시 연락처 / 결제 규정 / 충전 기준 / 운행일지 작성 기준
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex shrink-0 items-center rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
          >
            🏠 홈으로
          </Link>
        </div>

        {/* ✅ 상단 배너 (모바일 잘 보이게) */}
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-red-800">🚨 사고 발생 시 즉시 연락</div>
              <p className="mt-1 text-xs text-red-700 break-keep">
                안전 확보 → 신고/조치 → 사진/경위서 제출까지
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-xl border border-red-200 bg-white px-3 py-2">
                <div className="text-xs text-gray-500">렌트사 사고 신고 (redcap투어)</div>
                <div className="text-base font-extrabold text-red-700">1544-4599</div>
              </div>
              <div className="rounded-xl border border-red-200 bg-white px-3 py-2">
                <div className="text-xs text-gray-500">행정지원부</div>
                <div className="text-base font-extrabold text-red-700">031-5173-7667</div>
              </div>
            </div>
          </div>
        </div>

        {/* 본문 */}
        <div className="mt-6 space-y-8 text-sm leading-7 text-gray-800 sm:text-base">
          {/* 1 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold">1) 차량 사고 시 조치사항</h2>

            {/* 모바일에서도 보기 좋은 번호 카드 리스트 */}
            <ol className="mt-4 space-y-2">
              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  1
                </span>
                <b>렌트업체에 전화</b> → <b>차량번호</b> 전달 후 조치 요청
                <div className="mt-1 text-sm text-orange-800">
                  사고 신고 콜센터: <b>1544-4599</b>
                </div>
              </li>

              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  2
                </span>
                <b>상대차량 과실 사고도</b> 반드시 신고
              </li>

              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  3
                </span>
                안전한 장소에서 대기하며 <b>2차 사고</b>에 유의
              </li>

              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  4
                </span>
                복귀 후 <b>사고 사진 포함</b>하여 행정지원부에 <b>사고경위서</b> 문서 통보
              </li>

              <li className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white">
                  5
                </span>
                <b className="text-red-700">경미한 사고라도 반드시 행정지원부에 통보</b>
              </li>
            </ol>
          </section>

          {/* 2 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold">2) 유류/충전 카드 및 결제 안내</h2>

            <div className="mt-4 space-y-6">
              {/* 2-A */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold">
                    전기차 충전카드
                  </span>
                  <span className="text-xs text-gray-500 break-keep">
                    (카드 위치: 운전석쪽 카드꽂이)
                  </span>
                </div>

                <ol className="mt-3 space-y-2">
                  <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      1
                    </span>
                    충전방식 선택 시 <b className="text-red-700">C타입 / DC콤보</b> 선택 후 카드로 결제
                  </li>

                  <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      2
                    </span>
                    <b>급속</b>은 <b className="text-red-700">80%</b>, <b>완속</b>은{" "}
                    <b className="text-red-700">90%</b> 내외로 충전
                    <div className="mt-1 text-sm text-gray-600">
                      복귀 전 <b>사용한 만큼</b> 충전해 주세요.
                    </div>
                  </li>

                  <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      3
                    </span>
                    <b>충전구 위치</b> — EV3: 조수석 앞쪽 / 아이오닉5: 조수석 뒤쪽
                  </li>
                </ol>
              </div>

              {/* 2-B */}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold">
                    통행료/주차요금
                  </span>
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
                    주유카드 결제 불가
                  </span>
                </div>

                <ol className="mt-3 space-y-2">
                  <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      1
                    </span>
                    하이패스 잔액 부족/주차료 발생 시 <b>배차 신청자가 현금/개인카드로 선결제</b>
                  </li>

                  <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                      2
                    </span>
                    차량키 반납 시 <b>영수증 제출</b>
                  </li>

                  <li className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 break-keep">
                    <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-orange-700 text-xs font-bold text-white">
                      3
                    </span>
                    <b className="text-orange-800">주차비 지급 한도: 3만원</b>
                    <div className="mt-1 text-sm text-orange-800">
                      지출품의 위해 <b>사전 행정지원부 유선 협의 필수</b>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold">3) 기타 유의사항</h2>

            <ol className="mt-4 space-y-2">
              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  1
                </span>
                전기차량은 사용 후 <b className="text-red-700">충전기 꼭 꽂기</b>
              </li>

              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  2
                </span>
                사용 후 <b>계기판</b> / <b>하이패스 잔액</b> 확인 후{" "}
                <b className="text-red-700">차량운행일지 작성</b>
              </li>

              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  3
                </span>
                업무용 차량 <b>과태료</b>는 <b className="text-red-700">해당일 차량사용자 개별 납부</b>
              </li>

              {/* ✅ 금연 배지 강조 */}
              <li className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 break-keep">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-700 text-xs font-bold text-white">
                    4
                  </span>
                  <span className="font-semibold text-red-800">차량 내</span>
                  <span className="inline-flex items-center rounded-full bg-red-700 px-3 py-1 text-xs font-extrabold text-white">
                    🚭 금연
                  </span>
                  <span className="text-sm font-semibold text-red-800">입니다.</span>
                  <span className="inline-flex items-center rounded bg-white px-2 py-0.5 text-xs font-semibold text-red-700">
                    필수 준수
                  </span>
                </div>
              </li>

              <li className="rounded-xl border border-gray-200 bg-white px-3 py-2 break-keep">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                  5
                </span>
                차량 사용 후 <b>소지품</b> 확인, 차량 내 <b>쓰레기 정리</b> 부탁드립니다.
              </li>
            </ol>
          </section>
        </div>
      </section>
    </main>
  );
}
