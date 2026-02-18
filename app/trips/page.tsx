 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/app/trips/[id]/page.tsx b/app/trips/[id]/page.tsx
index d325a703b5d909b0848bb2abd28aa617cfa8cf56..3ab0e8d49021f51eb9d19ba5ab33789b60134ed3 100644
--- a/app/trips/[id]/page.tsx
+++ b/app/trips/[id]/page.tsx
@@ -25,56 +25,56 @@ export default async function TripDetailPage({
       vehicleId: true,
       driverId: true,
       distance: true,
       tollCost: true,
       hipassBalance: true,
       createdAt: true,
     },
   });
 
   if (!trip) return notFound();
 
   const [vehicle, driver] = await Promise.all([
     prisma.vehicle.findUnique({
       where: { id: trip.vehicleId },
       select: { id: true, model: true, plate: true },
     }),
     trip.driverId
       ? prisma.driver.findUnique({
           where: { id: trip.driverId },
           select: { id: true, name: true },
         })
       : null,
   ]);
 
   return (
-    <main className="max-w-3xl mx-auto p-6">
-      <div className="flex items-center justify-between gap-4">
-        <h1 className="text-2xl font-bold">운행일지 상세</h1>
-        <Link href="/trips" className="underline">
+    <main className="mx-auto w-full max-w-3xl p-4 sm:p-6">
+      <div className="flex flex-wrap items-center justify-between gap-3">
+        <h1 className="text-xl font-bold sm:text-2xl">운행일지 상세</h1>
+        <Link href="/trips" className="rounded border px-3 py-2 text-sm">
           목록으로
         </Link>
       </div>
 
-      <div className="mt-6 border rounded p-4 space-y-2">
+      <div className="mt-5 space-y-2 rounded border p-4 text-sm sm:text-base">
         <div>
           <b>날짜</b>: {trip.date.toISOString().slice(0, 10)}
         </div>
         <div>
           <b>차량</b>: {vehicle ? `${vehicle.model} / ${vehicle.plate}` : "-"}
         </div>
         <div>
           <b>운전자</b>: {driver?.name ?? "-"}
         </div>
         <div>
           <b>실제주행거리(km)</b>: {trip.distance}
         </div>
         <div>
           <b>통행료(원)</b>: {trip.tollCost}
         </div>
         <div>
           <b>하이패스 잔액</b>: {trip.hipassBalance}
         </div>
       </div>
     </main>
   );
 }
 
EOF
)
