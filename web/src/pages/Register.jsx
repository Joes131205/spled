import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi } from '../api'

const RoleIcon = ({ role }) => {
  if (role === 'MEMBER') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M4 20 C4 16.7 7.6 14 12 14 C16.4 14 20 16.7 20 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
    </svg>
  )
  if (role === 'LEADER') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="7" r="3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M5 19 C5 16.2 8.1 14 12 14 C15.9 14 19 16.2 19 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 1 L13.5 4.5 L17 5 L14.5 7.5 L15 11 L12 9.5 L9 11 L9.5 7.5 L7 5 L10.5 4.5 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
  if (role === 'LECTURER') return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.8"/>
      <path d="M8 21 L16 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M12 17 L12 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M7 8 L12 6 L17 8 L12 10 Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M17 8 L17 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('MEMBER')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const validate = () => {
    if (username.length < 3) {
        setError('Username must be at least 3 characters')
        return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address')
        return false
    }
    if (password.length < 4) {
        setError('Password must be at least 4 characters')
        return false
    }
    return true
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
        await authApi.post('/auth/register', { username, email, password, role })
        navigate('/login')
    } catch (err) {
        setError(err.response?.data?.message || 'Registration failed')
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
        .role-card { transition: all 0.2s ease; cursor: pointer; }
        .role-card:hover { transform: translateY(-2px); }
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

      <div className="w-full max-w-md relative z-10 py-10">
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
          <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
          <p className="text-gray-400 text-sm">Join your team and start splitting tasks fairly.</p>
        </div>

        <div className="rounded-3xl p-8 border border-white/10 backdrop-blur-md"
          style={{ background: 'rgba(255,255,255,0.05)' }}>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="yourname"
                required
                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">I am joining as</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'MEMBER', label: 'Member', desc: 'Team contributor' },
                  { value: 'LEADER', label: 'Leader', desc: 'Project manager' },
                  { value: 'LECTURER', label: 'Lecturer', desc: 'Oversees teams' },
                ].map((r) => (
                  <div
                    key={r.value}
                    className="role-card rounded-xl p-3 border text-center"
                    onClick={() => setRole(r.value)}
                    style={{
                      borderColor: role === r.value ? '#06b6d4' : 'rgba(255,255,255,0.1)',
                      background: role === r.value ? 'rgba(6,182,212,0.1)' : 'rgba(255,255,255,0.03)',
                    }}>
                    <div className="flex justify-center mb-2"
                      style={{ color: role === r.value ? '#06b6d4' : '#6b7280' }}>
                      <RoleIcon role={r.value} />
                    </div>
                    <p className="text-sm font-semibold"
                      style={{ color: role === r.value ? '#06b6d4' : '#9ca3af' }}>
                      {r.label}
                    </p>
                    <p className="text-xs mt-1"
                      style={{ color: role === r.value ? '#67e8f9' : '#6b7280' }}>
                      {r.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold py-3 rounded-xl transition duration-200 text-white shadow-lg disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 font-medium hover:text-cyan-300 transition">
              Sign in
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