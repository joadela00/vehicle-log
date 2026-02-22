"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

function messageFor(code: string) {
  if (code === "auth") return "관리자 비밀번호가 틀려 삭제할 수 없습니다.";
  if (code === "server") return "서버 설정 오류로 삭제할 수 없습니다.";
  return "삭제할 수 없습니다.";
}

export default function DeleteErrorToast({ code }: { code: string }) {
  const [visible, setVisible] = useState(!!code);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!code) return;

    setVisible(true);

    const t = setTimeout(() => {
      setVisible(false);

      // ✅ URL에서 deleteError 제거
      const next = new URLSearchParams(searchParams.toString());
      next.delete("deleteError");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 1800);

    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (!visible) return null;

  return (
    <p className="mt-3 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
      🚨 {messageFor(code)}
    </p>
  );
}
