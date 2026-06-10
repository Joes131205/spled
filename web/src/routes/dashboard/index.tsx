import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Calendar, MoreVertical, Plus, Trash2, Edit2, LogOut, Users, Loader2, Mail, AlertCircle, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi, ghostBusterApi } from "../../utils/api";

export const Route = createFileRoute("/dashboard/")({
    component: RouteComponent,
});

interface Project {
    id: string;
    name: string;
    description: string;
    endDate: string | null;
    createdAt: string;
    leaderId: string;
    members: { userId: string; role: string }[];
    tasks: any[];
}

function KebabMenu({
    project,
    onEdit,
    onDelete,
    onLeave,
    isLeader,
}: {
    project: Project;
    onEdit: () => void;
    onDelete: () => void;
    onLeave: () => void;
    isLeader: boolean;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen((v) => !v);
                }}
                className="kebab-btn"
                aria-label="Project actions"
            >
                <MoreVertical className="h-4 w-4" />
            </button>

            {open && (
                <div className="dropdown-menu">
                    {isLeader && (
                        <Link
                            to="/dashboard/project/edit"
                            search={{ id: project.id }}
                            className="dropdown-item"
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpen(false);
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                        </Link>
                    )}
                    {isLeader && (
                        <button
                            className="dropdown-item dropdown-item--danger"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpen(false);
                                onDelete();
                            }}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    )}
                    <button
                        className="dropdown-item dropdown-item--leave"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpen(false);
                            onLeave();
                        }}
                    >
                        <LogOut className="h-3.5 w-3.5" />
                        Leave
                    </button>
                </div>
            )}
        </div>
    );
}

function RouteComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userId = isMounted && typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const userRole =
        isMounted && typeof window !== "undefined"
            ? localStorage.getItem("role") || "MEMBER"
            : "MEMBER";
    const isLecturer = userRole === "LECTURER";

    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: "delete" | "leave" | null;
        projectId: string | null;
        projectName: string | null;
    }>({
        isOpen: false,
        type: null,
        projectId: null,
        projectName: null,
    });

    const [alertExpanded, setAlertExpanded] = useState(false);

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await projectApi.get("/projects/my");
            return response.data;
        },
        enabled: !!userId,
    });

    const { data: invitations = [] } = useQuery<any[]>({
        queryKey: ["invitations", "pending"],
        queryFn: async () => {
            const response = await projectApi.get("/invitations/my");
            return response.data;
        },
        enabled: !!userId,
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await projectApi.delete(`/projects/${projectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setConfirmModal({ isOpen: false, type: null, projectId: null, projectName: null });
        },
    });

    const handleDelete = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            type: "delete",
            projectId: id,
            projectName: name,
        });
    };

    const leaveProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await projectApi.delete(`/projects/${projectId}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            setConfirmModal({ isOpen: false, type: null, projectId: null, projectName: null });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || err.message;
            alert(`Failed to leave project: ${msg}`);
        }
    });

    const handleLeave = (id: string, name: string) => {
        setConfirmModal({
            isOpen: true,
            type: "leave",
            projectId: id,
            projectName: name,
        });
    };

    const calculateProgress = (tasks: any[]) => {
        if (!tasks || tasks.length === 0) return 0;
        const doneTasks = tasks.filter(t => t.status === "DONE").length;
        return Math.round((doneTasks / tasks.length) * 100);
    };

    // Calculate global warnings across all projects
    const globalWarnings: { projectId: string; projectName: string; type: "FLAGGED" | "H-3" | "H-2" | "H-1" | "OVERDUE" }[] = [];
    const projectWarnings: Record<string, "H-3" | "H-2" | "H-1" | "OVERDUE"> = {};
    
    projects.forEach(project => {
        if (isLecturer || !userId) return;
        
        // Find if user is in this project
        const myMember = project.members?.find(m => m.userId === userId);
        if (!myMember) return;

        const unfinishedTasks = project.tasks?.filter(t => t.assignedTo === userId && t.status !== "DONE") || [];
        
        if (unfinishedTasks.length > 0 && project.endDate) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadline = new Date(project.endDate);
            deadline.setHours(0, 0, 0, 0);
            const diffTime = deadline.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let warningType: "H-3" | "H-2" | "H-1" | "OVERDUE" | null = null;
            if (diffDays === 3) warningType = "H-3";
            else if (diffDays === 2) warningType = "H-2";
            else if (diffDays === 1 || diffDays === 0) warningType = "H-1";
            else if (diffDays < 0) warningType = "OVERDUE";

            if (warningType) {
                // For the small reminder on the project card itself (always shows if near deadline)
                projectWarnings[project.id] = warningType;

                // For the aggressive global banner: only show if they haven't started (progress === 0) 
                // OR haven't updated their tasks recently (e.g. > 24 hours ago)
                const hasStaleTasks = unfinishedTasks.some(t => {
                    if (!t.progress || t.progress === 0) return true; // Hasn't even started
                    const updatedTime = new Date(t.updatedAt || new Date(0)).getTime();
                    const hoursSinceUpdate = (Date.now() - updatedTime) / (1000 * 60 * 60);
                    return hoursSinceUpdate > 24;
                });

                if (hasStaleTasks) {
                    globalWarnings.push({ projectId: project.id, projectName: project.name, type: warningType });
                }
            }
        }
    });

    return (
        <div className="grid gap-8 py-4">
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg ${
                                    confirmModal.type === "delete" 
                                        ? "bg-rose-50 text-rose-600 shadow-rose-100" 
                                        : "bg-rose-50 text-rose-600 shadow-rose-100"
                                }`}>
                                    {confirmModal.type === "delete" ? (
                                        <Trash2 className="h-7 w-7" />
                                    ) : (
                                        <LogOut className="h-7 w-7" />
                                    )}
                                </div>
                                <button 
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                {confirmModal.type === "delete" ? "Delete Project?" : "Leave Project?"}
                            </h3>
                            <p className="text-slate-500 leading-relaxed">
                                {confirmModal.type === "delete" 
                                    ? `This will permanently remove "${confirmModal.projectName}" and all its tasks. This action cannot be undone.`
                                    : `Are you sure you want to leave "${confirmModal.projectName}"? You will lose access to all project data.`
                                }
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    className="px-6 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModal.type === "delete") {
                                            deleteProjectMutation.mutate(confirmModal.projectId!);
                                        } else {
                                            leaveProjectMutation.mutate(confirmModal.projectId!);
                                        }
                                    }}
                                    disabled={deleteProjectMutation.isPending || leaveProjectMutation.isPending}
                                    className={`px-6 py-3.5 text-sm font-bold text-white rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 ${
                                        confirmModal.type === "delete"
                                            ? "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                                            : "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                                    }`}
                                >
                                    {(deleteProjectMutation.isPending || leaveProjectMutation.isPending) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : confirmModal.type === "delete" ? (
                                        "Delete"
                                    ) : (
                                        "Leave"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <div className="space-y-1">
                    <p className="text-xs font-bold tracking-[0.24em] uppercase text-[#00008B]">Workspace</p>
                    <h1 className="page-title text-3xl sm:text-4xl font-bold">Projects</h1>
                </div>
                <p className="page-subtitle text-lg sm:text-xl max-w-2xl leading-relaxed mt-1">
                    Keep track of what your teams are building
                </p>
            </div>

            <div className="projects-toolbar">
                <div className="tab-group">
                    <button className="tab tab--active">
                        All Projects
                        <span className="tab-count">{projects.length} projects</span>
                    </button>
                </div>
                {!isLecturer && (
                    <button
                        onClick={() => navigate({ to: "/dashboard/project/create" })}
                        className="button button--primary"
                    >
                        <Plus className="h-4 w-4" />
                        New Project
                    </button>
                )}
            </div>

            {invitations.length > 0 && (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">You have {invitations.length} pending invitation{invitations.length > 1 ? 's' : ''}</p>
                            <p className="text-xs text-slate-500">Check your invitations to join new project teams.</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard/invitations/pending"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-50 transition-all hover:shadow-md shrink-0 w-full sm:w-auto text-center"
                    >
                        View Invitations
                    </Link>
                </div>
            )}

            {globalWarnings.length > 0 && (
                <div className={`rounded-2xl border shadow-sm overflow-hidden animate-in fade-in slide-in-from-top-4 ${
                    globalWarnings.some(w => w.type === 'H-1' || w.type === 'OVERDUE')
                        ? 'bg-red-50 border-red-200'
                        : globalWarnings.some(w => w.type === 'H-2')
                        ? 'bg-orange-50 border-orange-200'
                        : 'bg-yellow-50 border-yellow-200'
                }`}>
                    {/* Summary header — always visible */}
                    <button
                        type="button"
                        onClick={() => setAlertExpanded(v => !v)}
                        className="w-full flex items-center justify-between gap-4 p-4 text-left"
                    >
                        <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center shadow-sm ${
                                globalWarnings.some(w => w.type === 'H-1' || w.type === 'OVERDUE')
                                    ? 'bg-red-600 text-white'
                                    : globalWarnings.some(w => w.type === 'H-2')
                                    ? 'bg-orange-500 text-white'
                                    : 'bg-yellow-500 text-white'
                            }`}>
                                <AlertCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <p className={`text-sm font-bold ${
                                    globalWarnings.some(w => w.type === 'H-1' || w.type === 'OVERDUE') ? 'text-red-900' :
                                    globalWarnings.some(w => w.type === 'H-2') ? 'text-orange-900' : 'text-yellow-900'
                                }`}>
                                    Actions Required — {globalWarnings.length} project{globalWarnings.length > 1 ? 's' : ''} need{globalWarnings.length === 1 ? 's' : ''} your attention
                                </p>
                                <p className={`text-xs ${
                                    globalWarnings.some(w => w.type === 'H-1' || w.type === 'OVERDUE') ? 'text-red-600' :
                                    globalWarnings.some(w => w.type === 'H-2') ? 'text-orange-600' : 'text-yellow-700'
                                }`}>
                                    You have unfinished tasks with approaching deadlines.
                                </p>
                            </div>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border bg-white shrink-0 transition-all ${
                            globalWarnings.some(w => w.type === 'H-1' || w.type === 'OVERDUE') ? 'text-red-700 border-red-100' :
                            globalWarnings.some(w => w.type === 'H-2') ? 'text-orange-700 border-orange-100' : 'text-yellow-700 border-yellow-100'
                        }`}>
                            {alertExpanded ? 'Hide ▲' : 'Show ▼'}
                        </span>
                    </button>

                    {/* Expandable project list */}
                    {alertExpanded && (
                        <div className="border-t border-inherit divide-y divide-inherit">
                            {globalWarnings.map((warning, i) => (
                                <div
                                    key={`${warning.projectId}-${i}`}
                                    className="flex items-center justify-between gap-4 px-4 py-3"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className={`shrink-0 h-2 w-2 rounded-full ${
                                            warning.type === 'H-3' ? 'bg-yellow-500' :
                                            warning.type === 'H-2' ? 'bg-orange-500' :
                                            'bg-red-600'
                                        }`} />
                                        <div className="min-w-0">
                                            <p className={`text-sm font-semibold truncate ${
                                                warning.type === 'H-3' ? 'text-yellow-900' :
                                                warning.type === 'H-2' ? 'text-orange-900' : 'text-red-900'
                                            }`}>
                                                {warning.projectName}
                                            </p>
                                            <p className={`text-xs ${
                                                warning.type === 'H-3' ? 'text-yellow-700' :
                                                warning.type === 'H-2' ? 'text-orange-700' : 'text-red-700'
                                            }`}>
                                                {warning.type === 'OVERDUE' ? 'Deadline passed — complete tasks immediately' :
                                                 warning.type === 'H-1' ? 'Due tomorrow — update your tasks now' :
                                                 `Deadline in ${warning.type === 'H-2' ? '2' : '3'} days — update your tasks`}
                                            </p>
                                        </div>
                                    </div>
                                    <Link
                                        to="/dashboard/project/$projectId"
                                        params={{ projectId: warning.projectId }}
                                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border bg-white shrink-0 transition-all hover:shadow-sm ${
                                            warning.type === 'H-3' ? 'text-yellow-700 border-yellow-100 hover:text-yellow-800' :
                                            warning.type === 'H-2' ? 'text-orange-700 border-orange-100 hover:text-orange-800' :
                                            'text-red-700 border-red-100 hover:text-red-800'
                                        }`}
                                    >
                                        Go →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <div className="projects-divider" />

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
                </div>
            ) : projects.length === 0 ? (
                <div className="empty-state flex flex-col items-center justify-center py-24 rounded-[3rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                    <div className="h-24 w-24 rounded-3xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-6 shadow-sm">
                        <Users className="h-12 w-12 text-indigo-600" />
                    </div>
                    <p className="text-xl font-bold text-slate-900 mb-2 text-center">No projects yet</p>
                    <p className="text-slate-500 text-center max-w-sm mb-0">
                        {!isLecturer 
                            ? "Get started by creating a new project from the button above." 
                            : "No projects have been created in this workspace yet."}
                    </p>
                </div>
            ) : (
                <div className="project-grid">
                    {projects.map((project) => {
                        const isLeader = project.leaderId === userId;
                        const progress = calculateProgress(project.tasks);
                        
                        return (
                            <div
                                key={project.id}
                                className="project-card group flex flex-col p-0 overflow-hidden"
                            >
                                <div className="flex items-start justify-between gap-4 p-6 pb-0">
                                    <button
                                        onClick={() => navigate({ 
                                            to: "/dashboard/project/$projectId", 
                                            params: { projectId: project.id } 
                                        })}
                                        className="project-card__title group-hover:text-indigo-600 transition-colors text-left flex-1 flex items-center gap-2"
                                    >
                                        <span className="truncate">{project.name}</span>
                                        {projectWarnings[project.id] && (
                                            <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm ${
                                                projectWarnings[project.id] === 'H-3' ? 'bg-yellow-100 text-yellow-700' :
                                                projectWarnings[project.id] === 'H-2' ? 'bg-orange-100 text-orange-700' :
                                                'bg-red-100 text-red-700 animate-pulse'
                                            }`}>
                                                {projectWarnings[project.id] === 'OVERDUE' ? 'OVERDUE' : projectWarnings[project.id]}
                                            </span>
                                        )}
                                    </button>
                                    <div className="shrink-0">
                                        {isLeader ? (
                                            <KebabMenu
                                                project={project}
                                                isLeader={true}
                                                onEdit={() =>
                                                    navigate({
                                                        to: "/dashboard/project/edit",
                                                        search: { id: project.id },
                                                    })
                                                }
                                                onDelete={() => handleDelete(project.id, project.name)}
                                                onLeave={() => handleLeave(project.id, project.name)}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="button button--leave button--compact"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleLeave(project.id, project.name);
                                                }}
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Leave
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div
                                    onClick={() => navigate({ 
                                        to: "/dashboard/project/$projectId", 
                                        params: { projectId: project.id } 
                                    })}
                                    className="flex-1 flex flex-col p-6 pt-2 cursor-pointer"
                                >
                                    <p className="project-card__description line-clamp-2">
                                        {project.description || "No description yet."}
                                    </p>

                                    <div className="card-role-row">
                                        <span className="role-label">Your Role:</span>
                                        <span className={`role-badge role-badge--${isLeader ? "leader" : isLecturer ? "lecturer" : "member"}`}>
                                            {isLeader ? "LEADER" : isLecturer ? "LECTURER" : "MEMBER"}
                                        </span>
                                    </div>

                                    <div className="card-meta">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="h-3.5 w-3.5" />
                                            <span>{project.members?.filter(m => m.role !== 'LECTURER').length || 0} members</span>
                                        </div>
                                        {project.endDate && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5" />
                                                <span>
                                                    {new Date(project.endDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="progress-section mt-auto">
                                        <div className="progress-header">
                                            <span>Progress</span>
                                            <span>{progress}%</span>
                                        </div>
                                        <div className="progress-track">
                                            <div
                                                className="progress-fill !bg-indigo-700"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

