import Prism from "./components/PrismBackground";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ position: "relative", minHeight: "100vh" }}>
      <Prism />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          gap: "20px",
        }}
      >
        <h1 className="text-5xl font-bold">MES 2026</h1>

        <Link
          href="/signup"
          className="px-6 py-3 bg-[#E91E63] text-white rounded-lg font-semibold hover:bg-[#D81B60]"
        >
          Sign Up
        </Link>
      </div>
    </main>
  );
}
