"use client";

import { useSearchParams } from "next/navigation";
import { Analytics } from "@vercel/analytics/next";

export default function AnalyticsWrapper() {
  const searchParams = useSearchParams();
  const isDev = searchParams.get("dev") === "true";

  if (isDev) return null;

  return <Analytics />;
}
