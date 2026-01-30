'use client';

import { useState, ChangeEvent, FormEvent, InputHTMLAttributes } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ColorBends = dynamic(() => import('../components/ColorBends'), {
  ssr: false,
});

type UserType = 'MIT' | 'NON_MIT';

// 1. Defined an interface for the InputField props
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export default function Page() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>('MIT');
  const [loading, setLoading] = useState(false);
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
      const res = await fetch('http://localhost:5000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus({ message: 'Registration successful! Redirecting to login...', type: 'success' });
        setTimeout(() => router.push('/login'), 2000);
      } else {
        setStatus({ message: data.message || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      setStatus({ message: 'Connection error. Is the backend running?', type: 'error' });
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
            MES <span className="text-blue-600">Registration</span>
          </h1>

          {/* User Type Toggle */}
          <div className="flex bg-white/50 p-1 rounded-xl mb-6 border border-white/20">
            <button
              type="button"
              onClick={() => setUserType('MIT')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                userType === 'MIT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/30'
              }`}
            >
              MIT Student
            </button>
            <button
              type="button"
              onClick={() => setUserType('NON_MIT')}
              className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                userType === 'NON_MIT' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:bg-white/30'
              }`}
            >
              Other
            </button>
          </div>

          {status.message && (
            <div
              className={`mb-4 p-3 rounded-xl text-sm font-bold text-center border ${
                status.type === 'error' ? 'bg-red-100 border-red-200 text-red-700' : 'bg-green-100 border-green-200 text-green-700'
              }`}
            >
              {status.message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <InputField label="Full Name" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />

            {userType === 'MIT' && (
              <>
                <InputField
                  label="Registration Number"
                  name="regNumber"
                  value={formData.regNumber}
                  onChange={handleChange}
                  required
                  placeholder="MEC123"
                />
                <InputField
                  label="Learner Email"
                  name="learnerEmail"
                  type="email"
                  value={formData.learnerEmail}
                  onChange={handleChange}
                  required
                  placeholder="john@learner.manipal.edu"
                />
              </>
            )}

            <InputField label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} required placeholder="9876543210" />
            <InputField
              label="Personal Email"
              name="personalEmail"
              type="email"
              value={formData.personalEmail}
              onChange={handleChange}
              required
              placeholder="john@gmail.com"
            />
            <InputField
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 rounded-xl bg-blue-600 text-white py-3 font-semibold hover:bg-blue-700 transition active:scale-95 disabled:bg-gray-400 shadow-lg shadow-blue-600/20"
            >
              {loading ? 'Processing...' : 'Register'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 2. Applied the interface to the component
function InputField({ label, ...props }: InputFieldProps) {
  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 ml-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-xl px-4 py-2 bg-white/70 outline-none border border-transparent focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-400"
      />
    </div>
  );
}