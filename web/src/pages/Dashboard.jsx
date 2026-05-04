import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { projectApi, evidenceApi } from '../api'

const COLORS = ['#06b6d4', '#7c3aed', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function Dashboard() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [analytics, setAnalytics] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  
  const username = localStorage.getItem('username')
  const role = localStorage.getItem('role')
  const userId = localStorage.getItem('userId')
  const [displayName, setDisplayName] = useState(localStorage.getItem('displayName') || username)
  const [avatarUrl, setAvatarUrl] = useState(localStorage.getItem('avatarUrl') || '')
  const navigate = useNavigate()

  useEffect(() => {
    setDisplayName(localStorage.getItem('displayName') || username)
    setAvatarUrl(localStorage.getItem('avatarUrl') || '')
  }, [])

  useEffect(() => {
    const onStorage = () => {
      setDisplayName(localStorage.getItem('displayName') || username)
      setAvatarUrl(localStorage.getItem('avatarUrl') || '')
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [username])
  
  const [editingTask, setEditingTask] = useState(null)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editWeight, setEditWeight] = useState('easy')
  const [editAssignedUsername, setEditAssignedUsername] = useState('')
  const [editDeadline, setEditDeadline] = useState('')
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  
  const [pendingInvites, setPendingInvites] = useState([])
  const [isNotifOpen, setIsNotifOpen] = useState(false)
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false)
  const [inviteUsername, setInviteUsername] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteMessage, setInviteMessage] = useState({ type: '', text: '' })
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false)
  const [pendingRemoveProjectId, setPendingRemoveProjectId] = useState(null)
  const [projectSearch, setProjectSearch] = useState('')
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false)
  const [gachaStyle, setGachaStyle] = useState(null)
  const [titleKey, setTitleKey] = useState(0)
  const [welcomeMsg, setWelcomeMsg] = useState('')
  const [welcomeIcon, setWelcomeIcon] = useState(null)

  const WELCOME_POOL = [
    (name) => `Good to see you, ${name}.`,
    (name) => `Welcome back, ${name}.`,
    (name) => `Nice to have you here, ${name}.`,
    (name) => `Hope you're having a good day, ${name}.`,
    (name) => `Glad you're back, ${name}.`,
    (name) => `Everything's right where you left it, ${name}.`,
    (name) => `Take your time, ${name}. No rush.`,
    (name) => `You've got this, ${name}.`,
  ]

  // Random icon SVG paths — monochrome, no colour
  const ICON_POOL = [
    <svg key="star" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    <svg key="bolt" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    <svg key="cpu" width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="7" y="7" width="10" height="10" rx="1" stroke="currentColor" strokeWidth="1.8"/><path d="M9 7V4M12 7V4M15 7V4M9 20v-3M12 20v-3M15 20v-3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
    <svg key="target" width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="6" stroke="currentColor" strokeWidth="1.8"/><circle cx="12" cy="12" r="2" stroke="currentColor" strokeWidth="1.8"/></svg>,
    <svg key="gem" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 3h12l4 6-10 12L2 9l4-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/><path d="M2 9h20M12 3l4 6-4 12-4-12 4-6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    <svg key="shield" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    <svg key="flame" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M12 22c5 0 8-3.5 8-7 0-5-4-7-4-7s1 3-2 5c0-4-3-7-5-9 0 5-5 6-5 11 0 3.5 3 7 8 7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/></svg>,
    <svg key="sword" width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M14.5 17.5L3 6V3h3l11.5 11.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 19l2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M15 21l2-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M3 15l3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/><path d="M20 4l-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>,
  ]

  // Toned-down gacha: font variety + gentle color, no flashy animations
  const GACHA_POOL = [
    { id: 'playfair', font: "'Playfair Display', serif",     cls: 'title-fade',        size: '4rem',   color: '#e2e8f0' },
    { id: 'cinzel',   font: "'Cinzel Decorative', cursive",  cls: 'title-fade',        size: '3.2rem', color: '#cbd5e1' },
    { id: 'bebas',    font: "'Bebas Neue', cursive",         cls: 'title-fade',        size: '5.5rem', color: '#e2e8f0' },
    { id: 'abril',    font: "'Abril Fatface', cursive",      cls: 'title-fade',        size: '4.5rem', color: '#ddd6fe' },
    { id: 'righteous',font: "'Righteous', cursive",          cls: 'title-fade',        size: '4rem',   color: '#bae6fd' },
    { id: 'exo',      font: "'Exo 2', sans-serif",           cls: 'title-shimmer-soft',size: '4.2rem', color: 'white'   },
    { id: 'orbitron', font: "'Orbitron', sans-serif",        cls: 'title-fade',        size: '3rem',   color: '#94a3b8' },
    { id: 'mono',     font: "'Space Mono', monospace",       cls: 'title-fade',        size: '3.5rem', color: '#cbd5e1' },
  ]

  const [members, setMembers] = useState([])
  const [kickLog, setKickLog] = useState([])
  const [membersTab, setMembersTab] = useState('members')
  const [kickTarget, setKickTarget] = useState(null)
  const [kickReason, setKickReason] = useState('')
  const [kickLoading, setKickLoading] = useState(false)
  const [kickMessage, setKickMessage] = useState({ type: '', text: '' })

  const [evidenceTask, setEvidenceTask] = useState(null)
  const [evidences, setEvidences] = useState([])
  const [evidenceUrl, setEvidenceUrl] = useState('')
  const [evidenceDesc, setEvidenceDesc] = useState('')
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const [evidenceSubmitMsg, setEvidenceSubmitMsg] = useState({ type: '', text: '' })
  const [evidenceFetching, setEvidenceFetching] = useState(false)

  useEffect(() => {
    fetchProjects()
    if (role === 'MEMBER' || role === 'LECTURER') fetchPendingInvites()
    const name = localStorage.getItem('displayName') || localStorage.getItem('username') || 'there'
    const fn = WELCOME_POOL[Math.floor(Math.random() * WELCOME_POOL.length)]
    setWelcomeMsg(fn(name))
    setWelcomeIcon(ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)])
  }, [])

  useEffect(() => {
    if (selectedProject) {
      sessionStorage.setItem('lastSelectedProjectId', selectedProject.id)
      fetchAnalytics(selectedProject.id)
      fetchTasks(selectedProject.id)
      if (role === 'LEADER') fetchMembers(selectedProject.id)
      // Gacha roll: pick a random style
      const rolled = GACHA_POOL[Math.floor(Math.random() * GACHA_POOL.length)]
      setGachaStyle(rolled)
      setTitleKey(k => k + 1)
    }
  }, [selectedProject])

  const fetchProjects = async () => {
    try {
      let projectList = []
      if (role === 'LEADER') {
        const res = await projectApi.get(`/projects?leaderId=${userId}`)
        projectList = res.data
      } else if (role === 'MEMBER' || role === 'LECTURER') {
          const res = await projectApi.get(`/projects?memberId=${userId}`)
          projectList = res.data
      }
      setProjects(projectList)
      if (projectList.length > 0) {
        const lastProjectId = sessionStorage.getItem('lastSelectedProjectId')
        const lastProject = lastProjectId && projectList.find(p => p.id === lastProjectId)
        setSelectedProject(lastProject || projectList[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchAnalytics = async (projectId) => {
    try {
      const res = await projectApi.get(`/tasks/${projectId}/analytics`)
      setAnalytics(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchTasks = async (projectId) => {
    try {
      const res = await projectApi.get(`/tasks/${projectId}`)
      setTasks(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const fetchMembers = async (projectId) => {
    try {
      const res = await projectApi.get(`/projects/${projectId}/members`)
      setMembers(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredProjects = projects.filter((p) => p.name.toLowerCase().includes(projectSearch.toLowerCase()))

  const fetchKickLog = async (projectId) => {
    try {
      const res = await projectApi.get(`/projects/${projectId}/kick-log`)
      setKickLog(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleDeleteProject = async (projectId) => {
    try {
      await projectApi.delete(`/projects/${projectId}/members/${userId}`, {
        data: { reason: 'Left project' }
      })
      setProjects(prev => prev.filter(p => p.id !== projectId))
      setSelectedProject(null)
    } catch (err) {
      console.error(err)
    } finally {
      setShowRemoveConfirm(false)
      setPendingRemoveProjectId(null)
    }
  }

  const handleConfirmRemoveProject = async () => {
    if (!pendingRemoveProjectId) return
    await handleDeleteProject(pendingRemoveProjectId)
  }

  const handleKickMember = async () => {
    if (!kickReason.trim()) return
    setKickLoading(true)
    setKickMessage({ type: '', text: '' })
    try {
      await projectApi.delete(`/projects/${selectedProject.id}/members/${kickTarget.userId}`, {
        data: { reason: kickReason }
      })
      setMembers(prev => prev.filter(m => m.userId !== kickTarget.userId))
      setKickMessage({ type: 'success', text: `${kickTarget.user?.username || kickTarget.userId} has been removed.` })
      fetchKickLog(selectedProject.id)
      setTimeout(() => { setKickTarget('list'); setKickReason(''); setMembersTab('history') }, 1200)
    } catch (err) {
      const data = err.response?.data
      const msg = Array.isArray(data?.message) ? data.message[0] : data?.message || 'Failed to kick member.'
      setKickMessage({ type: 'error', text: msg })
    } finally {
      setKickLoading(false)
    }
  }

  const fetchPendingInvites = async () => {
    try {
      const res = await projectApi.get(`/projects/invites/${userId}`)
      console.log("INVITE DATA FROM BACKEND:", res.data)
      setPendingInvites(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleAcceptInvite = async (projectId) => {
    try {
      await projectApi.post(`/projects/${projectId}/accept-invite`, { userId })
      setPendingInvites(prev => prev.filter(i => i.projectId !== projectId))
      fetchProjects()
    } catch (err) {
      console.error(err)
    }
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()
    setInviteMessage({ type: '', text: '' })
    if (!inviteUsername.trim()) return

    setInviteLoading(true)
    try {
      await projectApi.post(`/projects/${selectedProject.id}/invite`, { username: inviteUsername })
      setInviteMessage({ type: 'success', text: `Invite sent to ${inviteUsername}!` })
      setInviteUsername('') 
      
    } catch (err) {
      const data = err.response?.data;
      const backendMessage = data?.message || data?.error || err.response?.statusText || err.message;
      const errorMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      
      setInviteMessage({ type: 'error', text: errorMessage || 'Failed to send invite. Check username.' })
    } finally {
      setInviteLoading(false)
    }
  }

  const openEvidenceModal = async (task) => {
    setEvidenceTask(task)
    setEvidenceUrl('')
    setEvidenceDesc('')
    setEvidenceSubmitMsg({ type: '', text: '' })
    setEvidenceFetching(true)
    try {
      const res = await evidenceApi.get(`/evidence/${task.id}`)
      setEvidences(res.data)
    } catch (err) {
      console.error(err)
      setEvidences([])
    } finally {
      setEvidenceFetching(false)
    }
  }

  const handleSubmitEvidence = async () => {
    if (!evidenceUrl.trim()) return
    setEvidenceLoading(true)
    setEvidenceSubmitMsg({ type: '', text: '' })
    try {
      await evidenceApi.post(`/evidence/${evidenceTask.id}`, {
        url: evidenceUrl,
        submittedBy: username,
        description: evidenceDesc || undefined,
      })
      setEvidenceSubmitMsg({ type: 'success', text: 'Evidence submitted successfully!' })
      setEvidenceUrl('')
      setEvidenceDesc('')
      const res = await evidenceApi.get(`/evidence/${evidenceTask.id}`)
      setEvidences(res.data)
    } catch (err) {
      const data = err.response?.data
      const msg = Array.isArray(data?.message) ? data.message[0] : data?.message || 'Failed to submit evidence.'
      setEvidenceSubmitMsg({ type: 'error', text: msg })
    } finally {
      setEvidenceLoading(false)
    }
  }

  const handleVerifyEvidence = async (evidenceId, isValid) => {
    try {
      await evidenceApi.post(`/evidence/${evidenceId}/verify`, {
        reviewerId: userId,
        isValid,
      })
      if (isValid) {
        setEvidences(prev => prev.map(e => e.id === evidenceId ? { ...e, isVerified: true } : e))
      } else {
        // Rejected or revoked — remove from list
        setEvidences(prev => prev.filter(e => e.id !== evidenceId))
      }
      fetchTasks(selectedProject.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleProgressUpdate = async (taskId, newProgress) => {
    if (newProgress === 100) {
      try {
        const res = await evidenceApi.get(`/evidence/${taskId}`)
        const hasVerified = res.data.some(e => e.isVerified)
        if (!hasVerified) {
          const task = tasks.find(t => t.id === taskId)
          if (task) {
            setEvidences(res.data)
            setEvidenceTask(task)
            setEvidenceUrl('')
            setEvidenceDesc('')
            setEvidenceSubmitMsg({ type: 'error', text: 'A verified evidence is required before marking this task as done.' })
          }
          return
        }
      } catch (err) {
        console.error(err)
        return
      }
    }
    const status = newProgress === 100 ? 'DONE' : newProgress > 0 ? 'IN_PROGRESS' : 'PENDING'
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress: newProgress, status } : t))
    try {
      await projectApi.put(`/tasks/${taskId}/status`, { progress: newProgress, status })
      fetchAnalytics(selectedProject.id)
    } catch (err) {
      console.error(err)
    }
  }

  const openEditTask = (task) => {
    setEditingTask(task)
    setEditName(task.name)
    setEditDescription(task.description || '')
    setEditWeight(task.weight)
    setEditAssignedUsername(task.assignedTo || '')
    setEditDeadline(task.deadline ? task.deadline.split('T')[0] : '')
    setEditError('')
  }

  const handleEditTask = async () => {
    setEditLoading(true)
    setEditError('')
    try {
      await projectApi.patch(`/tasks/${editingTask.id}`, {
        name: editName,
        description: editDescription,
        weight: editWeight,
        assignedTo: editAssignedUsername,
        deadline: editDeadline || null,
      })
      setTasks(prev => prev.map(t => t.id === editingTask.id ? {
        ...t,
        name: editName,
        description: editDescription,
        weight: editWeight,
        assignedTo: editAssignedUsername,
        deadline: editDeadline || null,
      } : t))
      setEditingTask(null)
    } catch (err) {
      console.log("Edit Task Error:", err.response?.data || err); 
      const data = err.response?.data;
      const backendMessage = data?.message || data?.error || err.response?.statusText || err.message;
      const errorMessage = Array.isArray(backendMessage) ? backendMessage[0] : backendMessage;
      setEditError(errorMessage || 'Failed to update task.');
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await projectApi.delete(`/tasks/${taskId}`)
      fetchTasks(selectedProject.id)
      fetchAnalytics(selectedProject.id)
    } catch (err) {
      console.error(err)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  const formatLabel = (str) => {
    if (!str) return ''
    return str.replace(/_/g, ' ').charAt(0).toUpperCase() + str.replace(/_/g, ' ').slice(1).toLowerCase()
  }

  const getStatusColor = (status) => {
    if (status === 'DONE') return '#10b981'
    if (status === 'IN_PROGRESS') return '#06b6d4'
    return '#6b7280'
  }

  const getWeightColor = (weight) => {
    if (weight === 'HARD') return '#ef4444'
    if (weight === 'MEDIUM') return '#f59e0b'
    return '#10b981'
  }

  const canUpdateTask = (task) => {
    if (role === 'LEADER') return true
    if (role === 'MEMBER' && task.assignedTo === username) return true
    return false
  }

  return (
    <div className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Satisfy&family=Dancing+Script:wght@700&family=Pacifico&family=Cinzel+Decorative:wght@700&family=Orbitron:wght@700&family=Playfair+Display:ital,wght@0,700;1,700&family=Bebas+Neue&family=Space+Mono:wght@700&family=Righteous&family=Abril+Fatface&family=Exo+2:wght@800&display=swap');

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
        .blob-a { animation: floatA 10s ease-in-out infinite; }
        .blob-b { animation: floatB 13s ease-in-out infinite; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
        input[type=range] { -webkit-appearance: none; appearance: none; height: 4px; border-radius: 2px; outline: none; cursor: pointer; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 16px; height: 16px; border-radius: 50%; background: #06b6d4; cursor: pointer; border: 2px solid #1a1a2e; }

        /* ── Custom Project Dropdown ── */
        .proj-dropdown-btn {
          position: relative;
          overflow: hidden;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .proj-dropdown-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.08) 100%);
          opacity: 0;
          transition: opacity 0.25s;
        }
        .proj-dropdown-btn:hover::before { opacity: 1; }
        .proj-dropdown-btn:hover { border-color: rgba(6,182,212,0.4) !important; box-shadow: 0 0 20px rgba(6,182,212,0.1), inset 0 0 20px rgba(124,58,237,0.05); }

        .proj-dropdown-list { animation: dropSlide 0.18s cubic-bezier(0.16,1,0.3,1); }
        @keyframes dropSlide {
          from { opacity: 0; transform: translateY(-8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .proj-dropdown-item { transition: background 0.15s, padding-left 0.15s; }
        .proj-dropdown-item:hover { padding-left: 20px !important; }

        /* ── Project Title ── */
        @keyframes titleReveal {
          from { opacity: 0; transform: translateY(10px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }
        @keyframes shimmerSoft {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .title-fade { animation: titleReveal 0.45s ease forwards; }
        .title-shimmer-soft {
          background: linear-gradient(90deg, #e2e8f0 30%, #7c3aed 50%, #06b6d4 65%, #e2e8f0 80%);
          background-size: 250% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: titleReveal 0.45s ease forwards, shimmerSoft 5s linear infinite;
        }

        /* ── Welcome greeting ── */
        @keyframes welcomeFade {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .welcome-greeting { animation: welcomeFade 0.5s ease forwards; }
      `}</style>

      <div className="blob-a fixed top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
      <div className="blob-b fixed bottom-[-100px] right-[-60px] w-[450px] h-[450px] rounded-full opacity-15 blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />

      <nav className="relative z-50 border-b border-white/10 backdrop-blur-md px-6 py-4"
        style={{ background: 'rgba(255,255,255,0.03)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
          <div className="flex items-center gap-4">
            {(role === 'MEMBER' || role === 'LECTURER') && (
              <div className="relative">
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition border ${isNotifOpen ? 'border-cyan-500/50 text-cyan-400' : 'border-white/10 text-gray-400 hover:text-white hover:border-white/30'}`}
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M13.73 21a2 2 0 01-3.46 0" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  {pendingInvites.length > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                </button>

                {isNotifOpen && (
                  <div className="absolute right-0 mt-3 w-80 rounded-2xl border border-white/10 shadow-2xl overflow-hidden z-50"
                    style={{ background: '#1a1a2e', backdropFilter: 'blur(10px)' }}>
                    <div className="px-4 py-3 border-b border-white/10 bg-white/5 flex justify-between items-center">
                      <h3 className="text-sm font-semibold text-white">Notifications</h3>
                      {pendingInvites.length > 0 && (
                        <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">{pendingInvites.length} new</span>
                      )}
                    </div>
                    
                    <div className="max-h-[300px] overflow-y-auto">
                      {pendingInvites.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-gray-500 text-sm">No new notifications</p>
                        </div>
                      ) : (
                        pendingInvites.map(invite => (
                          <div key={invite.id} className="px-4 py-4 border-b border-white/5 hover:bg-white/5 transition">
                            <p className="text-sm text-gray-300 mb-3 leading-relaxed">
                              You've been invited to join <span className="font-semibold text-white">{invite.project?.name || 'a project'}</span>
                              {invite.project?.leader?.username && (
                                <span> by <span className="text-cyan-400">{invite.project.leader.username}</span></span>
                              )}
                            </p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAcceptInvite(invite.projectId)}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-white transition hover:opacity-90"
                                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                                Accept
                              </button>
                              <button
                                onClick={() => setPendingInvites(prev => prev.filter(i => i.projectId !== invite.projectId))}
                                className="flex-1 py-1.5 rounded-lg text-xs font-medium text-gray-400 border border-white/10 hover:bg-white/10 transition">
                                Dismiss
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="text-right ml-2">
              <p className="text-white text-sm font-medium">{displayName}</p>
              <p className="text-xs capitalize"
                style={{ color: '#06b6d4' }}>{role?.replace('_', ' ')}</p>
            </div>
            <button
              onClick={() => navigate('/edit-profile')}
              title="Edit Profile"
              className="w-9 h-9 rounded-full overflow-hidden border-2 border-white/20 hover:border-cyan-500/50 transition flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ background: avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                (displayName || '?').slice(0, 2).toUpperCase()
              )}
            </button>
            <button onClick={handleLogout} title="Logout"
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 border border-white/10 hover:border-red-500/40 hover:text-red-400 transition group relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M16 17l5-5-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 12H9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="absolute right-0 top-10 bg-gray-900 text-xs text-gray-300 px-2 py-1 rounded-lg border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
                Logout
              </span>
            </button>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.8"/>
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.8"/>
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.8"/>
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="white" strokeWidth="1.8"/>
              </svg>
            </div>
            <div>
              {welcomeMsg && (
                <p className="welcome-greeting text-sm mb-1.5 flex items-center gap-1.5" style={{ color: '#94a3b8', fontFamily: "'Space Mono', monospace", letterSpacing: '0.02em' }}>
                  {welcomeIcon && <span className="opacity-50">{welcomeIcon}</span>}
                  {welcomeMsg}
                </p>
              )}
              <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
              <p className="text-gray-400">Track your team's contributions and progress</p>
            </div>
          </div>
          {role === 'LEADER' && (
            <Link to="/create-project"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
              New Project
            </Link>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-400">Loading...</p>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-gray-400 text-lg mb-4">No projects yet</p>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="mb-4 opacity-20">
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="white" strokeWidth="1.5"/>
              <path d="M3 9h18" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M9 21V9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 16h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {role === 'LEADER' ? (
              <Link to="/create-project" className="text-cyan-400 text-sm hover:text-cyan-300 transition">
                Create a project to get started →
              </Link>
            ) : (
              <p className="text-gray-600 text-sm">Ask your project leader to add you to a project</p>
            )}
          </div>
        ) : (
          <>
            {/* Project selector + New Task button */}
            <div className="flex gap-3 mb-4 flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
                <label className="text-sm text-gray-400">Project</label>

                {/* ── Custom Dropdown ── */}
                <div className="relative w-full sm:w-72" onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setProjectDropdownOpen(false) }} tabIndex={-1}>
                  <button
                    onClick={() => setProjectDropdownOpen(o => !o)}
                    className="proj-dropdown-btn w-full flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm text-white outline-none cursor-pointer"
                    style={{
                      background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(6,182,212,0.07) 100%)',
                      borderColor: projectDropdownOpen ? 'rgba(6,182,212,0.5)' : 'rgba(255,255,255,0.1)',
                      boxShadow: projectDropdownOpen ? '0 0 0 3px rgba(6,182,212,0.08), 0 4px 24px rgba(6,182,212,0.08)' : 'none',
                      backdropFilter: 'blur(8px)',
                    }}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Colored dot based on project index */}
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: `linear-gradient(135deg, ${['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'][projects.findIndex(p=>p.id===selectedProject?.id) % 6]}, rgba(255,255,255,0.3))`, boxShadow: `0 0 8px ${['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'][projects.findIndex(p=>p.id===selectedProject?.id) % 6]}60` }} />
                      <span className="truncate font-medium">{selectedProject?.name || 'Select project'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-gray-600 text-xs" style={{ fontFamily: "'Space Mono', monospace" }}>{projects.length}</span>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-gray-400 transition-transform duration-200"
                        style={{ transform: projectDropdownOpen ? 'rotate(180deg)' : 'none' }}>
                        <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </button>

                  {projectDropdownOpen && (
                    <div className="proj-dropdown-list absolute top-full left-0 right-0 mt-2 rounded-2xl border border-white/10 overflow-hidden z-50"
                      style={{ background: 'rgba(15,12,41,0.97)', backdropFilter: 'blur(20px)', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)' }}>

                      {/* Search inside dropdown */}
                      <div className="px-3 pt-3 pb-2 border-b border-white/5">
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" className="text-gray-500 flex-shrink-0">
                            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                            <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                          <input
                            autoFocus
                            value={projectSearch}
                            onChange={e => setProjectSearch(e.target.value)}
                            placeholder="Search projects…"
                            className="bg-transparent text-white text-xs placeholder-gray-600 outline-none w-full"
                          />
                        </div>
                      </div>

                      <div className="max-h-56 overflow-y-auto py-2">
                        {filteredProjects.length === 0 ? (
                          <p className="text-center text-gray-600 text-xs py-4">No projects found</p>
                        ) : filteredProjects.map((p, i) => {
                          const dotColor = ['#7c3aed','#06b6d4','#10b981','#f59e0b','#ef4444','#8b5cf6'][i % 6]
                          const isActive = selectedProject?.id === p.id
                          return (
                            <button key={p.id}
                              onClick={() => { setSelectedProject(p); setProjectDropdownOpen(false); setProjectSearch('') }}
                              className="proj-dropdown-item w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm transition"
                              style={{
                                paddingLeft: isActive ? '20px' : '16px',
                                background: isActive ? 'rgba(6,182,212,0.07)' : 'transparent',
                                color: isActive ? '#fff' : '#9ca3af',
                              }}>
                              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: dotColor, boxShadow: isActive ? `0 0 6px ${dotColor}` : 'none' }} />
                              <span className="truncate flex-1">{p.name}</span>
                              {isActive && (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" className="flex-shrink-0" style={{ color: '#06b6d4' }}>
                                  <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              )}
                            </button>
                          )
                        })}
                      </div>

                      {/* Footer hint */}
                      <div className="px-4 py-2 border-t border-white/5 flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                          <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                        <span className="text-gray-700 text-xs" style={{ fontFamily: "'Space Mono', monospace" }}>{projects.length} project{projects.length !== 1 ? 's' : ''} total</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* ── Edit icon button ── */}
                {role === 'LEADER' && selectedProject && (
                  <Link to={`/edit-project/${selectedProject.id}`}
                    title="Edit Project"
                    className="group flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition border border-white/10 hover:border-white/20 hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                      <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z" stroke="#9ca3af" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                )}
              </div>
              {role === 'LEADER' && selectedProject && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsInviteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition border border-white/10 hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                      <circle cx="8.5" cy="7" r="4" stroke="white" strokeWidth="2"/>
                      <path d="M20 8v6M23 11h-6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    Invite Member
                  </button>

                  <button
                    onClick={() => { fetchMembers(selectedProject.id); fetchKickLog(selectedProject.id); setMembersTab('members'); setKickTarget('list') }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border border-white/10 hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#9ca3af' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Members
                  </button>

                  <Link to={`/create-task?projectId=${selectedProject.id}`}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white transition"
                    style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M12 5v14M5 12h14" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                    New Task
                  </Link>
                </div>
              )}

              {role === 'LECTURER' && selectedProject && (
                <div className="flex gap-2">
                  <button
                    onClick={() => { fetchMembers(selectedProject.id); fetchKickLog(selectedProject.id); setMembersTab('members'); setKickTarget('list') }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border border-white/10 hover:bg-white/5"
                    style={{ background: 'rgba(255,255,255,0.03)', color: '#9ca3af' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    Members
                  </button>
                  <button
                    onClick={() => { setPendingRemoveProjectId(selectedProject.id); setShowRemoveConfirm(true) }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition border border-red-500/20 hover:bg-red-500/10"
                    style={{ background: 'rgba(239,68,68,0.05)', color: '#f87171' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <polyline points="3 6 5 6 21 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M9 6V4h6v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Remove Project
                  </button>
                </div>
              )}
            </div>

            {/* ── Project Title Section ── */}
            {selectedProject && gachaStyle && (
              <div key={titleKey} className="mb-8 px-1">
                <h2
                  className={gachaStyle.cls}
                  style={{
                    fontFamily: gachaStyle.font,
                    fontSize: gachaStyle.size,
                    color: gachaStyle.cls === 'title-shimmer-soft' ? undefined : gachaStyle.color,
                    lineHeight: 1.1,
                    letterSpacing: gachaStyle.id === 'orbitron' ? '0.04em' : gachaStyle.id === 'bebas' ? '0.06em' : '0.01em',
                    fontWeight: 700,
                    maxWidth: '800px',
                    wordBreak: 'break-word',
                  }}>
                  {selectedProject.name}
                </h2>
                {/* Thin accent line */}
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-px w-16 rounded-full" style={{ background: 'linear-gradient(90deg, rgba(124,58,237,0.6), rgba(6,182,212,0.4))' }} />
                  <div className="h-px flex-1 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
                </div>
              </div>
            )}

            {selectedProject && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Contribution pie chart */}
                <div className="rounded-2xl p-6 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:'#06b6d4'}}>
                      <path d="M21.21 15.89A10 10 0 118 2.83" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M22 12A10 10 0 0012 2v10z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h2 className="text-white font-semibold text-lg">Contribution Chart</h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Based on completed task weights</p>
                  {analytics.length === 0 ? (
                    <div className="flex items-center justify-center h-48">
                      <p className="text-gray-600 text-sm">No completed tasks yet</p>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={260}>
                      <PieChart>
                        <Pie data={analytics} dataKey="score" nameKey="name"
                          cx="50%" cy="50%" outerRadius={90} innerRadius={50}>
                          {analytics.map((_, i) => (
                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value, name) => [`${value} pts`, name]}
                          contentStyle={{
                            background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px', color: '#fff'
                          }} />
                        <Legend formatter={(value) => (
                          <span style={{ color: '#9ca3af', fontSize: '13px' }}>{value}</span>
                        )} />
                      </PieChart>
                    </ResponsiveContainer>
                  )}
                </div>

                {/* Member scores */}
                <div className="rounded-2xl p-6 border border-white/10"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:'#7c3aed'}}>
                      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.8"/>
                      <path d="M23 21v-2a4 4 0 00-3-3.87" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      <path d="M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                    </svg>
                    <h2 className="text-white font-semibold text-lg">Member Scores</h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">Weighted contribution per member</p>
                  {analytics.length === 0 ? (
                    <div className="flex items-center justify-center h-48">
                      <p className="text-gray-600 text-sm">No data yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {analytics.sort((a, b) => b.score - a.score).map((member, i) => (
                        <div key={member.name}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full"
                                style={{ background: COLORS[i % COLORS.length] }} />
                              <span className="text-white text-sm font-medium">{member.name}</span>
                            </div>
                            <span className="text-sm" style={{ color: COLORS[i % COLORS.length] }}>
                              {member.percentage}%
                            </span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-white/5">
                            <div className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${member.percentage}%`,
                                background: COLORS[i % COLORS.length]
                              }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Task list */}
                <div className="rounded-2xl p-6 border border-white/10 lg:col-span-2"
                  style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{color:'#10b981'}}>
                      <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <h2 className="text-white font-semibold text-lg">Tasks</h2>
                  </div>
                  <p className="text-gray-500 text-sm mb-6">All tasks in this project</p>
                  {tasks.length === 0 ? (
                    <div className="flex items-center justify-center h-24">
                      <p className="text-gray-600 text-sm">No tasks yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {tasks.map((task) => (
                        <div key={task.id}
                          className="rounded-xl p-4 border border-white/5"
                          style={{ background: 'rgba(255,255,255,0.03)' }}>
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-white text-sm font-medium">{task.name}</p>
                            <div className="flex gap-1.5 items-center">
                              {role === 'LEADER' && (
                                <button
                                  onClick={() => openEditTask(task)}
                                  title="Edit Task"
                                  className="group w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                                  style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background='rgba(124,58,237,0.25)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.5)' }}
                                  onMouseLeave={e => { e.currentTarget.style.background='rgba(124,58,237,0.08)'; e.currentTarget.style.borderColor='rgba(124,58,237,0.2)' }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#a78bfa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              {role === 'LEADER' && (
                                <button
                                  onClick={() => handleDeleteTask(task.id)}
                                  title="Delete Task"
                                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-150"
                                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
                                  onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.22)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.5)' }}
                                  onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)' }}>
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                                    <polyline points="3 6 5 6 21 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M10 11v6M14 11v6" stroke="#f87171" strokeWidth="2" strokeLinecap="round"/>
                                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" stroke="#f87171" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                </button>
                              )}
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${getWeightColor(task.weight)}20`,
                                  color: getWeightColor(task.weight)
                                }}>
                                {formatLabel(task.weight)}
                              </span>
                              <span className="text-xs px-2 py-0.5 rounded-full"
                                style={{
                                  background: `${getStatusColor(task.status)}20`,
                                  color: getStatusColor(task.status)
                                }}>
                                {formatLabel(task.status)}
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-500 text-xs mb-1">
                            {task.assignedTo || 'Unassigned'}
                          </p>

                          {task.description && (
                            <p className="text-gray-400 text-xs mb-1 italic">
                              {task.description}
                            </p>
                          )}

                          {task.deadline && (
                            <div className="flex items-center gap-1.5 mb-3">
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                                style={{ color: new Date(task.deadline) < new Date() ? '#ef4444' : '#f59e0b', flexShrink: 0 }}>
                                <rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                <path d="M8 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                <path d="M16 3v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                              <span className="text-xs" style={{
                                color: new Date(task.deadline) < new Date() ? '#ef4444' : '#f59e0b'
                              }}>
                                {new Date(task.deadline).toLocaleDateString('en-GB', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                                {new Date(task.deadline) < new Date() && task.status !== 'DONE' && (
                                  <span className="ml-1 text-red-400">· Overdue</span>
                                )}
                              </span>
                            </div>
                          )}
                          {!task.deadline && <div className="mb-3" />}

                          {canUpdateTask(task) ? (
                            <div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                step="10"
                                value={task.progress}
                                onChange={(e) => handleProgressUpdate(task.id, parseInt(e.target.value))}
                                className="w-full mb-1"
                                style={{
                                  background: `linear-gradient(to right, #06b6d4 ${task.progress}%, rgba(255,255,255,0.1) ${task.progress}%)`
                                }}
                              />
                              <div className="flex justify-between items-center">
                                <p className="text-gray-600 text-xs">{task.progress}%</p>
                                {task.progress === 100 && (
                                  <p className="text-xs" style={{color:'#10b981'}}>✓ Done</p>
                                )}
                              </div>
                              {task.progress < 100 && (
                                <p className="text-gray-600 text-xs mt-1 flex items-center gap-1">
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" style={{flexShrink:0}}>
                                    <path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 5v6m0 4h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                  </svg>
                                  Verified evidence required to complete
                                </p>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="w-full h-1.5 rounded-full bg-white/5">
                                <div className="h-1.5 rounded-full"
                                  style={{
                                    width: `${task.progress}%`,
                                    background: 'linear-gradient(90deg, #7c3aed, #06b6d4)'
                                  }} />
                              </div>
                              <p className="text-gray-600 text-xs mt-1">{task.progress}%</p>
                            </div>
                          )}

                          {(canUpdateTask(task) || role === 'LEADER') && (
                            <button
                              onClick={() => openEvidenceModal(task)}
                              className="mt-3 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-white/10 text-xs font-medium transition hover:border-violet-500/40 hover:text-violet-300 hover:bg-violet-500/5"
                              style={{ color: '#9ca3af', background: 'rgba(255,255,255,0.02)' }}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                                <line x1="9" y1="13" x2="15" y2="13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                                <line x1="9" y1="17" x2="12" y2="17" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                              </svg>
                              Evidence
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Task Modal */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditingTask(null) }}>
          <div className="w-full max-w-md rounded-3xl p-8 border border-white/10"
            style={{ background: '#1a1a2e' }}>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Edit Task</h2>
              <button onClick={() => setEditingTask(null)}
                className="text-gray-500 hover:text-white transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Task Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Assign to</label>
                <input
                  type="text"
                  value={editAssignedUsername}
                  onChange={(e) => setEditAssignedUsername(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
                {editError && (
                  <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                    {editError}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                <input
                  type="date"
                  value={editDeadline}
                  onChange={(e) => setEditDeadline(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                  style={{ colorScheme: 'dark' }}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Weight</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'EASY', label: 'Easy', color: '#10b981' },
                    { value: 'MEDIUM', label: 'Medium', color: '#f59e0b' },
                    { value: 'HARD', label: 'Hard', color: '#ef4444' },
                  ].map((w) => (
                    <button
                      key={w.value}
                      type="button"
                      onClick={() => setEditWeight(w.value)}
                      className="py-2 rounded-xl text-sm font-medium border transition"
                      style={{
                        borderColor: editWeight === w.value ? w.color : 'rgba(255,255,255,0.1)',
                        background: editWeight === w.value ? `${w.color}15` : 'rgba(255,255,255,0.03)',
                        color: editWeight === w.value ? w.color : '#9ca3af',
                      }}>
                      {w.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleEditTask}
                disabled={editLoading}
                className="w-full font-semibold py-3 rounded-xl text-white transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                {editLoading ? 'Saving...' : 'Save Changes →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Member Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.7)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setIsInviteModalOpen(false) }}>
          <div className="w-full max-w-md rounded-3xl p-8 border border-white/10"
            style={{ background: '#1a1a2e' }}>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Invite Member</h2>
              <button onClick={() => {setIsInviteModalOpen(false); setInviteMessage({type:'', text:''})}}
                className="text-gray-500 hover:text-white transition">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            {inviteMessage.text && (
              <div className={`mb-4 p-3 rounded-xl text-sm ${inviteMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'} border`}>
                {inviteMessage.text}
              </div>
            )}

            <form onSubmit={handleSendInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Exact Username</label>
                <input
                  type="text"
                  value={inviteUsername}
                  onChange={(e) => setInviteUsername(e.target.value)}
                  placeholder="e.g., test1"
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition"
                />
              </div>
              <button
                type="submit"
                disabled={inviteLoading || !inviteUsername.trim()}
                className="w-full font-semibold py-3 rounded-xl text-white transition disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                {inviteLoading ? 'Sending...' : 'Send Invite →'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Remove Project Confirmation Modal */}
      {showRemoveConfirm && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowRemoveConfirm(false) }}>
          <div className="w-full max-w-sm rounded-3xl p-8 border border-white/10"
            style={{ background: '#1a1a2e' }}>
            <div className="mb-4">
              <h2 className="text-white font-semibold text-lg">Remove Project</h2>
              <p className="text-gray-400 text-sm mt-2">
                Are you sure you want to remove <span className="text-white">{selectedProject.name}</span> from your dashboard?
                This will only remove it for you and will not delete the project for other members.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmRemoveProject}
                className="flex-1 py-3 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                Remove
              </button>
              <button
                onClick={() => { setShowRemoveConfirm(false); setPendingRemoveProjectId(null) }}
                className="flex-1 py-3 rounded-xl text-sm font-medium text-gray-300 border border-white/10 hover:bg-white/5 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Modal */}
      {evidenceTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setEvidenceTask(null) }}>
          <div className="w-full max-w-lg rounded-3xl border border-white/10 overflow-hidden"
            style={{ background: '#1a1a2e', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed40, #06b6d440)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    <polyline points="14 2 14 8 20 8" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base leading-tight">Evidence</h2>
                  <p className="text-gray-500 text-xs">{evidenceTask.name}</p>
                </div>
              </div>
              <button onClick={() => setEvidenceTask(null)}
                className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">

              {/* Existing evidences */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  Submitted Evidence {evidences.length > 0 && `(${evidences.length})`}
                </p>
                {evidenceFetching ? (
                  <p className="text-gray-600 text-sm text-center py-4">Loading...</p>
                ) : evidences.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-white/10 py-6 text-center">
                    <p className="text-gray-600 text-sm">No evidence submitted yet</p>
                    <p className="text-gray-700 text-xs mt-1">Submit a link below to get started</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {evidences.map((ev) => (
                      <div key={ev.id} className="rounded-xl p-3 border"
                        style={{
                          background: ev.isVerified ? 'rgba(16,185,129,0.05)' : 'rgba(255,255,255,0.02)',
                          borderColor: ev.isVerified ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)'
                        }}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <a href={ev.fileUrl} target="_blank" rel="noopener noreferrer"
                              className="text-cyan-400 text-xs hover:text-cyan-300 transition truncate block underline underline-offset-2">
                              {ev.fileUrl}
                            </a>
                            {ev.description && (
                              <p className="text-gray-500 text-xs mt-1">{ev.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-gray-600 text-xs">by {ev.uploadedBy}</span>
                              {ev.isVerified ? (
                                <span className="flex items-center gap-1 text-xs" style={{color:'#10b981'}}>
                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                                    <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                  </svg>
                                  Verified
                                </span>
                              ) : (
                                <span className="text-xs text-gray-600">Pending review</span>
                              )}
                            </div>
                          </div>
                          {role === 'LEADER' && !ev.isVerified && (
                            <div className="flex gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleVerifyEvidence(ev.id, true)}
                                className="px-2 py-1 rounded-lg text-xs font-medium transition"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)' }}>
                                Approve
                              </button>
                              <button
                                onClick={() => handleVerifyEvidence(ev.id, false)}
                                className="px-2 py-1 rounded-lg text-xs font-medium transition"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                Reject
                              </button>
                            </div>
                          )}
                          {role === 'LEADER' && ev.isVerified && (
                            <button
                              onClick={() => handleVerifyEvidence(ev.id, false)}
                              className="text-gray-600 hover:text-red-400 transition flex-shrink-0 text-xs px-2 py-1 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                              Revoke
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit new evidence — only if can update task (assigned member or leader) */}
              {canUpdateTask(evidenceTask) && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Submit Evidence</p>

                  {evidenceSubmitMsg.text && (
                    <div className={`mb-3 p-3 rounded-xl text-xs border ${evidenceSubmitMsg.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
                      {evidenceSubmitMsg.text}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Evidence URL <span className="text-red-400">*</span></label>
                      <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://drive.google.com/..."
                        className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-400 mb-1.5">Description <span className="text-gray-600">(optional)</span></label>
                      <input
                        type="text"
                        value={evidenceDesc}
                        onChange={(e) => setEvidenceDesc(e.target.value)}
                        placeholder="Brief description of this evidence..."
                        className="w-full px-3 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition"
                      />
                    </div>
                    <button
                      onClick={handleSubmitEvidence}
                      disabled={evidenceLoading || !evidenceUrl.trim()}
                      className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                      {evidenceLoading ? 'Submitting...' : 'Submit Evidence →'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {/* Members Modal */}
      {kickTarget === 'list' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setKickTarget(null) }}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 overflow-hidden"
            style={{ background: '#1a1a2e', maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}>

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #7c3aed40, #06b6d440)', border: '1px solid rgba(124,58,237,0.3)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke="#a78bfa" strokeWidth="1.8" strokeLinecap="round"/>
                    <circle cx="9" cy="7" r="4" stroke="#a78bfa" strokeWidth="1.8"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Members</h2>
                  <p className="text-gray-500 text-xs">{selectedProject?.name}</p>
                </div>
              </div>
              <button onClick={() => setKickTarget(null)}
                className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="flex border-b border-white/10">
              {['members', 'history'].map(tab => (
                <button key={tab} onClick={() => setMembersTab(tab)}
                  className="flex-1 py-3 text-sm font-medium transition"
                  style={{
                    color: membersTab === tab ? '#06b6d4' : '#6b7280',
                    borderBottom: membersTab === tab ? '2px solid #06b6d4' : '2px solid transparent',
                    background: 'transparent'
                  }}>
                  {tab === 'members' ? `Members (${members.filter(m => m.user?.role !== 'LECTURER').length})` : `Kick History (${kickLog.length})`}
                </button>
              ))}
            </div>

            <div className="overflow-y-auto flex-1 px-6 py-5">
              {membersTab === 'members' ? (
                members.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-8">No members yet</p>
                ) : (
                  <div className="space-y-2">
                    {members.filter(m => m.user?.role !== 'LECTURER').map((m) => (
                      <div key={m.userId} className="flex items-center justify-between p-3 rounded-xl border border-white/8"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: m.user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                            {m.user?.avatarUrl
                              ? <img src={m.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                              : (m.user?.displayName || m.user?.username || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="text-white text-sm">{m.user?.displayName || m.user?.username || m.userId}</p>
                              {m.isLeader && (
                                <span className="text-xs px-1.5 py-0.5 rounded-md font-medium"
                                  style={{ background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }}>
                                  Leader
                                </span>
                              )}
                            </div>
                            {m.user?.displayName && <p className="text-gray-600 text-xs">@{m.user.username}</p>}
                          </div>
                        </div>
                        {role === 'LEADER' && !m.isLeader && (
                        <button
                          onClick={() => { setKickTarget(m); setKickReason(''); setKickMessage({ type: '', text: '' }) }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                          style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Kick
                        </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              ) : (
                kickLog.length === 0 ? (
                  <p className="text-gray-600 text-sm text-center py-8">No kick history yet</p>
                ) : (
                  <div className="space-y-2">
                    {kickLog.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl border border-white/8"
                        style={{ background: 'rgba(255,255,255,0.02)' }}>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold text-white"
                            style={{ background: log.user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #ef4444, #f87171)' }}>
                            {log.user?.avatarUrl
                              ? <img src={log.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                              : (log.user?.displayName || log.user?.username || '?').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-white text-sm font-medium">{log.user?.displayName || log.user?.username || log.memberId}</p>
                            {log.user?.displayName && <p className="text-gray-600 text-xs">@{log.user.username}</p>}
                          </div>
                          <span className="ml-auto text-gray-600 text-xs">
                            {new Date(log.kickedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-400 text-xs px-1 py-1.5 rounded-lg border border-white/5"
                          style={{ background: 'rgba(239,68,68,0.05)' }}>
                          "{log.reason}"
                        </p>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Kick Confirmation Modal */}
      {kickTarget && kickTarget !== 'list' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ background: 'rgba(0,0,0,0.75)' }}
          onClick={(e) => { if (e.target === e.currentTarget) { setKickTarget('list'); setKickMessage({ type: '', text: '' }) } }}>
          <div className="w-full max-w-md rounded-3xl border border-white/10 overflow-hidden"
            style={{ background: '#1a1a2e' }}>

            <div className="flex items-center justify-between px-6 py-5 border-b border-white/10"
              style={{ background: 'rgba(255,255,255,0.03)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                    <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" stroke="#f87171" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">Kick Member</h2>
                  <p className="text-gray-500 text-xs">This will be logged</p>
                </div>
              </div>
              <button onClick={() => { setKickTarget('list'); setKickMessage({ type: '', text: '' }) }}
                className="text-gray-500 hover:text-white transition w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl border border-white/8"
                style={{ background: 'rgba(255,255,255,0.02)' }}>
                <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-white"
                  style={{ background: kickTarget.user?.avatarUrl ? 'transparent' : 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
                  {kickTarget.user?.avatarUrl
                    ? <img src={kickTarget.user.avatarUrl} alt="" className="w-full h-full object-cover" />
                    : (kickTarget.user?.displayName || kickTarget.user?.username || '?').slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{kickTarget.user?.displayName || kickTarget.user?.username || kickTarget.userId}</p>
                  {kickTarget.user?.displayName && <p className="text-gray-500 text-xs">@{kickTarget.user.username}</p>}
                  <p className="text-gray-500 text-xs">Will be removed from {selectedProject?.name}</p>
                </div>
              </div>

              {kickMessage.text && (
                <div className={`p-3 rounded-xl text-xs border ${kickMessage.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
                  {kickMessage.text}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Reason <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={kickReason}
                  onChange={(e) => setKickReason(e.target.value)}
                  placeholder="Explain why this member is being removed..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 transition resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => { setKickTarget('list'); setKickMessage({ type: '', text: '' }) }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium text-gray-400 border border-white/10 hover:bg-white/5 transition">
                  Cancel
                </button>
                <button
                  onClick={handleKickMember}
                  disabled={kickLoading || !kickReason.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)' }}>
                  {kickLoading ? 'Removing...' : 'Kick Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}