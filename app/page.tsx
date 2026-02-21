import Link from "next/link";
import { getBranchOptions } from "@/lib/branches";

export const revalidate = 60;

export default async function Home() {
  const branches = await getBranchOptions();

  return (
    <main className="mx-auto w-full max-w-3xl overflow-x-clip p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pr-[calc(1rem+env(safe-area-inset-right))] sm:p-6">
      <section className="rounded-3xl border border-red-100 bg-white/95 p-5 shadow-[0_12px_40px_rgba(220,38,38,0.08)] sm:p-7">
        <p className="text-sm font-bold tracking-wide text-red-500">🚘 DAILY LOG</p>
        <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">지사 선택</h1>
        <p className="mt-1 text-sm text-gray-500">운행일지를 입력할 지사를 선택하세요.</p>

        <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {branches.map((branch) => (
            <Link
              key={branch.code}
              href={`/branches/${branch.code}`}
              className="rounded-xl border border-red-200 bg-white px-4 py-3 font-semibold shadow-sm transition hover:border-red-400 hover:text-red-600"
            >
              {branch.name}
            </Link>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href="/guide"
          >
            📢 운행안내
          </Link>
          <Link
            className="rounded-xl border border-red-200 bg-white px-3 py-2 font-medium hover:border-red-400 hover:text-red-600"
            href="/trips"
          >
            📚 운행목록
          </Link>
        </div>
      </section>
    </main>
  );
}
