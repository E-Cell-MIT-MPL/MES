import Prism from "./components/PrismBackground"; // or Prism if you rename it

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
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        <h1>MES 2026</h1>
      </div>
    </main>
  );
}
