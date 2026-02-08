"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function SignupClient({
  setReferralCode,
}: {
  setReferralCode: (code: string) => void;
}) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) setReferralCode(ref.trim());
  }, [searchParams, setReferralCode]);

  return null;
}
