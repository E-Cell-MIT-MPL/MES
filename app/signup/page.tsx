"use client";

import {
  useState,
  ChangeEvent,
  FormEvent,
  InputHTMLAttributes,
  useEffect,
} from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import dynamic from "next/dynamic";

const ColorBends = dynamic(() => import("@/components/ColorBends"), {
  ssr: false,
});

// --- CONSTANTS & TYPES ---
const BACKEND_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://mes-backend-47zl.onrender.com";

type UserType = "MIT" | "NON_MIT";

const SLIDES = [
  {
    title: <>Capturing Ideas,<br />Creating Future.</>,
    desc: "Join the ecosystem of innovators. Your journey to MES 2026 starts here.",
  },
  {
    title: <>Innovation<br />Unleashed.</>,
    desc: "Connect with visionaries and build what's next. The stage is yours.",
  },
  {
    title: <>From Zero<br />To One.</>,
    desc: "Turn your concepts into reality. Take the leap with MES 2026.",
  },
];

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function SignupPage() {
  const router = useRouter();

  // --- FORM STATE ---
  const [userType, setUserType] = useState<UserType>("MIT");
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [status, setStatus] = useState<{
    message: string;
    type: "error" | "success" | null;
  }>({ message: "", type: null });

  // --- NEW: TIMER STATE ---
  const [timer, setTimer] = useState(60);

  const [formData, setFormData] = useState({
    name: "",
    regNumber: "",
    learnerEmail: "",
    personalEmail: "",
    phone: "",
    password: "",
  });

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // --- NEW: COUNTDOWN LOGIC ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (showOtp && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showOtp, timer]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status.message) setStatus({ message: "", type: null });
  };

  // --- 1. REGISTER FUNCTION ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: "", type: null });

    // Sanitize email and structure payload strictly
    const cleanEmail = formData.personalEmail.trim().toLowerCase();
    
    const payload: any = {
      userType,
      name: formData.name.trim(),
      personalEmail: cleanEmail,
      phone: formData.phone.trim(),
      password: formData.password,
    };

    if (userType === "MIT") {
      payload.regNumber = formData.regNumber.trim();
      payload.learnerEmail = formData.learnerEmail.trim().toLowerCase();
    }

    try {
      const res = await fetch(`${BACKEND_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ message: "Account created! Check email for OTP.", type: "success" });
        // Store the sanitized email back to state so OTP verify uses the exact same string
        setFormData(prev => ({ ...prev, personalEmail: cleanEmail }));
        
        // Reset timer when OTP screen is shown
        setTimer(60);
        setTimeout(() => setShowOtp(true), 1500);
      } else {
        setStatus({ message: data.message || "Registration failed", type: "error" });
      }
    } catch (err) {
      setStatus({ message: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFY OTP FUNCTION ---
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ message: "", type: null });

    const cleanOtp = otpValue.trim();
    const cleanEmail = formData.personalEmail.trim().toLowerCase();

  try {
    const res = await fetch(`${BACKEND_URL}/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        // Try sending both if you aren't sure which one the backend uses
        email: formData.personalEmail.trim().toLowerCase(),
        otp: otpValue.trim(), 
        // code: otpValue.trim(), // Uncomment this if your backend expects 'code'
      }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ message: "Email verified! Redirecting...", type: "success" });
        setTimeout(() => router.push("/login"), 1500);
      } else {
        setStatus({ message: data.message || "Invalid code. Try again.", type: "error" });
      }
    } catch (err) {
      setStatus({ message: "Connection error during verification.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. RESEND OTP FUNCTION ---
  const handleResend = async () => {
    if (timer > 0) return; // Prevent resend if timer is active
    
    setStatus({ message: "Sending code...", type: "success" });
    try {
      const res = await fetch(`${BACKEND_URL}/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.personalEmail.trim().toLowerCase() }),
      });
      if (res.ok) {
        setStatus({ message: "OTP Resent!", type: "success" });
        setTimer(60); // Reset timer on successful resend
      }
      else setStatus({ message: "Failed to resend. Try again later.", type: "error" });
    } catch (err) {
      setStatus({ message: "Network error.", type: "error" });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] font-sans p-0 md:p-4 selection:bg-purple-500/30">
      <div className="relative w-full h-full md:w-[96vw] md:max-w-[1600px] md:h-[92vh] bg-[#0a0a0a] md:rounded-[30px] overflow-hidden flex flex-col lg:flex-row shadow-2xl md:border border-white/5">
        
        {/* --- LEFT VISUAL SIDE --- */}
        <div className="relative w-full h-[35vh] lg:h-full lg:w-[60%] bg-black flex-shrink-0">
          <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-auto lg:right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all duration-300 group">
            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:inline">Back to website</span>
            <span className="lg:hidden">Back</span>
          </Link>

          <div className="absolute inset-0 w-full h-full opacity-90 lg:scale-110 origin-center pointer-events-none">
            <ColorBends colors={["#7e22ce", "#3b82f6", "#000000"]} speed={0.25} />
          </div>

          <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          <div className="hidden lg:block absolute bottom-12 left-12 z-20 max-w-lg">
            <div className="h-[140px] flex items-end">
              <AnimatePresence mode="wait">
                <motion.div key={currentSlide} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }}>
                  <h2 className="text-6xl font-serif-display italic font-bold mb-4 text-white leading-tight">
                    {SLIDES[currentSlide].title}
                  </h2>
                  <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                    {SLIDES[currentSlide].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="flex gap-2 mt-8">
              {SLIDES.map((_, index) => (
                <div key={index} className={`h-1 rounded-full transition-all duration-500 ${index === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30"}`} />
              ))}
            </div>
          </div>

          <div className="lg:hidden absolute bottom-10 left-6 z-20">
            <h1 className="text-4xl font-serif-display italic font-bold text-white leading-none">MES 2026</h1>
            <p className="text-purple-200/80 text-xs mt-1 font-medium tracking-wide">Future Starts Here.</p>
          </div>
        </div>

        {/* --- RIGHT FORM SIDE --- */}
        <div className="relative flex-1 w-full lg:w-[40%] bg-[#0E0E0E] flex flex-col px-6 md:px-16 py-8 lg:py-8 rounded-t-[30px] lg:rounded-none -mt-6 lg:mt-0 z-10 overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10">
          <div className="lg:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 flex-shrink-0" />

          <div className="w-full max-w-md mx-auto my-auto">
            <div className="mb-6">
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {showOtp ? "Verify OTP" : "Create account"}
              </h2>
              <p className="text-gray-500 text-xs">
                {showOtp ? (
                  <>Code sent to <span className="text-white font-bold">{formData.personalEmail}</span></>
                ) : (
                  <>Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">Log in</Link></>
                )}
              </p>
            </div>

            <AnimatePresence mode="wait">
              {status.message && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className={`mb-6 p-3 rounded-lg flex items-center gap-3 text-xs font-medium border ${
                    status.type === "error" ? "bg-red-500/5 border-red-500/20 text-red-400" : "bg-green-500/5 border-green-500/20 text-green-400"
                  }`}>
                  {status.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                  {status.message}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
              {!showOtp ? (
                <motion.form key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 pb-10 lg:pb-0" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 p-1 bg-[#1a1a1a] rounded-xl mb-6 border border-white/5">
                    {(["MIT", "NON_MIT"] as UserType[]).map((type) => (
                      <button key={type} type="button" onClick={() => setUserType(type)}
                        className={`py-2.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${userType === type ? "bg-[#2a2a2a] text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}>
                        {type === "MIT" ? "MAHE" : "NON-MAHE"}
                      </button>
                    ))}
                  </div>

                  <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />

                  {userType === "MIT" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <InputField label="Reg No." name="regNumber" value={formData.regNumber} onChange={handleChange} required placeholder="2309123" />
                      <InputField label="Learner ID" name="learnerEmail" type="email" value={formData.learnerEmail} onChange={handleChange} required placeholder="@learner" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="+91..." />
                    <InputField label="Email" name="personalEmail" type="email" value={formData.personalEmail} onChange={handleChange} required placeholder="name@email.com" />
                  </div>

                  <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />

                  <button type="submit" disabled={loading} className="w-full mt-4 bg-[#6d28d9] hover:bg-[#5b21b6] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Create Account"}
                  </button>
                </motion.form>
              ) : (
                <motion.form key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 pt-4 pb-10 lg:pb-0" onSubmit={handleVerify}>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Code</label>
                    <input type="text" value={otpValue} onChange={(e) => setOtpValue(e.target.value)} required maxLength={6} autoFocus placeholder="000000" inputMode="numeric" pattern="[0-9]*"
                      className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-purple-500 transition-all" />
                  </div>

                  <button type="submit" disabled={loading} className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2">
                    {loading ? <Loader2 className="animate-spin" size={16} /> : "Verify Email"}
                  </button>

                  <button 
                    type="button" 
                    onClick={handleResend} 
                    disabled={timer > 0} 
                    className={`w-full text-[15px] uppercase tracking-wider transition-colors ${timer > 0 ? "text-gray-600 cursor-not-allowed" : "text-white-500 hover:text-white"}`}
                  >
                    {timer > 0 ? `Resend OTP in ${timer}s` : "Resend Code"}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div className="w-full">
      <div className="relative group">
        <input {...props} className="peer w-full rounded-xl px-4 py-3.5 pt-5 pb-2 text-sm bg-[#1a1a1a] border border-[#333] text-white placeholder-transparent focus:outline-none focus:border-purple-500 transition-all duration-200" />
        <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-600 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:text-purple-400 pointer-events-none">
          {label}
        </label>
      </div>
    </div>
  );
}