'use client';

import { useState, FormEvent, useEffect, InputHTMLAttributes } from "react";
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowLeft, AlertCircle, ArrowRight, CheckCircle2, KeyRound, Lock } from 'lucide-react';
import dynamic from 'next/dynamic';
import apiClient from "../../lib/api-client";
import { useRouter } from "next/navigation";

const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

// Slides focused on security/recovery
const RECOVERY_SLIDES = [
  {
    title: <>Secure<br />Recovery.</>,
    desc: "We prioritize your account security. Let's get you back in safely."
  },
  {
    title: <>Don&apos;t<br />Panic.</>,
    desc: "It happens to the best of us. Recovery is just a few clicks away."
  },
  {
    title: <>Always<br />Here.</>,
    desc: "Our support system is online and ready to assist you."
  }
];

type Step = 'EMAIL' | 'OTP' | 'SUCCESS';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const router = useRouter();

  // Slide rotation logic
  useEffect(() => {
    const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % RECOVERY_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // STEP 1: Send OTP to Email
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Backend: POST /auth/forgot-password { email }
      await apiClient.post('/auth/forgot-password', { email });
      setStep('OTP');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP and Reset Password
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Backend: POST /auth/reset-password { email, otp, newPassword }
      await apiClient.post('/auth/reset-password', { 
          email, 
          otp, 
          newPassword 
      });
      setStep('SUCCESS');
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Invalid OTP or Server Error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] font-sans p-0 md:p-4 selection:bg-blue-500/30">
      
      <div className="relative w-full h-[100dvh] md:w-[96vw] md:max-w-[1600px] md:h-[92vh] bg-[#0a0a0a] md:rounded-[30px] overflow-hidden flex flex-col lg:flex-row shadow-2xl md:border border-white/5">
        
        {/* --- LEFT SIDE: VISUALS --- */}
        <div className="relative w-full h-[30vh] lg:h-full lg:w-[60%] bg-black flex-shrink-0">
            <Link href="/" className="absolute top-6 left-6 lg:top-8 lg:left-8 z-30 flex items-center gap-2 px-5 py-2.5 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all duration-300 group">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                <span>Back to Login</span>
            </Link>

            <div className="absolute inset-0 opacity-60 lg:scale-110">
                <ColorBends colors={['#8b5cf6', '#3b82f6', '#000000']} speed={0.15} />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 lg:bg-gradient-to-t lg:from-black/80 lg:to-black/30" />

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
                                {RECOVERY_SLIDES[currentSlide].title}
                            </h2>
                            <p className="text-gray-400 text-base leading-relaxed max-w-sm">
                                {RECOVERY_SLIDES[currentSlide].desc}
                            </p>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE: FORM --- */}
        <div className="relative flex-1 w-full lg:w-[40%] bg-[#0E0E0E] flex flex-col px-6 md:px-16 pt-10 pb-6 lg:py-8 
                        rounded-t-[35px] lg:rounded-none -mt-8 lg:mt-0 z-10 
                        overflow-y-auto border-t border-white/10 lg:border-none shadow-[0_-10px_40px_rgba(0,0,0,0.5)] lg:shadow-none">
            
            <div className="w-full max-w-sm mx-auto my-auto">
                
                {/* Dynamic Header */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
                        {step === 'EMAIL' && "Reset Password"}
                        {step === 'OTP' && "Check Your Inbox"}
                        {step === 'SUCCESS' && "All Set!"}
                    </h2>
                    <p className="text-gray-500 text-sm">
                        {step === 'EMAIL' && "Enter your email to receive a recovery code."}
                        {step === 'OTP' && `We sent a code to ${email}. Enter it below.`}
                        {step === 'SUCCESS' && "Your password has been successfully updated."}
                    </p>
                </div>

                <AnimatePresence mode='wait'>
                    
                    {/* ERROR MESSAGE */}
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

                    {/* STEP 1: EMAIL FORM */}
                    {step === 'EMAIL' && (
                        <motion.form 
                            key="step1"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-6" 
                            onSubmit={handleSendOtp}
                        >
                            <InputField 
                                label="Registered Email" 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                placeholder="john@example.com" 
                            />
                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="group w-full bg-gradient-to-r from-[#0ea5e9] to-[#0284c7] hover:from-[#0284c7] hover:to-[#0369a1] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(14,165,233,0.3)] hover:shadow-[0_0_30px_rgba(14,165,233,0.5)]"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send Code <ArrowRight size={16} /></>}
                            </button>
                        </motion.form>
                    )}

                    {/* STEP 2: OTP & NEW PASSWORD */}
                    {step === 'OTP' && (
                        <motion.form 
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6" 
                            onSubmit={handleResetPassword}
                        >
                            <div className="space-y-4">
                                <InputField 
                                    label="Recovery Code (OTP)" 
                                    type="text" 
                                    value={otp} 
                                    onChange={(e) => setOtp(e.target.value)} 
                                    required 
                                    placeholder="123456" 
                                    maxLength={6}
                                />
                                <InputField 
                                    label="New Password" 
                                    type="password" 
                                    value={newPassword} 
                                    onChange={(e) => setNewPassword(e.target.value)} 
                                    required 
                                    placeholder="••••••••" 
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="group w-full bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#7c3aed] hover:to-[#6d28d9] text-white py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)]"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Set New Password <Lock size={16} /></>}
                            </button>
                            
                            <button type="button" onClick={() => setStep('EMAIL')} className="w-full text-xs text-gray-500 hover:text-white mt-4">
                                Wrong email? Go back
                            </button>
                        </motion.form>
                    )}

                    {/* STEP 3: SUCCESS */}
                    {step === 'SUCCESS' && (
                         <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-8 px-6 rounded-2xl bg-white/5 border border-white/10"
                         >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                                <CheckCircle2 size={32} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Password Updated</h3>
                            <p className="text-gray-400 text-sm mb-6">
                                Your password has been changed successfully. You can now log in with your new credentials.
                            </p>
                            
                            <Link href="/" className="w-full py-3 rounded-xl bg-white hover:bg-gray-200 text-black text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2">
                                Back to Login
                            </Link>
                         </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
      </div>
    </div>
  );
}

// Reusable Input Component
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
}

function InputField({ label, ...props }: InputFieldProps) {
    return (
      <div className="w-full">
        <div className="relative group">
            <input
            {...props}
            className="peer w-full rounded-xl px-4 py-4 pt-6 pb-2 text-base md:text-sm bg-[#151515] border border-[#252525] text-white placeholder-transparent focus:outline-none focus:border-blue-500 focus:bg-[#1a1a1a] transition-all duration-200"
            />
            <label className="absolute left-4 top-2 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-all duration-200 peer-placeholder-shown:top-4 peer-placeholder-shown:text-sm peer-placeholder-shown:text-gray-600 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal peer-focus:top-2 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-blue-400 pointer-events-none">
                {label}
            </label>
        </div>
      </div>
    );
}