import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Loader2,
    Trash2,
    Clock,
    UserMinus,
    Calendar,
    FileText,
    MoreVertical,
    UserPlus,
    X,
    Link as LinkIcon,
    LogOut,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi, authApi, evidenceApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/project/$projectId")({
    component: RouteComponent,
});

interface Task {
    id: string;
    name: string;
    description: string;
    weight: "EASY" | "MEDIUM" | "HARD";
    status: "PENDING" | "IN_PROGRESS" | "DONE";
    assignedTo: string | null;
    progress?: number;
    pts?: number;
}

interface ProjectMember {
    id: string;
    userId: string;
    role: string;
    joinedAt: string;
}

interface LogReason {
    id: string;
    projectId: string;
    memberId: string;
    reason: string;
    kickedAt: string;
}

interface Invitation {
    id: string;
    email: string;
    taskName: string;
    difficulty: string;
    status: string;
}

interface Project {
    id: string;
    name: string;
    description: string;
    endDate: string | null;
    leaderId: string;
    members: ProjectMember[];
    invitations: Invitation[];
    tasks: Task[];
    logReasons: LogReason[];
}

function MemberRow({
    userId,
    role,
    isLeader,
    onKick,
    canKick,
}: {
    userId: string;
    role: string;
    isLeader: boolean;
    onKick?: () => void;
    canKick: boolean;
}) {
    const { data: user } = useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const response = await authApi.get(`/auth/users/${userId}`);
            return response.data;
        },
    });

    if (role === "LECTURER" || user?.role === "LECTURER") return null;

    const initials = user?.username?.charAt(0).toUpperCase() || "?";
    const colors = ["bg-[#00008B]", "bg-green-600", "bg-yellow-500", "bg-purple-600", "bg-rose-600"];
    const colorIndex = userId ? userId.charCodeAt(0) % colors.length : 0;

    return (
        <div className="flex items-center gap-3 px-6 py-3.5 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
            <div
                className={`h-8 w-8 rounded-full ${colors[colorIndex]} text-white flex items-center justify-center font-bold text-sm shrink-0 overflow-hidden`}
            >
                {user?.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.username} className="h-full w-full object-cover" />
                ) : (
                    initials
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user?.username || "Loading..."}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
            <div className="flex items-center gap-4">
                {isLeader ? (
                    <span className="text-xs font-bold text-[#00008B] uppercase tracking-wider">LEADER</span>
                ) : (
                    <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">{user?.role === 'LECTURER' ? 'LECTURER' : 'MEMBER'}</span>
                )}
                {canKick && !isLeader && (
                    <button
                        onClick={() => onKick?.(user?.username || "this member")}
                        className="flex items-center gap-1 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                    >
                        <UserMinus className="h-3.5 w-3.5" />
                        Kick
                    </button>
                )}
            </div>
        </div>
    );
}

