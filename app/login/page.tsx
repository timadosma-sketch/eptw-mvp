'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, Eye, EyeOff, AlertCircle } from 'lucide-react';

const DEMO_USERS = [
  { name: 'Amir Seitkali',           email: 'a.seitkali@alnoor.kz',         role: 'Issuing Authority'    },
  { name: 'Dinara Bekova',           email: 'd.bekova@alnoor.kz',            role: 'Area Authority'       },
  { name: 'Yerzhan Akhmetov',        email: 'y.akhmetov@alnoor.kz',         role: 'HSE Officer'          },
  { name: 'Sergei Volkov',           email: 's.volkov@alnoor.kz',           role: 'Gas Tester'           },
  { name: 'John McAllister',         email: 'j.mcallister@petrofac.com',    role: 'Permit Requester'     },
  { name: 'Aliya Nurmagambetova',    email: 'a.nurmagambetova@alnoor.kz',   role: 'Site Supervisor'      },
  { name: 'Ruslan Dzhaksybekov',     email: 'r.dzhaksybekov@alnoor.kz',    role: 'Isolation Authority'  },
  { name: 'Natalya Petrova',         email: 'n.petrova@alnoor.kz',          role: 'Plant Ops Manager'    },
];

export default function LoginPage() {
  const router    = useRouter();
  const [email,    setEmail]    = useState('a.seitkali@alnoor.kz');
  const [password, setPassword] = useState('eptw2026');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.error) {
        setError('Invalid email or password.');
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-brand mb-4">
            <Shield className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white">ePTW Platform</h1>
          <p className="text-sm text-gray-500 mt-1">Al-Noor Refinery · Electronic Permit to Work</p>
        </div>

        {/* Card */}
        <div className="bg-surface-raised border border-surface-border rounded-xl p-6 shadow-xl">
          <h2 className="text-sm font-semibold text-gray-300 mb-5">Sign in to continue</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full bg-surface-panel border border-surface-border rounded-lg px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/30 transition"
                placeholder="you@alnoor.kz"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="w-full bg-surface-panel border border-surface-border rounded-lg px-3 py-2.5 pr-10 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-brand/60 focus:ring-1 focus:ring-brand/30 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-xs text-red-400 bg-red-950/40 border border-red-800/50 rounded-lg px-3 py-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand/90 disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold text-sm rounded-lg py-2.5 transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-5 pt-5 border-t border-surface-border">
            <p className="text-2xs text-gray-600 mb-2 uppercase tracking-widest font-semibold">
              Demo accounts — password: <span className="text-brand font-mono">eptw2026</span>
            </p>
            <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => setEmail(u.email)}
                  className={`text-left px-2.5 py-2 rounded-lg border transition text-2xs ${
                    email === u.email
                      ? 'border-brand/50 bg-brand/10 text-brand'
                      : 'border-surface-border bg-surface-panel text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <div className="font-semibold truncate">{u.name}</div>
                  <div className="text-gray-600 truncate">{u.role}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-2xs text-gray-700 mt-4">
          IEC 62443 · ISA-95 · Zero Trust Architecture
        </p>
      </div>
    </div>
  );
}
