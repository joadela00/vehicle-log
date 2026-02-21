"use client";

import { useRouter } from "next/navigation";

export default function BackButton({
  className,
  label = "⬅ 이전화면",
  fallbackHref = "/",
}: {
  className?: string;
  label?: string;
  fallbackHref?: string;
}) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        // 히스토리가 없을 수도 있으니 fallback
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
        } else {
          router.push(fallbackHref);
        }
      }}
      className={className}
    >
      {label}
    </button>
  );
}
