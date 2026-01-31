'use client';

<<<<<<< HEAD
import { useState, ChangeEvent, FormEvent, InputHTMLAttributes, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
=======
import { useState, ChangeEvent, FormEvent, InputHTMLAttributes } from 'react';
>>>>>>> main
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ColorBends = dynamic(() => import('@/components/ColorBends'), { ssr: false });

// --- CONSTANTS & TYPES ---
type UserType = 'MIT' | 'NON_MIT';

const SLIDES = [
  {
    title: <>Capturing Ideas,<br />Creating Future.</>,
    desc: "Join the ecosystem of innovators. Your journey to MES 2026 starts here."
  },
  {
    title: <>Innovation<br />Unleashed.</>,
    desc: "Connect with visionaries and build what's next. The stage is yours."
  },
  {
    title: <>From Zero<br />To One.</>,
    desc: "Turn your concepts into reality. Take the leap with MES 2026."
  }
];

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function SignupPage() {
  const router = useRouter();
  
  // --- FORM STATE ---
  const [userType, setUserType] = useState<UserType>('MIT');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  const [status, setStatus] = useState<{ message: string; type: 'error' | 'success' | null }>({
    message: '',
    type: null,
  });

  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    learnerEmail: '',
    personalEmail: '',
    phone: '',
    password: '',
  });

  // --- SLIDER STATE ---
  const [currentSlide, setCurrentSlide] = useState(0);

  // --- SLIDER TIMER ---
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status.message) setStatus({ message: '', type: null });
  };

  // --- 1. REGISTER FUNCTION ---
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      userType,
      name: formData.name,
      personalEmail: formData.personalEmail,
      phone: formData.phone,
      password: formData.password,
      ...(userType === 'MIT' && {
        regNumber: formData.regNumber,
        learnerEmail: formData.learnerEmail,
      }),
    };

    try {
      const res = await fetch('http://localhost:8080/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ message: 'Account created! Check email for OTP.', type: 'success' });
        setTimeout(() => setShowOtp(true), 1500);
      } else {
        setStatus({ message: data.message || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Connection error. Check backend.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. VERIFY OTP FUNCTION ---
  const handleVerify = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('http://localhost:8080/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: formData.personalEmail, 
          otp: otpValue 
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ message: 'Verified! Redirecting...', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus({ message: data.message || 'Invalid OTP', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Verification error.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 3. RESEND OTP FUNCTION ---
  const handleResend = async () => {
    try {
        await fetch('http://localhost:8080/auth/resend-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: formData.personalEmail }),
        });
        setStatus({ message: 'OTP Resent!', type: 'success' });
    } catch (err) {
        setStatus({ message: 'Failed to resend code', type: 'error' });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#050505] font-sans p-2 md:p-4 selection:bg-purple-500/30">
      
      {/* --- FLOATING CARD --- */}
      <div className="relative w-[96vw] max-w-[1600px] h-[92vh] bg-[#0a0a0a] rounded-[30px] overflow-hidden flex shadow-2xl border border-white/5">
        
        {/* --- LEFT SIDE: VISUALS (60%) --- */}
        <div className="hidden lg:block w-[60%] h-full relative overflow-hidden bg-black">
            <Link 
                href="/"
                className="absolute top-8 right-8 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-xs font-bold uppercase tracking-wider text-white hover:bg-white/10 transition-all duration-300 group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                Back to website
            </Link>

            <div className="absolute inset-0 opacity-90">
                <ColorBends colors={['#7e22ce', '#3b82f6', '#000000']} speed={0.25} />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

            <div className="absolute bottom-12 left-12 z-20 max-w-lg">
                <div className="h-[140px] flex items-end">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                        <h2 className="text-5xl xl:text-6xl font-serif-display italic font-bold mb-4 text-white leading-tight">
                            {SLIDES[currentSlide].title}
                        </h2>
                        <p className="text-gray-400 text-sm xl:text-base leading-relaxed max-w-sm">
                            {SLIDES[currentSlide].desc}
                        </p>
                    </motion.div>
                </AnimatePresence>
                </div>
                
                <div className="flex gap-2 mt-8">
                    {SLIDES.map((_, index) => (
                        <div 
                            key={index}
                            className={`h-1 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
                        />
                    ))}
                </div>
            </div>
        </div>

        {/* --- RIGHT SIDE: FORM (40%) --- */}
        <div className="w-full lg:w-[40%] h-full bg-[#0E0E0E] flex flex-col justify-center px-8 md:px-16 py-8 relative overflow-y-auto [&::-webkit-scrollbar]:w-[4px] [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent">
            
            <div className="lg:hidden mb-8 flex justify-between items-center">
                <Link href="/" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">
                    <ArrowLeft size={16} /> Back
                </Link>
                <span className="font-serif-display italic font-bold text-xl">MES 2026</span>
            </div>

            <div className="w-full max-w-md mx-auto">
                <h2 className="text-3xl font-bold text-white mb-2">
                    {showOtp ? 'Verify OTP' : 'Create account'}
                </h2>
                
                <p className="text-gray-500 text-xs mb-8">
                    {showOtp ? (
                        <>Code sent to <span className="text-white font-bold">{formData.personalEmail}</span></>
                    ) : (
                        <>Already have an account? <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium transition-colors">Log in</Link></>
                    )}
                </p>

                {/* STATUS MESSAGE */}
                <AnimatePresence mode='wait'>
                    {status.message && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className={`mb-6 p-3 rounded-lg flex items-center gap-3 text-xs font-medium border ${
                                status.type === 'error' 
                                ? 'bg-red-500/5 border-red-500/20 text-red-400' 
                                : 'bg-green-500/5 border-green-500/20 text-green-400'
                            }`}
                        >
                            {status.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle2 size={14} />}
                            {status.message}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                    {!showOtp ? (
                        // --- REGISTER FORM ---
                        <motion.form 
                            key="register"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4" 
                            onSubmit={handleSubmit}
                        >
                            <div className="grid grid-cols-2 p-1 bg-[#1a1a1a] rounded-xl mb-6">
                                {(['MIT', 'NON_MIT'] as UserType[]).map((type) => (
                                    <button 
                                        key={type}
                                        type="button" 
                                        onClick={() => setUserType(type)} 
                                        className={`py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 ${
                                            userType === type 
                                            ? 'bg-[#2a2a2a] text-white shadow-sm' 
                                            : 'text-gray-500 hover:text-gray-300'
                                        }`}
                                    >
                                        {type === 'MIT' ? 'MIT Student' : 'Guest'}
                                    </button>
                                ))}
                            </div>

                            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />

                            {userType === 'MIT' && (
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

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full mt-6 bg-[#6d28d9] hover:bg-[#5b21b6] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(109,40,217,0.3)] hover:shadow-[0_0_30px_rgba(109,40,217,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
                            </button>
                        </motion.form>
                    ) : (
                        // --- OTP FORM ---
                        <motion.form 
                            key="otp"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="space-y-6 pt-4" 
                            onSubmit={handleVerify}
                        >
                            <div>
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Enter Code</label>
                                <input
                                    type="text"
                                    value={otpValue}
                                    onChange={(e) => setOtpValue(e.target.value)}
                                    required
                                    maxLength={6}
                                    autoFocus
                                    placeholder="000000"
                                    className="w-full bg-[#1a1a1a] border border-[#333] rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-[0.5em] text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all placeholder:text-gray-800"
                                />
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading} 
                                className="w-full bg-[#6d28d9] hover:bg-[#5b21b6] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(109,40,217,0.3)] flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Verify Email'}
                            </button>
                            
                            <button 
                                type="button" 
                                onClick={handleResend}
                                className="w-full text-[10px] text-gray-500 hover:text-white uppercase tracking-wider transition-colors"
                            >
                                Resend Code
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

// --- INPUT COMPONENT ---
function InputField({ label, ...props }: InputFieldProps) {
    return (
      <div className="w-full">
        <div className="relative group">
            <input
            {...props}
            className={`
                peer w-full rounded-xl px-4 py-3.5 pt-5 pb-2 text-sm
                bg-[#1a1a1a] border border-[#333] 
                text-white placeholder-transparent
                focus:outline-none focus:border-purple-500 focus:bg-[#202020]
                transition-all duration-200
                ${props.className}
            `}
            placeholder={props.placeholder}
            />
            <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-500 transition-all duration-200 
                              peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-xs peer-placeholder-shown:text-gray-600 peer-placeholder-shown:font-medium peer-placeholder-shown:normal-case peer-placeholder-shown:tracking-normal
                              peer-focus:top-1.5 peer-focus:text-[10px] peer-focus:font-bold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-purple-400 pointer-events-none">
                {label}
            </label>
        </div>
      </div>
    );
}