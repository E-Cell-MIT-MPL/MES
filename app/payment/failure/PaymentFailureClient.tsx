"use client";

import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import React from "react";

export default function PaymentFailureClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorMsg = searchParams.get("error");
  const reason = searchParams.get("reason") || "Unknown error";

  return (
    <div className="min-h-screen bg-[#05070c] flex items-center justify-center p-4">
      <div className="bg-[#10141d] border border-red-500/30 p-8 rounded-3xl max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.2)]">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
        <p className="text-slate-400 mb-8">
          {decodeURIComponent(errorMsg || reason)}
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => router.push("/student")}
            className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
          >
            Cancel
          </button>
          <Link
            href="/payment"
            className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-bold transition"
          >
            Try Again
          </Link>
        </div>
      </div>
    </div>
  );
}
