"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function UpdatedToast({
  show,
  message = "저장되었습니다.",
}: {
  show: boolean;
  message?: string;
}) {
  const [visible, setVisible] = useState(show);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!show) return;

    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);

      // ✅ URL에서 updated=1 제거(새로고침/뒤로가기 시 재표시 방지)
      const next = new URLSearchParams(searchParams.toString());
      next.delete("updated");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 1800);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  if (!visible) return null;

  return (
    <p className="mt-3 rounded border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-800">
      💾 {message}
    </p>
  );
}
