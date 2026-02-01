import React, { Suspense } from "react";
import PaymentFailureClient from "./PaymentFailureClient";

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {/* Client component isolates `useSearchParams` and client routing */}
      <PaymentFailureClient />
    </Suspense>
  );
}