function KickLogRow({ log }: { log: LogReason }) {
    const { data: user } = useQuery({
        queryKey: ["user", log.memberId],
        queryFn: async () => {
            const response = await authApi.get(`/auth/users/${log.memberId}`);
            return response.data;
        },
    });

    return (
        <div className="flex items-start gap-4 px-7 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
            {user?.avatarUrl ? (
                <img 
                    src={user.avatarUrl} 
                    alt={user.username} 
                    className="h-9 w-9 rounded-full object-cover border border-gray-100 shrink-0"
                />
            ) : (
                <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                    <UserMinus className="h-4 w-4" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-gray-900">
                        {user?.username || "Loading..."} was kicked
                    </p>
                    <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap">
                        {new Date(log.kickedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed italic">
                    "{log.reason}"
                </p>
            </div>
        </div>
    );
}

function UserNameLabel({ userId }: { userId: string }) {
    const { data: user } = useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const response = await authApi.get(`/auth/users/${userId}`);
            return response.data;
        },
        staleTime: 1000 * 60 * 5,
    });

    return <span title={user?.username || `User ${userId.slice(0, 4)}`}>{user?.username || `User ${userId.slice(0, 4)}`}</span>;
}

function DonutChart({ segments, total, completed }: { segments: { value: number; color: string }[]; total: number; completed: number }) {
    const r = 50;
    const cx = 64;
    const cy = 64;
    const circ = 2 * Math.PI * r;

    let currentOffset = circ * 0.25;

    return (
        <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
            <circle cx={cx} cy={cy} r={r} fill="none" stroke="#e5e7eb" strokeWidth="20" />
            
            {segments.map((seg, i) => {
                const pct = total > 0 ? seg.value / total : 0;
                const dash = circ * pct;
                const offset = currentOffset;
                currentOffset -= dash;
                if (pct === 0) return null;
                return (
                    <circle
                        key={i}
                        cx={cx}
                        cy={cy}
                        r={r}
                        fill="none"
                        stroke={seg.color}
                        strokeWidth="20"
                        strokeDasharray={`${dash} ${circ - dash}`}
                        strokeDashoffset={offset}
                        strokeLinecap="butt"
                    />
                );
            })}

            <text x={cx} y={cy - 2} textAnchor="middle" fontSize="18" fontWeight="bold" fill="#111827">
                {completed}
            </text>
            <text x={cx} y={cy + 16} textAnchor="middle" fontSize="11" fill="#9ca3af">
                of {total} pts
            </text>
        </svg>
    );
}

function TaskProgressSlider({
    task,
    isAssigned,
    onUpdate,
    hasEvidence,
    isApproved,
}: {
    task: Task;
    isAssigned: boolean;
    onUpdate: (val: number) => void;
    hasEvidence: boolean;
    isApproved: boolean;
}) {
    const [localProgress, setLocalProgress] = useState(task.status === "DONE" ? 100 : (task.progress ?? 0));

    useEffect(() => {
        setLocalProgress(task.status === "DONE" ? 100 : (task.progress ?? 0));
    }, [task.status, task.progress]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = Number(e.target.value);
        if (!isApproved && val > 90) val = 90;
        setLocalProgress(val);
    };

    const handleCommit = () => {
        if (localProgress !== (task.progress ?? 0)) {
            onUpdate(localProgress);
        }
    };

    return (
        <div className="flex flex-col gap-1 w-36 relative z-10">
            <div className="flex items-center gap-2">
                <input
                    type="range"
                    min="0"
                    max="100"
                    value={localProgress}
                    onChange={handleChange}
                    onMouseUp={handleCommit}
                    onKeyUp={handleCommit}
                    disabled={!isAssigned || isApproved}
                    className="flex-1 h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                    style={{ 
                        accentColor: "#00008B",
                        WebkitAppearance: "slider-horizontal" 
                    }}
                />
                <span className="text-xs font-bold text-gray-700 w-8 shrink-0">{localProgress}%</span>
            </div>
            {!isApproved && localProgress >= 90 && !hasEvidence && (
                <span className="text-[10px] text-orange-600 font-bold">↑ Upload evidence for 100%</span>
            )}
            {!isApproved && hasEvidence && localProgress >= 90 && (
                <span className="text-[10px] text-[#00008B] font-bold">✓ Waiting for approval</span>
            )}
        </div>
    );
}

