import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">📢 업무용 차량 운행 안내</h1>
            <p className="mt-1 text-xs text-gray-500 sm:text-sm">
              사고/충전/결제/작성 필수 항목을 정리했습니다.
            </p>
          </div>

          <Link
            href="/"
            className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
          >
            🏠 홈으로
          </Link>
        </div>

        <div className="mt-6 space-y-8 text-sm leading-7 text-gray-800 sm:text-base">
          {/* 1 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="text-lg font-bold">1) 차량 사고 시 조치사항</h2>

              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm">
                <div className="font-semibold text-red-700">행정지원부</div>
                <div className="font-bold text-red-700">☎ 031-5173-7667</div>
              </div>
            </div>

            <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2">
              <span className="font-semibold text-orange-800">렌트사 사고 신고 콜센터:</span>{" "}
              <span className="font-extrabold text-orange-800">1544-4599</span>
              <span className="ml-2 text-xs text-orange-700">(redcap투어)</span>
            </div>

            <ol className="mt-4 list-decimal space-y-2 pl-5">
              <li>
                사고 발생 시 <b>렌트업체</b>에 전화 → <b>차량번호</b> 전달 후 조치 요청
              </li>
              <li>
                <b>상대차량 과실 사고도</b> 반드시 신고
              </li>
              <li>
                안전한 장소에서 대기하며 <b>2차 사고</b>에 유의
              </li>
              <li>
                출장 복귀 후 <b>사고 사진 포함</b>하여 행정지원부에 <b>사고경위서</b> 문서 통보
              </li>
              <li className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                <b className="text-red-700">경미한 사고라도 반드시 행정지원부에 통보</b>
              </li>
            </ol>
          </section>

          {/* 2 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">2) 유류/충전 카드 및 결제 안내</h2>

            <div className="mt-4 space-y-5">
              <div>
                <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold">
                  전기차 충전카드
                </div>

                <ul className="mt-3 space-y-2">
                  <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <b>(충전소 이용)</b> 충전방식 선택 시{" "}
                    <b className="text-red-700">C타입 / DC콤보</b> 선택, 운전석쪽 카드꽂이에 있는{" "}
                    <b>카드 사용</b>
                  </li>
                  <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <b>급속</b>은 <b className="text-red-700">80%</b>, <b>완속</b>은{" "}
                    <b className="text-red-700">90%</b> 내외로 충전
                    <div className="mt-1 text-sm text-gray-600">
                      복귀 전 <b>사용한 만큼</b> 충전해 주세요.
                    </div>
                  </li>
                  <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                    <b>(충전구 위치)</b> EV3: 조수석 앞쪽 / 아이오닉5: 조수석 뒤쪽
                  </li>
                </ul>
              </div>

              <div>
                <div className="inline-flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold">
                  통행료/주차요금 결제
                </div>

                <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2">
                  <b className="text-red-700">
                    운행 중 통행료(하이패스 잔액 부족 시)와 주차요금은 주유카드로 결제 불가
                  </b>
                </div>

                <ul className="mt-3 space-y-2">
                  <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                    통행료/주차료 발생 시{" "}
                    <b>배차 신청자가 우선 현금/개인카드로 결제</b> 후, 차량키 반납 시{" "}
                    <b>영수증 제출</b>
                  </li>
                  <li className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2">
                    <b className="text-orange-800">주차비 지급 한도: 3만원</b>
                    <div className="mt-1 text-sm text-orange-800">
                      지출품의를 위해 <b>사전에 행정지원부와 유선 협의 필수</b>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* 3 */}
          <section className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">3) 기타 유의사항</h2>

            <ul className="mt-4 space-y-2">
              <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                전기차량은 사용 후 <b className="text-red-700">충전기 꼭 꽂기</b>
              </li>
              <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                사용 후 <b>계기판</b> / <b>하이패스 잔액</b> 확인 후{" "}
                <b className="text-red-700">차량운행일지 작성</b>
              </li>
              <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                업무용 차량 <b>과태료</b>는 <b className="text-red-700">해당일 차량사용자 개별 납부</b>
              </li>
              <li className="rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                차량 내{" "}
                <b className="text-red-700">금연</b>
                <span className="ml-2 rounded bg-white px-2 py-0.5 text-xs font-semibold text-red-700">
                  필수 준수
                </span>
              </li>
              <li className="rounded-lg border border-gray-200 bg-white px-3 py-2">
                차량 사용 후 <b>소지품</b> 확인, 차량 내 <b>쓰레기 정리</b> 부탁드립니다.
              </li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
