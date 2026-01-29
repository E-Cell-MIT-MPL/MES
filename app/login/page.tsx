"use client";

import { useState } from "react";

export default function Page() {
  const [regNo, setRegNo] = useState("");
  const [password, setPassword] = useState("");

  return (
    <>
      {/* BACKGROUND GRID */}
      <div className="wall">
        <Row direction="left" />
        <Row direction="right" />
        <Row direction="left" />
        <Row direction="right" />
      </div>

      {/* LOGIN BOX */}
      <div className="focus">
        <div className="login-box">
          <h2>Sign in</h2>
          <p>Access your account</p>

          {/* REGISTRATION NUMBER */}
          <input
            type="text"
            placeholder="Registration Number"
            value={regNo}
            inputMode="numeric"
            maxLength={9}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "");
              setRegNo(digitsOnly);
            }}
          />

          {/* PASSWORD */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button disabled={regNo.length !== 9 || password.length === 0}>
            Login
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------------- ROW ---------------- */

function Row({ direction }: { direction: "left" | "right" }) {
  return (
    <div className="row">
      <div className={`track ${direction}`}>
        {images}
        {images}
      </div>
    </div>
  );
}

/* ---------------- IMAGES ---------------- */

const imageUrls = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "https://images.unsplash.com/photo-1558655146-d09347e92766",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051",
  "https://images.unsplash.com/photo-1517433456452-f9633a875f6f",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
];

const images = imageUrls.map((src, i) => (
  <img
    key={i}
    src={`${src}?auto=format&fit=crop&w=600&q=80`}
    alt=""
  />
));