function EvidenceViewer({ evidence, onClose }: { evidence: any, onClose: () => void }) {
    if (!evidence) {
        return (
            <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in flex flex-col gap-3 min-w-[200px] max-w-[300px]">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold text-gray-500 uppercase">Evidence Details</p>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }} className="text-[10px] font-medium text-gray-500 hover:text-gray-700 bg-gray-200 px-2 py-0.5 rounded transition-colors">
                        Back
                    </button>
                </div>
                <div className="flex items-center gap-2 p-2 bg-white rounded border border-gray-100">
                    <FileText className="h-4 w-4 text-gray-400" />
                    <p className="text-xs text-gray-500 font-medium">No valid evidence data found.</p>
                </div>
            </div>
        );
    }

    const fileUrl = evidence.fileUrl || "";
    const isFile = evidence.description?.includes("file") || fileUrl.includes("spled-storage") || fileUrl.includes("storage.example.com");
    const fileName = fileUrl.split('/').pop() || "evidence-file";

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        
        let url = "";
        let blobUrlToRevoke = "";
        const lowerName = fileName.toLowerCase();
        
        if (lowerName.endsWith('.png') || lowerName.endsWith('.jpg') || lowerName.endsWith('.jpeg')) {
            url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        } else {
            const blob = new Blob(["Simulated file content for: " + fileName], { type: "text/plain" });
            url = window.URL.createObjectURL(blob);
            blobUrlToRevoke = url;
        }

        const a = document.createElement("a");
        a.href = url;
        a.download = decodeURIComponent(fileName);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        if (blobUrlToRevoke) {
            window.URL.revokeObjectURL(blobUrlToRevoke);
        }
    };

    return (
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-lg animate-in fade-in flex flex-col gap-3 min-w-[200px] max-w-[300px]">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-gray-500 uppercase">Evidence Details</p>
                <button onClick={onClose} className="text-[10px] font-medium text-gray-500 hover:text-gray-700 bg-gray-200 px-2 py-0.5 rounded transition-colors">
                    Back
                </button>
            </div>
            
            {isFile ? (
                <div className="flex items-start gap-3">
                    <div className="h-8 w-8 bg-indigo-100 rounded flex items-center justify-center text-[#00008B] shrink-0 mt-0.5">
                        <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-800 break-all" title={decodeURIComponent(fileName)}>
                            {decodeURIComponent(fileName)}
                        </p>
                        <button 
                            onClick={handleDownload}
                            className="text-[10px] text-[#00008B] font-medium hover:underline mt-1 text-left"
                        >
                            Download File
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-2">
                    <div className="h-6 w-6 bg-indigo-50 rounded flex items-center justify-center text-[#00008B] shrink-0 mt-0.5">
                        <LinkIcon className="h-3 w-3" />
                    </div>
                    <a 
                        href={evidence.fileUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-[#00008B] font-medium hover:underline break-all"
                        title={evidence.fileUrl}
                    >
                        {evidence.fileUrl}
                    </a>
                </div>
            )}
        </div>
    );
}

function EvidenceUpload({
    taskId,
    onSubmit,
    onCancel,
}: {
    taskId: string;
    onSubmit: (type: "link" | "file", value: string | File) => void;
    onCancel: () => void;
}) {
    const [mode, setMode] = useState<"link" | "file">("link");
    const [link, setLink] = useState("");
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [urlError, setUrlError] = useState("");
    const MAX_SIZE = 5 * 1024 * 1024;

    const validateUrl = (url: string) => {
        if (!url) return false;
        try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        } catch (_) {
            return false;
        }
    };

    const handleFile = (f: File) => {
        if (f.size > MAX_SIZE) {
            alert("File is too large! Maximum size is 5MB.");
            return;
        }
        setFile(f);
    };

    const isLinkValid = mode === "link" && validateUrl(link);

    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex gap-1 bg-gray-200/50 p-1 rounded-md">
                <button
                    onClick={() => { setMode("link"); setUrlError(""); }}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${mode === "link" ? "bg-white text-[#00008B] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    Link
                </button>
                <button
                    onClick={() => { setMode("file"); setUrlError(""); }}
                    className={`flex-1 py-1 text-[10px] font-bold rounded transition-all ${mode === "file" ? "bg-white text-[#00008B] shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                    File
                </button>
            </div>

            {mode === "link" ? (
                <div className="space-y-1">
                    <input
                        type="url"
                        className={`w-full text-xs p-2 border rounded focus:ring-1 outline-none ${urlError ? "border-red-500 focus:ring-red-500" : "focus:ring-[#00008B]"}`}
                        placeholder="https://github.com/..."
                        value={link}
                        onChange={(e) => {
                            setLink(e.target.value);
                            if (e.target.value && !validateUrl(e.target.value)) {
                                setUrlError("Please enter a valid URL (e.g., https://...)");
                            } else {
                                setUrlError("");
                            }
                        }}
                    />
                    {urlError && <p className="text-[9px] text-red-500 font-medium">{urlError}</p>}
                </div>
            ) : (
                <div
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                        e.preventDefault();
                        setIsDragging(false);
                        const f = e.dataTransfer.files[0];
                        if (f) handleFile(f);
                    }}
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${isDragging ? "border-[#00008B] bg-blue-50" : "border-gray-300 hover:border-gray-400"}`}
                    onClick={() => document.getElementById(`file-inv-${taskId}`)?.click()}
                >
                    <input
                        id={`file-inv-${taskId}`}
                        type="file"
                        className="hidden"
                        onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                        }}
                    />
                    <Plus className="h-5 w-5 mx-auto text-gray-400 mb-1" />
                    <p className="text-[10px] text-gray-500">
                        {file ? <span className="text-[#00008B] font-bold">{file.name}</span> : "Drop file or click to browse"}
                    </p>
                    <p className="text-[8px] text-gray-400 mt-1">Max 5MB</p>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    disabled={(mode === "link" && !isLinkValid) || (mode === "file" && !file)}
                    onClick={() => onSubmit(mode, mode === "link" ? link : file!)}
                    className="flex-1 bg-[#00008B] text-white text-[10px] font-bold py-2 rounded shadow-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                    Submit Evidence
                </button>
                <button
                    onClick={onCancel}
                    className="px-3 border text-[10px] font-medium text-gray-600 rounded hover:bg-white transition-all"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}

