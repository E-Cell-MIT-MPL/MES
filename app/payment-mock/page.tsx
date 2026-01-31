"use client";

export default function PaymentMock() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-white">
            <div className="bg-white/10 p-8 rounded-xl space-y-4 text-center">
                <h1 className="text-xl font-bold">Mock Payment Page</h1>
                <p>This simulates external payment</p>

                <button
                    onClick={() => {
                        window.location.href = "/student?paid=true";
                    }}
                    className="px-4 py-2 bg-emerald-400 text-black font-bold rounded-lg"
                >
                    Complete Payment
                </button>
            </div>
        </div>
    );
}
