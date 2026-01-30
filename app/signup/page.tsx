'use client';

import { useState, ChangeEvent, FormEvent, InputHTMLAttributes } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ColorBends = dynamic(() => import('../components/ColorBends'), {
  ssr: false,
});

type UserType = 'MIT' | 'NON-MIT';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Page() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('MIT');
  const [loading, setLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false); // Toggle between Register and OTP
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (status.message) setStatus({ message: '', type: null });
  };

  // --- 1. HANDLE REGISTRATION ---
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
        setStatus({ message: 'User registered! Please check your email for OTP.', type: 'success' });
        setShowOtp(true); // Move to OTP screen
      } else {
        setStatus({ message: data.message || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Connection error. Check backend.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- 2. HANDLE OTP VERIFICATION ---
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
        setStatus({ message: 'Email verified! Redirecting to login...', type: 'success' });
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

  return (
    <div className="relative w-screen h-screen overflow-hidden text-gray-900">
      <ColorBends colors={['#ff5c7a', '#8a5cff', '#00ffd1']} speed={0.2} />

      <div className="relative z-10 flex items-center justify-center h-full px-4">
        <div className="w-full max-w-md bg-white/40 backdrop-blur-3xl rounded-3xl p-8 shadow-xl max-h-[90vh] overflow-y-auto">
          <h1 className="text-2xl font-bold text-center mb-6">
            MES <span className="text-blue-600">{showOtp ? 'Verification' : 'Registration'}</span>
          </h1>

          {status.message && (
            <div className={`mb-4 p-3 rounded-xl text-sm font-bold text-center border ${
                status.type === 'error' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-green-100 border-green-200 text-green-700'
              }`}>
              {status.message}
            </div>
          )}

          {!showOtp ? (
            /* --- REGISTRATION FORM --- */
            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* User Type Toggle */}
              <div className="flex bg-white/50 p-1 rounded-xl mb-6 border border-white/20">
                <button type="button" onClick={() => setUserType('MIT')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${userType === 'MIT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/30'}`}>MIT Student</button>
                <button type="button" onClick={() => setUserType('NON_MIT')} className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${userType === 'NON_MIT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/30'}`}>Other</button>
              </div>

              <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
              {userType === 'MIT' && (
                <>
                  <InputField label="Registration Number" name="regNumber" value={formData.regNumber} onChange={handleChange} required placeholder="MEC123" />
                  <InputField label="Learner Email" name="learnerEmail" type="email" value={formData.learnerEmail} onChange={handleChange} required placeholder="john@learner.manipal.edu" />
                </>
              )}
              <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
              <InputField label="Personal Email" name="personalEmail" type="email" value={formData.personalEmail} onChange={handleChange} required placeholder="john@gmail.com" />
              <InputField label="Password" name="password" type="password" value={formData.password} onChange={handleChange} required placeholder="••••••••" />

              <button type="submit" disabled={loading} className="w-full mt-4 rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition active:scale-95 disabled:bg-gray-400">
                {loading ? 'Processing...' : 'Register'}
              </button>
            </form>
          ) : (
            /* --- OTP VERIFICATION SCREEN --- */
            <form className="space-y-6 animate-fade-in" onSubmit={handleVerify}>
              <p className="text-center text-sm text-gray-600">
                Enter the 6-digit code sent to <br/>
                <span className="font-bold">{formData.personalEmail}</span>
              </p>
              
              <InputField 
                label="Enter OTP" 
                value={otpValue} 
                onChange={(e) => setOtpValue(e.target.value)} 
                required 
                placeholder="123456" 
                maxLength={6}
                className="w-full text-center text-2xl tracking-[1rem] rounded-xl px-4 py-3 bg-white/70 outline-none border border-transparent focus:border-blue-500"
              />

              <div className="space-y-3">
                <button type="submit" disabled={loading} className="w-full rounded-xl bg-green-600 text-white py-3 font-semibold hover:bg-green-700 transition active:scale-95 disabled:bg-gray-400 shadow-lg shadow-green-600/20">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
                
                <button 
                  type="button" 
                  onClick={async () => {
                    await fetch('http://localhost:8080/auth/resend-otp', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ email: formData.personalEmail }),
                    });
                    setStatus({ message: 'OTP Resent!', type: 'success' });
                  }}
                  className="w-full text-sm text-blue-600 font-bold hover:underline"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 ml-1">{label}</label>
      <input
        {...props}
        className={`w-full rounded-xl px-4 py-2 bg-white/70 outline-none border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400 ${props.className}`}
      />
    </div>
  );
}