function TaskRow({
    task,
    userId,
    project,
    isLeader,
    onUpdate,
    onDelete,
    onClaim,
}: {
    task: Task;
    userId: string | null;
    project: Project;
    isLeader: boolean;
    onUpdate: (val: number) => void;
    onDelete: () => void;
    onClaim: () => void;
}) {
    const queryClient = useQueryClient();
    const [activeEvidenceInput, setActiveEvidenceInput] = useState(false);
    const [viewingEvidence, setViewingEvidence] = useState(false);
    
    const { data: evidenceList } = useQuery({
        queryKey: ["evidence", task.id],
        queryFn: async () => {
            const res = await evidenceApi.get(`/evidence/${task.id}`);
            return res.data;
        },
        enabled: !!task.id,
    });

    const uploadEvidenceMutation = useMutation({
        mutationFn: async ({ type, val }: { type: "link" | "file"; val: string | File }) => {
            let fileUrl = "";
            if (typeof val === 'string') {
                fileUrl = val.includes('://') ? val : `https://${val}`;
                try { new URL(fileUrl); } catch(_) { fileUrl = `https://invalid-link.example.com/${encodeURIComponent(val)}`; }
            } else {
                fileUrl = `https://storage.example.com/uploads/${encodeURIComponent(val.name)}`;
            }

            await evidenceApi.post(`/evidence/${task.id}`, {
                fileUrl,
                description: `Evidence submitted as ${type}`,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["evidence", task.id] });
            setActiveEvidenceInput(false);
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message;
            const detail = Array.isArray(msg) ? msg.join(", ") : (msg || JSON.stringify(err.response?.data) || err.message);
            alert(`Submission failed: ${detail}`);
        }
    });

    const approveEvidenceMutation = useMutation({
        mutationFn: async () => {
            const evidenceId = evidenceList?.[0]?.id;
            if (evidenceId) {
                await evidenceApi.put(`/evidence/${evidenceId}/verify`, {
                    isVerified: true,
                    verificationNotes: "Approved via dashboard",
                });
            }
            await projectApi.put(`/tasks/${task.id}/status`, {
                status: "DONE",
                progress: 100,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message;
            const detail = Array.isArray(msg) ? msg.join(", ") : (msg || JSON.stringify(err.response?.data) || err.message);
            alert(`Approval failed: ${detail}`);
        }
    });

    const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    const isLecturer = userRole === "LECTURER";

    const isAssignedToMe = task.assignedTo === userId;
    const hasEvidence = (evidenceList?.length > 0) || task.status === "DONE";
    const isApproved = task.status === "DONE";
    
    const canApprove = isLeader 
        ? task.assignedTo !== userId
        : (task.assignedTo === project.leaderId);

    const diff = {
        HARD: { label: "Hard", cls: "bg-red-100 text-red-700" },
        MEDIUM: { label: "Medium", cls: "bg-yellow-100 text-yellow-700" },
        EASY: { label: "Easy", cls: "bg-green-100 text-green-700" },
    }[task.weight];

    const statusMap = {
        DONE: { label: "Done", cls: "bg-green-100 text-green-700 px-2.5 py-0.5 rounded text-xs font-semibold" },
        IN_PROGRESS: { label: "In Progress", cls: "text-[#00008B] text-xs font-semibold" },
        PENDING: { label: "To Do", cls: "text-gray-400 text-xs font-medium" },
    };
    const stat = statusMap[task.status];
    const pts = task.pts ?? (task.weight === "HARD" ? 3 : task.weight === "MEDIUM" ? 2 : 1);

    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const handleClose = () => setMenuOpen(false);
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                handleClose();
            }
        };

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            window.addEventListener("scroll", handleClose, true);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            window.removeEventListener("scroll", handleClose, true);
        };
    }, [menuOpen]);

    return (
        <tr className="hover:bg-gray-50/50 transition-colors">
            <td className="px-6 py-4">
                <div className="font-medium text-gray-800">{task.name}</div>
                {task.description && (
                    <div className="text-xs text-gray-400 font-normal mt-0.5 max-w-xs truncate" title={task.description}>
                        {task.description}
                    </div>
                )}
            </td>
            <td className="px-4 py-4">
                <span className={`inline-flex px-2.5 py-0.5 rounded text-xs font-semibold ${diff.cls}`}>
                    {diff.label}
                </span>
            </td>
            <td className="px-4 py-4 text-gray-500">
                <span className="flex items-center gap-1 text-xs">
                    <span className="text-gray-300">○</span>
                    {pts}pts
                </span>
            </td>
            <td className="px-4 py-4">
                {!isLecturer ? (
                    <TaskProgressSlider 
                        task={task}
                        isAssigned={isAssignedToMe} 
                        hasEvidence={hasEvidence}
                        isApproved={isApproved}
                        onUpdate={onUpdate}
                    />
                ) : (
                    <span className="text-xs text-gray-400">-</span>
                )}
            </td>
            <td className="px-4 py-4">
                <span className={stat.cls}>{stat.label}</span>
            </td>
            <td className="px-4 py-4 text-sm text-gray-500">
                {task.assignedTo ? (
                    <span className="truncate block w-24">
                        <UserNameLabel userId={task.assignedTo} />
                    </span>
                ) : !isLecturer ? (
                    <button 
                        onClick={onClaim}
                        className="text-[10px] font-bold text-[#00008B] border border-[#00008B] px-2 py-0.5 rounded hover:bg-[#00008B] hover:text-white transition-all"
                    >
                        Claim Task
                    </button>
                ) : (
                    <span className="text-xs text-gray-400">-</span>
                )}
            </td>
            <td className="px-4 py-4 w-40">
                <div className="flex flex-col gap-2 min-w-[160px] w-full">
                    {activeEvidenceInput ? (
                        <EvidenceUpload 
                            taskId={task.id}
                            onSubmit={(type, val) => uploadEvidenceMutation.mutate({ type, val })}
                            onCancel={() => setActiveEvidenceInput(false)}
                        />
                    ) : viewingEvidence ? (
                        <div className="flex flex-col gap-2 w-full">
                            <EvidenceViewer 
                                evidence={evidenceList?.[0]} 
                                onClose={() => setViewingEvidence(false)} 
                            />
                            {isAssignedToMe && !isApproved && !isLecturer && (
                                <button
                                    onClick={() => {
                                        setViewingEvidence(false);
                                        setActiveEvidenceInput(true);
                                    }}
                                    className="text-[10px] font-medium text-gray-500 hover:text-[#00008B] transition-colors self-start"
                                >
                                    Change Evidence
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {hasEvidence ? (
                                <button
                                    onClick={() => setViewingEvidence(true)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-medium transition-all shadow-sm bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                >
                                    <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    View Evidence
                                </button>
                            ) : !isLecturer ? (
                                <button 
                                    disabled={!isAssignedToMe || isApproved}
                                    onClick={() => setActiveEvidenceInput(true)}
                                    className="flex items-center gap-2 px-2.5 py-1.5 rounded border text-xs font-medium transition-all shadow-sm disabled:opacity-50 bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                                >
                                    <Plus className="h-3 w-3" />
                                    Add Evidence
                                </button>
                            ) : (
                                <span className="text-xs text-gray-400">-</span>
                            )}
                            {hasEvidence && !isApproved && canApprove && !isLecturer && (
                                <button 
                                    onClick={() => approveEvidenceMutation.mutate()}
                                    className="px-2.5 py-1.5 bg-[#00008B] text-white rounded text-[10px] font-bold hover:opacity-90 transition-colors shadow-md animate-pulse"
                                >
                                    Approve Submission
                                </button>
                            )}
                        </>
                    )}
                </div>
            </td>
            {isLeader && (
                <td className="px-4 py-4 w-16 text-right relative">
                    <button
                        ref={buttonRef}
                        onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpen(!menuOpen);
                        }}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                    </button>
                    {menuOpen && (
                        <div
                            ref={menuRef}
                            className="absolute right-6 top-12 bg-white border border-gray-100 shadow-2xl rounded-xl py-1.5 w-32 z-[100] animate-in fade-in zoom-in-95 duration-150 ring-1 ring-black/5"
                        >
                            <Link
                                to={`/dashboard/task/${task.id}/edit`}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#00008B] transition-colors w-full"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit Task
                            </Link>
                            <div className="h-px bg-gray-50 mx-2 my-1" />
                            <button
                                onClick={() => { setMenuOpen(false); onDelete(); }}
                                className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 transition-colors w-full"
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete Task
                            </button>
                        </div>
                    )}
                </td>
            )}
        </tr>
    );
}

