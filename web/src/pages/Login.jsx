import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address')
        return
    }
    if (password.length < 4) {
        setError('Password must be at least 4 characters')
        return
    }

    setLoading(true)
    try {
        const res = await authApi.post('/auth/login', { email, password })
        localStorage.setItem('token', res.data.accessToken)
        localStorage.setItem('role', res.data.user.role)
        localStorage.setItem('username', res.data.user.username)
        localStorage.setItem('userId', res.data.user.id)
        localStorage.setItem('displayName', res.data.user.displayName || '')
        localStorage.setItem('avatarUrl', res.data.user.avatarUrl || '')
        navigate('/dashboard')
    } catch (err) {
        const status = err.response?.status
        if (status === 401) {
        setError('Incorrect email or password. Please try again.')
        } else if (status === 404) {
        setError('No account found with this email.')
        } else {
        setError('Something went wrong. Please try again.')
        }
    } finally {
        setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)' }}>

      <style>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-50px, 40px) scale(1.05); }
          66% { transform: translate(30px, -30px) scale(0.9); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.1); }
        }
        @keyframes orbFloat {
          0%, 100% { transform: translateY(0px); opacity: 0.6; }
          50% { transform: translateY(-15px); opacity: 1; }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translateY(0px); opacity: 0.4; }
          50% { transform: translateY(-20px); opacity: 0.8; }
        }
        .blob-a { animation: floatA 10s ease-in-out infinite; }
        .blob-b { animation: floatB 13s ease-in-out infinite; }
        .blob-c { animation: floatC 8s ease-in-out infinite; }
        .orb-1 { animation: orbFloat 4s ease-in-out infinite; }
        .orb-2 { animation: orbFloat2 5s ease-in-out infinite 1s; }
        .orb-3 { animation: orbFloat 6s ease-in-out infinite 2s; }
        .orb-4 { animation: orbFloat2 3.5s ease-in-out infinite 0.5s; }
      `}</style>

      <div className="blob-a absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="blob-b absolute bottom-[-100px] right-[-60px] w-[450px] h-[450px] rounded-full opacity-25 blur-3xl"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
      <div className="blob-c absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl"
        style={{ background: 'radial-gradient(circle, #10b981, transparent)' }} />

      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

      <div className="orb-1 absolute top-[20%] right-[15%] w-3 h-3 rounded-full bg-cyan-400 opacity-60" />
      <div className="orb-2 absolute top-[60%] left-[10%] w-2 h-2 rounded-full bg-purple-400 opacity-60" />
      <div className="orb-3 absolute top-[80%] right-[30%] w-2 h-2 rounded-full bg-emerald-400 opacity-60" />
      <div className="orb-4 absolute top-[30%] left-[20%] w-4 h-4 rounded-full bg-cyan-300 opacity-30" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
                <path d="M12 3 L12 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 17 L12 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3 12 L7 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M17 12 L21 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                <path d="M5.6 5.6 L8.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                <path d="M15.5 15.5 L18.4 18.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                <path d="M18.4 5.6 L15.5 8.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
                <path d="M8.5 15.5 L5.6 18.4" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-white tracking-tight">SplitTask</span>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <h1 className="text-3xl font-bold text-white">Welcome back</h1>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <path d="M10 6 C10 4.9 10.9 4 12 4 C13.1 4 14 4.9 14 6 L14 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M14 8 C14 6.9 14.9 6 16 6 C17.1 6 18 6.9 18 8 L18 16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M18 10 C18 8.9 18.9 8 20 8 C21.1 8 22 8.9 22 10 L22 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 12 C10 10.9 9.1 10 8 10 C6.9 10 6 10.9 6 12 L6 18 C6 22.4 9.6 26 14 26 L18 26 C21.3 26 24 23.3 24 20 L24 18 L22 18 L18 18 L14 18 L10 18 Z" fill="white" opacity="0.15"/>
              <path d="M6 14 C6 12.9 6.9 12 8 12 L10 12 L10 18" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <path d="M6 18 C6 22.4 9.6 26 14 26 L18 26 C21.3 26 24 23.3 24 20 L24 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-gray-400 text-sm">Good to see you. Let's make today productive.</p>
        </div>

        <div className="rounded-3xl p-8 border border-white/10 backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.05)' }}>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl transition duration-200 text-white shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-400 font-medium hover:text-cyan-300 transition">
              Sign up
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          SplitTask — Fair work for everyone.
        </p>
      </div>
    </div>
  )
}