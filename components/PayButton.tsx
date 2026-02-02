// components/PayButton.tsx
"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react"; // Assuming you have lucide-react

interface PayButtonProps {
  eventName: string;
  amount: string;
  token: string | null;
  className?: string; // Allow custom styles
  children?: React.ReactNode; // Allow custom text/icons
}

export default function PayButton({ eventName, amount, token, className, children }: PayButtonProps) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!token) {
        alert("Please log in to make a payment");
        return;
    }

    try {
      setLoading(true);

      // 1. Call Backend
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/initiate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, 
        },
        body: JSON.stringify({ eventName, amount }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Payment initiation failed");
      }

      // 2. Redirect to Atom
      const { atomTokenId } = data.data;
      const atomUrl = process.env.NEXT_PUBLIC_ATOM_PAY_URL;
      window.location.href = `${atomUrl}?atomTokenId=${atomTokenId}`;

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert(error.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className={className || "bg-blue-600 text-white px-4 py-2 rounded"}
    >
      {loading ? <Loader2 className="animate-spin w-4 h-4" /> : children || `Pay ₹${amount}`}
    </button>
  );
}