function RouteComponent() {
    const navigate = useNavigate();
    const { projectId } = Route.useParams();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteError, setInviteError] = useState("");
    const [isLecturer, setIsLecturer] = useState(false);

    const [kickModal, setKickModal] = useState<{
        isOpen: boolean;
        memberId: string;
        username: string;
        reason: string;
    }>({
        isOpen: false,
        memberId: "",
        username: "",
        reason: "",
    });

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userId = isMounted && typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const userRole = isMounted && typeof window !== "undefined" ? localStorage.getItem("role") : null;

    const {
        data: project,
        isLoading,
        error: fetchError,
    } = useQuery<Project>({
        queryKey: ["projects", projectId],
        queryFn: async () => {
            const response = await projectApi.get(`/projects/${projectId}`);
            return response.data;
        },
    });

    const inviteMemberMutation = useMutation({
        mutationFn: async (email: string) => {
            await projectApi.post(`/projects/${projectId}/invite`, { email });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
            setIsInviteModalOpen(false);
            setInviteEmail("");
            setInviteError("");
            setIsLecturer(false);
        },
        onError: (err: any) => {
            setInviteError(err.response?.data?.message || "Failed to send invitation");
        }
    });

    const handleInviteEmailChange = async (email: string) => {
        setInviteEmail(email);
        setInviteError("");
        
        if (!email) return;

        const emailRegex = /^\S+@\S+\.\S+$/;

        if (!emailRegex.test(email)) {
            // Only show format error if they've started typing something that looks like an email or it's long
            if (email.includes("@") || email.length > 5) {
                setInviteError("Please enter a valid email address (e.g. user@example.com)");
            }
            return;
        }

        if (project?.invitations.some(inv => inv.email.toLowerCase() === email.toLowerCase())) {
            setInviteError("This user has already been invited");
            return;
        }

        try {
            const response = await authApi.get(`/auth/validate-email?email=${email}`);
            if (!response.data.exists) {
                setInviteError("Email is not registered");
                setIsLecturer(false);
            } else {
                // Check if already a member
                if (project?.members.some(member => member.userId === response.data.id)) {
                    setInviteError("This user is already a member of the project");
                    return;
                }
                setIsLecturer(response.data.role === "LECTURER");
            }
        } catch (err) {
            // Ignore validation errors while typing
        }
    };

    const isInviteDisabled = !inviteEmail || !!inviteError || inviteMemberMutation.isPending || !/^\S+@\S+\.\S+$/.test(inviteEmail);

    const updateTaskMutation = useMutation({
        mutationFn: async ({ taskId, progress, status }: { taskId: string; progress: number; status: string }) => {
            await projectApi.put(`/tasks/${taskId}/status`, { status, progress });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId] }),
    });

    const claimTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await projectApi.put(`/tasks/${taskId}/assign`, { memberId: userId });
            await projectApi.put(`/tasks/${taskId}/status`, { status: "IN_PROGRESS", progress: 0 });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId] }),
    });

    const approveEvidenceMutation = useMutation({
        mutationFn: async ({ taskId }: { taskId: string }) => {
            await projectApi.put(`/tasks/${taskId}/status`, { status: "DONE", progress: 100 });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId] }),
    });

    const deleteTaskMutation = useMutation({
        mutationFn: async (taskId: string) => {
            await projectApi.delete(`/tasks/${taskId}`);
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["projects", projectId] }),
    });

    const kickMemberMutation = useMutation({
        mutationFn: async (variables: { memberId: string; reason: string }) => {
            const { memberId, reason } = variables;
            if (!projectId) throw new Error("Missing project ID");
            return projectApi.delete(`/projects/${projectId}/members/${memberId}`, {
                data: { reason }
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
            setKickModal({ isOpen: false, memberId: "", username: "", reason: "" });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || err.message;
            alert(`Kick failed: ${msg}`);
        }
    });

    const handleKickMember = (memberId: string, username: string) => {
        setKickModal({
            isOpen: true,
            memberId,
            username,
            reason: "",
        });
    };

    const submitKick = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        if (!kickModal.memberId || !kickModal.reason.trim()) return;

        kickMemberMutation.mutate({ 
            memberId: kickModal.memberId, 
            reason: kickModal.reason 
        });
    };

    const leaveProjectMutation = useMutation({
        mutationFn: async () => {
            await projectApi.delete(`/projects/${projectId}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            navigate({ to: "/dashboard" });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || err.message;
            alert(`Failed to leave project: ${msg}`);
        }
    });

    const handleLeaveProject = () => {
        if (!confirm("Are you sure you want to leave this project?")) return;
        leaveProjectMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-[#00008B]" />
            </div>
        );
    }

    if (!project || fetchError) {
        return <div className="p-12 text-center text-gray-500">Project not found</div>;
    }

    const tasks = project.tasks.filter((t) => !(isLecturer && t.name === 'TBD')) || [];
    const members = (project.members || []).filter(m => m.role !== 'LECTURER');
    const isLeader = project.leaderId === userId;

    const doneTasks = tasks.filter((t) => t.status === "DONE");
    const totalPts = tasks.reduce((a, t) => a + (t.pts ?? (t.weight === "HARD" ? 3 : t.weight === "MEDIUM" ? 2 : 1)), 0);
    const completedPts = doneTasks.reduce((a, t) => a + (t.pts ?? (t.weight === "HARD" ? 3 : t.weight === "MEDIUM" ? 2 : 1)), 0);
    const progress = totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0;

    const memberContribMap: Record<string, number> = {};
    doneTasks.forEach((t) => {
        if (t.assignedTo) {
            const pts = t.pts ?? (t.weight === "HARD" ? 3 : t.weight === "MEDIUM" ? 2 : 1);
            memberContribMap[t.assignedTo] = (memberContribMap[t.assignedTo] || 0) + pts;
        }
    });

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 space-y-6">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-7 py-6">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <p className="text-xs font-semibold text-[#00008B] uppercase tracking-widest mb-1">Project</p>
                            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                            <p className="text-sm text-gray-500 mt-1">{project.description || "No description provided."}</p>
                        </div>
                        {isLeader && (
                            <Link
                                to="/dashboard/project/edit"
                                search={{ id: projectId }}
                                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shrink-0"
                            >
                                <Edit2 className="h-3.5 w-3.5" />
                                Edit project
                            </Link>
                        )}
                        {!isLeader && (
                            <button
                                onClick={handleLeaveProject}
                                disabled={leaveProjectMutation.isPending}
                                className="button button--leave flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 disabled:opacity-50"
                            >
                                {leaveProjectMutation.isPending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <LogOut className="h-3.5 w-3.5" />
                                )}
                                Leave project
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-5 gap-6 flex-wrap">
                        <div className="flex items-center gap-5 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                                <Calendar className="h-4 w-4" />
                                {project.endDate
                                    ? new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                                    : "No deadline"}
                            </span>
                            <span className="text-gray-300">|</span>
                            <span>
                                Your role:{" "}
                                <span className={`font-bold uppercase text-xs tracking-wide ${isLeader ? "text-[#00008B]" : "text-gray-600"}`}>
                                    {isLeader ? "Leader" : userRole === "LECTURER" ? "Lecturer" : "Member"}
                                </span>
                            </span>
                        </div>
                        <div className="flex items-center gap-3 min-w-[200px]">
                            <span className="text-xs text-gray-400 font-medium whitespace-nowrap">Progress</span>
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-[#00008B] rounded-full transition-all" style={{ width: `${progress}%` }} />
                            </div>
                            <span className="text-xs font-bold text-gray-700 whitespace-nowrap">{progress}%</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="px-7 py-5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-[#00008B] uppercase tracking-widest mb-0.5">Analytics</p>
                    <h2 className="text-lg font-bold text-gray-900">Member Contributions</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Based on total difficulty points of completed tasks</p>
                </div>
                <div className="px-7 py-6 flex items-center gap-8">
                    <DonutChart 
                        total={totalPts} 
                        completed={completedPts} 
                        segments={Object.values(memberContribMap).map((pts, i) => {
                            const colors = ["#00008B", "#22c55e", "#eab308", "#a855f7"];
                            return { value: pts, color: colors[i % colors.length] };
                        })}
                    />
                    <div className="flex-1 space-y-3">
                        {Object.keys(memberContribMap).length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No completed tasks yet.</p>
                        ) : (
                            Object.entries(memberContribMap).map(([uId, pts], i) => {
                                const pct = totalPts > 0 ? Math.round((pts / totalPts) * 100) : 0;
                                const dotColors = ["bg-[#00008B]", "bg-green-500", "bg-yellow-500", "bg-purple-500"];
                                return (
                                    <div key={uId} className="flex items-center gap-3">
                                        <div className={`h-2.5 w-2.5 rounded-full ${dotColors[i % dotColors.length]} shrink-0`} />
                                        <span className="text-sm text-gray-600 w-28 truncate">
                                            <UserNameLabel userId={uId} />
                                        </span>
                                        <span className="text-xs font-bold text-gray-500 ml-auto">
                                            {pts}pts ({pct}%)
                                        </span>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-[#00008B] uppercase tracking-widest mb-0.5">Tasks</p>
                        <h2 className="text-lg font-bold text-gray-900">Task board</h2>
                    </div>
                    {isLeader && (
                        <Link
                            to="/dashboard/task/create"
                            search={{ projectId }}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <Plus className="h-4 w-4" />
                            Add task
                        </Link>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Difficulty</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Pts</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider w-36">Progress</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Assigned To</th>
                                <th className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Evidence</th>
                                {isLeader && (
                                    <th className="px-4 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                )}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {tasks.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-400 italic">
                                        No tasks yet. Add one to get started.
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <TaskRow
                                        key={task.id}
                                        task={task}
                                        userId={userId}
                                        project={project}
                                        isLeader={isLeader}
                                        onUpdate={(val) => updateTaskMutation.mutate({ 
                                            taskId: task.id, 
                                            progress: val, 
                                            status: val === 100 ? "DONE" : "IN_PROGRESS" 
                                        })}
                                        onDelete={() => deleteTaskMutation.mutate(task.id)}
                                        onClaim={() => claimTaskMutation.mutate(task.id)}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-[#00008B] uppercase tracking-widest mb-0.5">Team</p>
                        <h2 className="text-lg font-bold text-gray-900">Members</h2>
                    </div>
                    {isLeader && (
                        <button
                            onClick={() => setIsInviteModalOpen(true)}
                            className="flex items-center gap-1.5 px-4 py-2 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-gray-800 transition-colors"
                        >
                            <UserPlus className="h-4 w-4" />
                            Invite
                        </button>
                    )}
                </div>
                <div>
                    {members.map((member) => (
                        <MemberRow
                            key={member.id}
                            userId={member.userId}
                            role={member.role}
                            isLeader={member.userId === project.leaderId}
                            canKick={isLeader}
                            onKick={(username) => handleKickMember(member.id, username)}
                        />
                    ))}
                    {members.length === 0 && (
                        <p className="px-7 py-6 text-sm text-gray-400 italic">No members yet.</p>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-7 py-5 border-b border-gray-100">
                    <p className="text-xs font-semibold text-[#00008B] uppercase tracking-widest mb-0.5">Activity</p>
                    <h2 className="text-lg font-bold text-gray-900">Kick Log</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Record of members removed from this project</p>
                </div>
                <div>
                    {project.logReasons && project.logReasons.length > 0 ? (
                        project.logReasons.map((log) => (
                            <KickLogRow key={log.id} log={log} />
                        ))
                    ) : (
                        <div className="px-7 py-10 text-center">
                            <Clock className="h-7 w-7 text-gray-200 mx-auto mb-2" />
                            <p className="text-sm text-gray-400">No kicks recorded yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {isInviteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden relative">
                        <button
                            type="button"
                            onClick={() => {
                                setIsInviteModalOpen(false);
                                setInviteEmail("");
                                setInviteError("");
                                setIsLecturer(false);
                            }}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Invite Member</h3>
                            <p className="text-sm text-gray-500 mt-1">Add new members to your project team.</p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Insert Member/Lecturer Email</label>
                                    <input
                                        type="email"
                                        placeholder="member@example.com"
                                        value={inviteEmail}
                                        onChange={(e) => handleInviteEmailChange(e.target.value)}
                                        className={`w-full p-2.5 text-sm border rounded-lg outline-none transition-colors ${
                                            inviteError ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500" : "border-gray-200 focus:border-[#00008B] focus:ring-1 focus:ring-[#00008B]"
                                        }`}
                                    />
                                    {inviteError && (
                                        <p className="text-xs text-red-500 font-medium mt-1.5">{inviteError}</p>
                                    )}
                                    {isLecturer && !inviteError && (
                                        <p className="text-xs text-[#00008B] font-medium mt-1.5 bg-blue-50 p-2 rounded border border-blue-100">
                                            Note: The invited user is a Lecturer. They will be invited to view and evaluate the project.
                                        </p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => inviteMemberMutation.mutate(inviteEmail)}
                                    disabled={isInviteDisabled}
                                    className="w-full py-2.5 bg-[#00008B] text-white text-sm font-bold rounded-lg hover:bg-blue-900 disabled:opacity-50 transition-colors flex items-center justify-center"
                                >
                                    {inviteMemberMutation.isPending ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Send Invitation"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {kickModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl w-full max-w-md shadow-xl overflow-hidden relative">
                        <button
                            type="button"
                            onClick={() => setKickModal({ ...kickModal, isOpen: false })}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <div className="px-6 py-5 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Kick Member</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Are you sure you want to remove <span className="font-bold text-gray-900">{kickModal.username}</span>?
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                        Reason for Removal <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        placeholder="e.g. Inactivity, poor communication..."
                                        value={kickModal.reason}
                                        onChange={(e) => setKickModal({ ...kickModal, reason: e.target.value })}
                                        rows={3}
                                        className={`w-full p-2.5 text-sm border rounded-lg outline-none transition-colors resize-none ${
                                            !kickModal.reason.trim() ? "border-gray-200" : "border-red-200 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                                        }`}
                                    />
                                    <p className="text-[10px] text-gray-400 mt-1.5 uppercase font-bold tracking-tight">
                                        {kickModal.reason.trim() ? "Reason will be recorded" : "A reason is required to enable confirmation"}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setKickModal({ ...kickModal, isOpen: false })}
                                        className="flex-1 py-2.5 border border-gray-200 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="button"
                                        onClick={submitKick}
                                        disabled={!kickModal.reason.trim() || kickMemberMutation.isPending}
                                        className="flex-[2] py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:bg-gray-300 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {kickMemberMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <UserMinus className="h-4 w-4" />
                                        )}
                                        {kickMemberMutation.isPending ? "Removing..." : "Confirm Kick"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
