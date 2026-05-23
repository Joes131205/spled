import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Calendar, MoreVertical, Plus, Trash2, Edit2, LogOut, Users, Loader2, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../../utils/api";

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
    members: { userId: string }[];
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
                        <button
                            className="dropdown-item"
                            onClick={(e) => {
                                e.preventDefault();
                                setOpen(false);
                                onEdit();
                            }}
                        >
                            <Edit2 className="h-3.5 w-3.5" />
                            Edit
                        </button>
                    )}
                    {isLeader && (
                        <button
                            className="dropdown-item dropdown-item--danger"
                            onClick={(e) => {
                                e.preventDefault();
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
        },
    });

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        deleteProjectMutation.mutate(id);
    };

    const leaveProjectMutation = useMutation({
        mutationFn: async (projectId: string) => {
            await projectApi.delete(`/projects/${projectId}/leave`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || err.message;
            alert(`Failed to leave project: ${msg}`);
        }
    });

    const handleLeave = (id: string) => {
        if (!confirm("Are you sure you want to leave this project?")) return;
        leaveProjectMutation.mutate(id);
    };

    const calculateProgress = (tasks: any[]) => {
        if (!tasks || tasks.length === 0) return 0;
        const doneTasks = tasks.filter(t => t.status === "DONE").length;
        return Math.round((doneTasks / tasks.length) * 100);
    };

    return (
        <div className="grid gap-8 py-4">
            {/* Page header */}
            <div className="flex flex-col gap-2">
                <div className="space-y-1">
                    <p className="text-xs font-bold tracking-[0.24em] uppercase text-[#00008B]">Workspace</p>
                    <h1 className="page-title text-4xl font-bold">Projects</h1>
                </div>
                <p className="page-subtitle text-xl max-w-2xl leading-relaxed mt-1">
                    Keep track of what your teams are building
                </p>
            </div>

            {/* Toolbar row */}
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
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                            <Mail className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">You have {invitations.length} pending invitation{invitations.length > 1 ? 's' : ''}</p>
                            <p className="text-xs text-slate-500">Check your invitations to join new project teams.</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard/invitations/pending"
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-white px-4 py-2 rounded-lg shadow-sm border border-indigo-50 transition-all hover:shadow-md"
                    >
                        View Invitations
                    </Link>
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
                            <Link
                                key={project.id}
                                to="/dashboard/project/$projectId"
                                params={{ projectId: project.id }}
                                className="project-card"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <h3 className="project-card__title">{project.name}</h3>
                                    {isLeader ? (
                                        <KebabMenu
                                            project={project}
                                            isLeader={true}
                                            onEdit={() =>
                                                navigate({
                                                    to: "/dashboard/project/$projectId/edit",
                                                    params: { projectId: project.id },
                                                })
                                            }
                                            onDelete={() => handleDelete(project.id)}
                                            onLeave={() => handleLeave(project.id)}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            className="button button--leave button--compact"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleLeave(project.id);
                                            }}
                                        >
                                            <LogOut className="h-3.5 w-3.5" />
                                            Leave
                                        </button>
                                    )}
                                </div>

                                {/* Title + description */}
                                <p className="project-card__description line-clamp-2">
                                    {project.description || "No description yet."}
                                </p>

                                {/* Role */}
                                <div className="card-role-row">
                                    <span className="role-label">Your Role:</span>
                                    <span className={`role-badge role-badge--${isLeader ? "leader" : isLecturer ? "lecturer" : "member"}`}>
                                        {isLeader ? "LEADER" : isLecturer ? "LECTURER" : "MEMBER"}
                                    </span>
                                </div>

                                {/* Meta row */}
                                <div className="card-meta">
                                    <div className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{project.members?.length || 0} members</span>
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

                                {/* Progress bar */}
                                <div className="progress-section">
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
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

