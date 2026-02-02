'use client';

import { useState, FormEvent, useEffect, InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';
import apiClient from "../lib/api-client";
import dynamic from 'next/dynamic';

const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

const SLIDES = [
  {
    title: <>Welcome Back,<br />Innovator.</>,
    desc: "The summit awaits. Log in to access your dashboard and schedule."
  },
  {
    title: <>Resume Your<br />Journey.</>,
    desc: "Pick up where you left off. The future is being built today."
  },
  {
    title: <>Ready to<br />Disrupt?</>,
    desc: "Your pass to the ecosystem is ready. Let's get started."
  }
];

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/auth/login', { 
        email, 
        password 
      });

      if (response.status === 200) {
        console.log("Login successful, redirecting...");
        // Use router.push instead of window.location.href to maintain state
        router.push('/student'); 
      }
    } catch (err: any) {
      // Improved error message display
      const errorMessage = err.response?.data?.message || "Invalid credentials or server error.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }; // <--- THIS WAS MISSING

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] font-sans p-0 md:p-4 selection:bg-blue-500/30">
      <div className="relative w-full h-full md:w-[96vw] md:max-w-[1600px] md:h-[92vh] bg-[#0a0a0a] md:rounded-[30px] overflow-hidden flex flex-col lg:flex-row shadow-2xl md:border border-white/5">
        
        {/* LEFT SIDE: VISUALS */}
        <div className="relative w-full h-[35vh] lg:h-full lg:w-[60%] bg-black flex-shrink-0">
            <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-auto lg:right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all duration-300 group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden lg:inline">Back to website</span>
                <span className="lg:hidden">Back</span>
            </Link>

            <div className="absolute inset-0 opacity-80 lg:scale-110">
                <ColorBends colors={['#0ea5e9', '#10b981', '#000000']} speed={0.2} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-b lg:bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            <div className="hidden lg:block absolute bottom-12 left-12 z-20 max-w-lg">
                <div className="h-[140px] flex items-end"> 
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentSlide}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5, ease: "easeInOut" }}
                        >
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
                        <div key={index} className={`h-1 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
                    ))}
                </div>
            </div>

            <div className="lg:hidden absolute bottom-10 left-6 z-20">
                <h1 className="text-4xl font-serif-display italic font-bold text-white leading-none">MES 2026</h1>
                <p className="text-blue-200/80 text-xs mt-1 font-medium tracking-wide">Welcome Back.</p>
            </div>
        </div>

        {/* RIGHT SIDE: FORM */}
        <div className="relative flex-1 w-full lg:w-[40%] bg-[#0E0E0E] flex flex-col px-6 md:px-16 py-8 lg:py-8 rounded-t-[30px] lg:rounded-none -mt-6 lg:mt-0 z-10 overflow-y-auto">
            <div className="lg:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-6 flex-shrink-0" />
            <div className="w-full max-w-sm mx-auto my-auto">
                <h2 className="text-3xl font-bold text-white mb-2">Sign In</h2>
                <p className="text-gray-500 text-xs mb-8">
                    Don't have an account? <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Create one now</Link>
                </p>

                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-3 rounded-lg flex items-center gap-3 text-xs font-medium border bg-red-500/5 border-red-500/20 text-red-400"
                        >
                            <AlertCircle size={14} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <InputField label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
                    <div className="space-y-1">
                        <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                        <div className="flex justify-end">
                            <Link href="/forgot-password" university-context="true" className="text-[10px] text-gray-500 hover:text-white transition-colors mt-1">Forgot password?</Link>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="group w-full mt-6 bg-[#0ea5e9] hover:bg-[#0284c7] text-white py-4 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={16} /> : <>Login <ArrowRight size={14} /></>}
                    </button>
                </form>
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
            <input
            {...props}
            className="peer w-full rounded-xl px-4 py-3.5 pt-5 pb-2 text-sm bg-[#1a1a1a] border border-[#333] text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:bg-[#202020] transition-all duration-200"
            placeholder={props.placeholder}
            />
            <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-all duration-200 peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-600 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-blue-400 pointer-events-none">
                {label}
            </label>
        </div>
      </div>
    );
}