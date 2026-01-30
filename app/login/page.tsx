"use client";

import { useState, ChangeEvent, FormEvent, JSX } from "react";
import { useRouter } from "next/navigation";

const IMAGE_URLS = [
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  "https://images.unsplash.com/photo-1518770660439-4636190af475",
  "https://images.unsplash.com/photo-1558655146-d09347e92766",
  "https://images.unsplash.com/photo-1605379399642-870262d3d051",
  "https://images.unsplash.com/photo-1517433456452-f9633a875f6f",
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c",
];

export default function Page() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Inline error state
  const router = useRouter();

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include", 
      });

      const data = await response.json();
      console.log(data);

      if (response.ok && response.status === 200) {
        // Successful login: redirect to /student
        setTimeout(() => router.push('/student'), 500);
      } else {
        setError(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.log("Network error:", error);
      setError("Connection error: Is your backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="wall">
        <Row direction="left" />
        <Row direction="right" />
        <Row direction="left" />
        <Row direction="right" />
      </div>

      <div className="focus">
        <form className="login-box" onSubmit={handleLogin}>
          <h2>Sign in</h2>
          <p className="subtitle">Welcome back! Please enter your details.</p>

          {/* Inline Error Display */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <input 
            type="email" 
            placeholder="Email Address" 
            value={email} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setEmail(e.target.value);
                if(error) setError(null);
            }} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            value={password} 
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setPassword(e.target.value);
                if(error) setError(null);
            }} 
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Login"}
          </button>
        </form>
      </div>

      {/* Basic styles for the error message if you haven't added them yet */}
      <style jsx>{`
        .error-message {
          background: #fee2e2;
          border: 1px solid #ef4444;
          color: #b91c1c;
          padding: 0.75rem;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
        }
        .subtitle {
          color: #6b7280;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
        }
      `}</style>
    </>
  );
}

/* --- COMPONENTS --- */

interface RowProps {
  direction: "left" | "right";
}

function Row({ direction }: RowProps) {
  const renderImages = (suffix: string): JSX.Element[] => 
    IMAGE_URLS.map((src, i) => (
      <img 
        key={`${suffix}-${i}`} 
        src={`${src}?auto=format&fit=crop&w=600&q=80`} 
        alt="" 
      />
    ));

  return (
    <div className="row">
      <div className={`track ${direction}`}>
        {renderImages("a")}
        {renderImages("b")}
      </div>
    </div>
  );
}