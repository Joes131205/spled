import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi } from '../api'

export default function EditProfile() {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const username = localStorage.getItem('username')
  const role = localStorage.getItem('role')

  const [displayName, setDisplayName] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [avatarPreview, setAvatarPreview] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await authApi.get('/profile')
        setDisplayName(res.data.displayName || '')
        setAvatarUrl(res.data.avatarUrl || '')
        setAvatarPreview(res.data.avatarUrl || '')
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      setAvatarUrl(dataUrl)
      setAvatarPreview(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUrlChange = (val) => {
    setAvatarUrl(val)
    setAvatarPreview(val)
  }

  const getInitials = () => {
    const name = displayName || username || '?'
    return name.slice(0, 2).toUpperCase()
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage({ type: '', text: '' })
    try {
      const res = await authApi.put('/profile', {
        displayName: displayName || null,
        avatarUrl: avatarUrl || null,
      })
      if (res.data.displayName !== undefined) {
        localStorage.setItem('displayName', res.data.displayName || '')
        window.dispatchEvent(new Event('storage'))
      }
      if (res.data.avatarUrl !== undefined) {
        localStorage.setItem('avatarUrl', res.data.avatarUrl || '')
        window.dispatchEvent(new Event('storage'))
      }
      setMessage({ type: 'success', text: 'Profile updated successfully!' })
    } catch (err) {
      const data = err.response?.data
      const msg = Array.isArray(data?.message) ? data.message[0] : data?.message || 'Failed to update profile.'
      setMessage({ type: 'error', text: msg })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
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
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .blob-a { animation: floatA 10s ease-in-out infinite; }
        .blob-b { animation: floatB 13s ease-in-out infinite; }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
      `}</style>

      <div className="blob-a fixed top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="blob-b fixed bottom-[-100px] right-[-60px] w-[450px] h-[450px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

      <nav className="relative z-50 border-b border-white/10 backdrop-blur-md px-6 py-4"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/dashboard')}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 text-gray-400 hover:text-white hover:border-white/30 transition">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="3" fill="white" opacity="0.9"/>
                  <path d="M12 3 L12 7" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M12 17 L12 21" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M3 12 L7 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <path d="M17 12 L21 12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-white font-bold text-lg">SplitTask</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white text-sm font-medium">{username}</p>
            <p className="text-xs capitalize" style={{ color: '#06b6d4' }}>{role?.replace('_', ' ')}</p>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-10 fade-up">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="12" cy="7" r="4" stroke="white" strokeWidth="1.8"/>
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">Edit Profile</h1>
            <p className="text-gray-400 text-sm">Update your display name and avatar</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : (
          <div className="rounded-3xl border border-white/10 overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="px-8 py-8 border-b border-white/10 flex flex-col items-center gap-4"
              style={{ background: 'rgba(255,255,255,0.02)' }}>
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/20 flex items-center justify-center text-white text-2xl font-bold"
                  style={{ background: avatarPreview ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={() => setAvatarPreview('')}
                    />
                  ) : (
                    getInitials()
                  )}
                </div>
                <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full border-2 flex items-center justify-center"
                  style={{ background: '#1a1a2e', borderColor: 'rgba(255,255,255,0.2)' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="#06b6d4" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="12" cy="13" r="4" stroke="#06b6d4" strokeWidth="1.8"/>
                  </svg>
                </div>
              </div>
              <div className="text-center">
                <p className="text-white font-semibold">{displayName || username}</p>
                <p className="text-gray-500 text-xs mt-0.5">@{username}</p>
              </div>
            </div>

            <div className="px-8 py-8 space-y-5">

              {message.text && (
                <div className={`p-3 rounded-xl text-sm border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {message.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">
                  Username <span className="text-gray-600 text-xs">(cannot be changed)</span>
                </label>
                <div className="w-full px-4 py-3 rounded-xl border border-white/5 text-gray-500 text-sm"
                  style={{ background: 'rgba(255,255,255,0.02)' }}>
                  @{username}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Display Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={username}
                  maxLength={32}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition text-sm"
                />
                <p className="text-gray-600 text-xs mt-1">{displayName.length}/32</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Profile Picture</label>
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 text-sm transition hover:border-cyan-500/40 hover:text-cyan-300"
                    style={{ background: 'rgba(255,255,255,0.04)', color: '#9ca3af' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Upload File
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <div className="flex items-center text-gray-600 text-xs">or</div>
                  <input
                    type="url"
                    value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                    onChange={(e) => handleAvatarUrlChange(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition text-sm"
                  />
                </div>
                {avatarPreview && (
                  <div className="flex items-center gap-2">
                    <p className="text-gray-600 text-xs">
                      {avatarUrl.startsWith('data:') ? '✓ File selected' : '✓ URL set'}
                    </p>
                    <button onClick={() => { setAvatarUrl(''); setAvatarPreview('') }}
                      className="text-xs text-red-400 hover:text-red-300 transition">Remove</button>
                  </div>
                )}
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full py-3 rounded-xl font-semibold text-white transition disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                {saving ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}