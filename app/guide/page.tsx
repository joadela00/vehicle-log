import Link from "next/link";

export default function GuidePage() {
  return (
    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl font-bold sm:text-2xl">📢 업무용 차량 운행 안내</h1>
          <Link
            href="/"
            className="shrink-0 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-medium hover:border-red-400 hover:text-red-600"
          >
            🏠홈으로
          </Link>
        </div>

        <div className="mt-6 space-y-6 text-sm leading-7 text-gray-800 sm:text-base">
          <section>
            <h2 className="text-lg font-bold">1. 차량 사고 시 조치사항</h2>
            <p className="font-semibold text-red-600">행정지원부: ☎031-5173-7667</p>
            <ul className="mt-2 list-none space-y-2">
              <li>
                가. 업무용 차량 사고 시 렌트업체로 전화하여 해당 차량번호를 알려주고 조치 요청
                <p className="ml-4 text-orange-700"> redcap투어 사고 신고 콜센터: 1544-4599</p>
              </li>
              <li>나. 상대차량 과실로 발생된 사고도 신고</li>
              <li>다. 안전한 장소에서 조치가 이루어질 때까지 2차사고 등에 주의</li>
              <li>라. 출장 복귀 후 사고관련 사진을 포함하여 행정지원부로 사고경위서 문서 통보</li>
              <li>마. 경미한 사고라도 반드시 행정지원부 통보 요망</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold">2. 유류공동 구매카드</h2>
            <div className="mt-2 space-y-2">
              <p className="font-semibold">가. 전기차 충전카드</p>
              <ul className="ml-4 list-none space-y-1 text-gray-700">
                <li>
                 <p className="font-semibold">(충전소 이용)</p> 충전방식 선택 시 C타입/DC콤보 선택 / 운전석쪽 카드꽂이에 있는 카드 사용
                </li>
                <li>
                  급속 이용 시 80%, 완속 이용 시 90% 내외로 충전 / 가급적 복귀 시 이용 전 충전율만큼 충전 요망
                </li>
                <li><p className="font-semibold"> (충전구 위치) </p> EV3: 조수석 앞쪽 / 아이오닉5: 조수석 뒤쪽</li>
              </ul>
              <p className="font-semibold">나. 운행 중 통행료와 주차요금은 주유카드로 결제 불가</p>
              <ul className="ml-4 list-none space-y-1 text-gray-700">
                <li>
                  운행 중 통행료(하이패스 잔액 부족 시)와 주차료가 발생 하는 경우 배차 신청자가 우선 현금/개인카드로 지급 후 차량키 반납 시 영수증 제출
                </li>
                <li>
                  ※ 주차비 지급한도: 3만원/ 지출품의를 위해 사전에 행정지원부로 유선 협의必
                </li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold">3. 기타 유의사항</h2>
            <ul className="mt-2 list-none space-y-2">
              <li>가. 전기차량은 사용 후 충전기 꼭 꽂아주세요.</li>
              <li>
                나. 사용 후 계기판, 하이패스 잔액 확인하시고 차량운행일지 작성 부탁드립니다.
              </li>
              <li>다. 업무용 차량 과태료 : 해당일 차량사용자가 개별 납부</li>
              <li>라. 차량 내  <p className= "underline decoration-red-300 underline-offset-4"> 금연 </p>입니다.</li>
              <li>
                마. 차량 사용 후 소지품은 꼭 챙겨주시고, 차량 내 발생한 쓰레기는 정리 부탁드립니다.
              </li>
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
