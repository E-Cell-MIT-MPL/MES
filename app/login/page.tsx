'use client';

import { useState, FormEvent, useEffect, InputHTMLAttributes } from "react";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, AlertCircle, ArrowRight } from 'lucide-react';
import apiClient from "../../lib/api-client";
import dynamic from 'next/dynamic';
import { useAuth } from "../../lib/auth-context";

const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

const SLIDES = [
  {
    title: <>Welcome Back,<br />Innovator.</>,
    desc: "The summit awaits. Log in to access your dashboard and schedule."
  },
  {
    title: <>Resume Your<br />Journey.</>,
    desc: "Pick up where you left off. The future is being ltlt today."
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
  const { checkUserSession } = useAuth();

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

      if (response.status >= 200 && response.status < 300) {
        if (typeof checkUserSession === 'function') {
          await checkUserSession().catch((sessionError) => {
            console.error("Session refresh failed after login", sessionError);
          });
        }
        router.push('/student');
      }
    } catch (err: any) {
      console.error("Login Error Details:", err);
      if (!err.response) {
         setError("App Error: " + err.message); 
         return;
      }
      const errorMessage = err.response?.data?.message || "Invalid credentials or server error.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] font-sans p-0 md:p-4 selection:bg-blue-500/30">
      
      {/* CONTAINER: 
          Mobile: h-[100dvh] (Full screen vertical)
          Desktop: md:h-[92vh] (Floating card) 
      */}
      <div className="relative w-full h-[100dvh] md:w-[96vw] md:max-w-[1600px] md:h-[92vh] bg-[#0a0a0a] md:rounded-[30px] overflow-hidden flex flex-col lg:flex-row shadow-2xl md:border border-white/5">
        
        {/* --- LEFT SIDE: VISUALS --- */}
        {/* Mobile: h-[38vh] (Tall header for visuals)
            Desktop: lg:h-full (Full height sidebar) 
        */}
        <div className="relative w-full h-[38vh] lg:h-full lg:w-[60%] bg-black flex-shrink-0">
            
            {/* Back Button */}
            <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-auto lg:right-8 z-30 flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all duration-300 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span className="hidden lg:inline">Back to website</span>
                <span className="lg:hidden">Home</span>
            </Link>

            <div className="absolute inset-0 opacity-80 lg:scale-110">
                <ColorBends colors={['#0ea5e9', '#10b981', '#000000']} speed={0.2} />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 lg:bg-gradient-to-t lg:from-black/60 lg:to-black/30" />

            {/* Desktop Slides */}
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

            {/* Mobile Branding */}
            <div className="lg:hidden absolute bottom-12 left-6 z-20">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h1 className="text-5xl font-serif-display italic font-bold text-white leading-none drop-shadow-lg">MES 2026</h1>
                  <p className="text-blue-200/90 text-sm mt-2 font-medium tracking-wide flex items-center gap-2">
                    <span className="w-8 h-[1px] bg-blue-400"></span>
                    Student Portal
                  </p>
                </motion.div>
            </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        {/* MOBILE STYLES (Restored): 
            -mt-8 (Negative margin for sheet effect)
            rounded-t-[35px] (Deep curve)
            border-t (Highlight top edge)
            shadow-[...] (Depth)
            
            DESKTOP STYLES (Kept Sexy):
            lg:mt-0 (No overlap)
            lg:rounded-none (Flat side)
            lg:border-none
            lg:shadow-none
        */}
        <div className="relative flex-1 w-full lg:w-[40%] bg-[#0E0E0E] flex flex-col px-6 md:px-16 pt-10 pb-6 lg:py-8 
                        rounded-t-[35px] lg:rounded-none -mt-8 lg:mt-0 z-10 
                        overflow-y-auto border-t border-white/10 lg:border-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-none">
            
            {/* Mobile Pull Indicator */}
            <div className="lg:hidden w-12 h-1 bg-white/20 rounded-full mx-auto mb-8 flex-shrink-0" />
            
            <div className="w-full max-w-sm mx-auto my-auto">
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Sign In</h2>
                    <p className="text-gray-500 text-sm">
                        Don&apos;t have an account? <Link href="/signup" className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline decoration-blue-400/30 underline-offset-4">Create one</Link>
                    </p>
                </div>

                <AnimatePresence mode='wait'>
                    {error && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 p-4 rounded-xl flex items-start gap-3 text-xs font-medium border bg-red-500/10 border-red-500/20 text-red-300"
                        >
                            <AlertCircle size={16} className="mt-0.5 shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form className="space-y-5" onSubmit={handleLogin}>
                    <InputField label="Personal Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="john@example.com" />
                    <div className="space-y-1">
                        <InputField label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
                        <div className="flex justify-end pt-1">
                            <Link href="../forgot-password" university-context="true" className="text-xs text-gray-500 hover:text-white transition-colors py-2">Forgot password?</Link>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="group w-full mt-4 bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <>Access Dashboard <ArrowRight size={16} /></>}
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
            // text-base on mobile prevents iOS zoom. md:text-sm reverts to smaller text on desktop.
            className="peer w-full rounded-xl px-4 py-4 pt-6 pb-2 text-base md:text-sm bg-[#151515] border border-[#252525] text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:bg-[#1a1a1a] transition-all duration-200"
            placeholder={props.placeholder}
            />
            <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-600 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-blue-400 pointer-events-none">
                {label}
            </label>
        </div>
      </div>
    );
}