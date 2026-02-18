 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app/trips/page.tsx b/app/trips/page.tsx
index 56d3cda644a0bdc6d3eec619b9d2e19f1b2c8853..d448db132b1ecd0963bc1fc85a99a687b874d1d7 100644
--- a/app/trips/page.tsx
+++ b/app/trips/page.tsx
@@ -67,90 +67,112 @@ export default async function TripsPage({
         id: true,
         date: true,
         vehicleId: true,
         distance: true,
         tollCost: true,
         hipassBalance: true,
         vehicle: { select: { model: true, plate: true } },
         driver: { select: { name: true } },
       },
     }),
   ]);
 
   const hasNextPage = tripsRaw.length > PAGE_SIZE;
   const trips = hasNextPage ? tripsRaw.slice(0, PAGE_SIZE) : tripsRaw;
 
   const makePageHref = (nextPage: number) => {
     const query = new URLSearchParams();
     if (vehicleId) query.set("vehicleId", vehicleId);
     query.set("from", fromParam);
     query.set("to", toParam);
     query.set("page", String(nextPage));
     return `/trips?${query.toString()}`;
   };
 
   return (
-    <main className="max-w-5xl mx-auto p-6">
-      <h1 className="text-2xl font-bold">운행일지 전체 목록</h1>
+    <main className="mx-auto w-full max-w-5xl p-4 sm:p-6">
+      <h1 className="text-xl font-bold sm:text-2xl">운행일지 전체 목록</h1>
 
-      <form method="GET" className="mt-4 flex flex-wrap gap-3">
-        <select name="vehicleId" defaultValue={vehicleId} className="border rounded px-3 py-2">
+      <form method="GET" className="mt-4 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-3">
+        <select name="vehicleId" defaultValue={vehicleId} className="rounded border px-3 py-3 text-base">
           <option value="">전체 차량</option>
           {vehicles.map((v) => (
             <option key={v.id} value={v.id}>
               {v.model} / {v.plate}
             </option>
           ))}
         </select>
 
-        <input type="date" name="from" defaultValue={fromParam} className="border rounded px-3 py-2" />
-        <input type="date" name="to" defaultValue={toParam} className="border rounded px-3 py-2" />
+        <input type="date" name="from" defaultValue={fromParam} className="rounded border px-3 py-3 text-base" />
+        <input type="date" name="to" defaultValue={toParam} className="rounded border px-3 py-3 text-base" />
 
-        <button className="bg-black text-white rounded px-4 py-2">검색</button>
+        <button className="rounded bg-black px-4 py-3 text-base font-semibold text-white">검색</button>
       </form>
 
-      <div className="mt-4 flex items-center gap-3 text-sm">
+      <div className="mt-4 flex items-center gap-3 text-sm sm:text-base">
         <span>
           페이지 <b>{page}</b>
         </span>
         {page > 1 ? (
           <Link className="underline" href={makePageHref(page - 1)}>
             이전
           </Link>
         ) : (
           <span className="opacity-40">이전</span>
         )}
         {hasNextPage ? (
           <Link className="underline" href={makePageHref(page + 1)}>
             다음
           </Link>
         ) : (
           <span className="opacity-40">다음</span>
         )}
       </div>
 
-      <div className="overflow-x-auto mt-6">
+      <div className="mt-5 grid gap-3 sm:hidden">
+        {trips.map((t) => (
+          <article key={t.id} className="rounded-lg border p-3 text-sm">
+            <div className="font-semibold">{t.date.toISOString().slice(0, 10)}</div>
+            <div className="mt-1">차량: {t.vehicle ? `${t.vehicle.model} / ${t.vehicle.plate}` : "-"}</div>
+            <div>운전자: {t.driver?.name ?? "-"}</div>
+            <div>실제주행거리: {t.distance} km</div>
+            <div>통행료: {t.tollCost} 원</div>
+            <div>하이패스 잔액: {t.hipassBalance} 원</div>
+            <div className="mt-2 flex gap-3">
+              <Link href={`/trips/${t.id}`} className="text-blue-600 underline">
+                수정
+              </Link>
+              <form method="POST" action="/api/trips/delete">
+                <input type="hidden" name="id" value={t.id} />
+                <button className="text-red-600 underline">삭제</button>
+              </form>
+            </div>
+          </article>
+        ))}
+      </div>
+
+      <div className="mt-6 hidden overflow-x-auto sm:block">
         <table className="w-full border-collapse">
           <thead>
             <tr className="border-b">
               <th className="p-2 text-left">날짜</th>
               <th className="p-2 text-left">차량</th>
               <th className="p-2 text-left">운전자</th>
               <th className="p-2 text-right">실제주행거리(km)</th>
               <th className="p-2 text-right">통행료(원)</th>
               <th className="p-2 text-right">하이패스 잔액</th>
               <th className="p-2 text-right">수정</th>
               <th className="p-2 text-right">삭제</th>
             </tr>
           </thead>
 
           <tbody>
             {trips.map((t) => (
               <tr key={t.id} className="border-b">
                 <td className="p-2">{t.date.toISOString().slice(0, 10)}</td>
                 <td className="p-2">{t.vehicle ? `${t.vehicle.model} / ${t.vehicle.plate}` : "-"}</td>
                 <td className="p-2">{t.driver?.name ?? "-"}</td>
                 <td className="p-2 text-right">{t.distance}</td>
                 <td className="p-2 text-right">{t.tollCost}</td>
                 <td className="p-2 text-right">{t.hipassBalance}</td>
 
                 <td className="p-2 text-right">
 
EOF
)
