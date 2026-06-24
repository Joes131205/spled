import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Calendar, MoreVertical, Plus, Trash2, Edit2, LogOut, Users, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../utils/api";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

interface Project {
    id: string;
    name: string;
    description: string | null;
    leaderId: string;
    endDate: string | null;
    createdAt: string;
    members: { id: string; userId: string; role: string }[];
    tasks: { id: string; status: string; progress: number }[];
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

    if (!userId && isMounted) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[90vh] text-center px-6 py-20">
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <div 
                        className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full opacity-20"
                        style={{ background: "radial-gradient(circle, #4f46e5 0%, transparent 70%)", filter: "blur(100px)" }}
                    />
                    <div 
                        className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full opacity-10"
                        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)", filter: "blur(100px)" }}
                    />
                </div>

                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-1.5 text-sm font-semibold text-indigo-700 backdrop-blur-sm">
                    <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    Revolutionizing Group Projects
                </div>

                <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl mb-8 leading-[1.1] font-serif">
                    Fair group projects, <br />
                    <span className="text-slate-400 italic">without the stress.</span>
                </h1>

                <p className="max-w-2xl text-lg leading-relaxed text-slate-300 mb-12">
                    Spled helps teams track contributions, manage tasks, and ensure everyone 
                    carries their weight. Built for students who want fair grades and clear accountability.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <button
                        onClick={() => navigate({ to: "/login" })}
                        className="button button--primary px-10 py-4 text-lg rounded-2xl shadow-2xl shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95"
                    >
                        Get Started
                        <Plus className="h-5 w-5" />
                    </button>
                    <Link
                        to="/signup"
                        className="button button--secondary bg-white/5 border-white/10 text-white hover:bg-white/10 px-10 py-4 text-lg rounded-2xl backdrop-blur-md transition-all"
                    >
                        Create Account
                    </Link>
                </div>

                <div className="mt-24 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl w-full">
                    {[
                        { title: "Task Management", desc: "Easily split and assign tasks to members." },
                        { title: "Evidence Tracking", desc: "Upload proof of work for every contribution." },
                        { title: "Ghost Detection", desc: "Monitor activity and flag inactive members." }
                    ].map((feature) => (
                        <div key={feature.title} className="p-8 rounded-[2rem] border border-white/5 bg-white/5 backdrop-blur-sm text-left hover:border-white/10 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                            <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const userRole = isMounted && typeof window !== "undefined" ? localStorage.getItem("role") || "MEMBER" : "MEMBER";
    const isLecturer = userRole === "LECTURER";

    const { data: projects = [], isLoading } = useQuery<Project[]>({
        queryKey: ["projects"],
        queryFn: async () => {
            const response = await projectApi.get("/projects/my");
            return response.data;
        },
        enabled: !!userId,
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await projectApi.delete(`/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        deleteMutation.mutate(id);
    };

    const handleLeave = (id: string) => {
        if (!confirm("Are you sure you want to leave this project?")) return;
        alert("Leave functionality coming soon!");
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 text-slate-500">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                <p className="font-medium">Loading projects...</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4">
            <div className="flex flex-col gap-2">
                <div className="space-y-1">
                    <p className="kicker">Workspace</p>
                    <h1 className="page-title -ml-0.5">Projects</h1>
                </div>
                <p className="page-subtitle mt-1">
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

            <div className="projects-divider" />

            {projects.length === 0 && (
                <div className="empty-state">
                    <p className="mb-4">No projects yet</p>
                    {!isLecturer && (
                        <button
                            onClick={() => navigate({ to: "/dashboard/project/create" })}
                            className="button button--primary"
                        >
                            <Plus className="h-4 w-4" />
                            Create your first project
                        </button>
                    )}
                </div>
            )}

            {projects.length > 0 && (
                <div className="project-grid">
                    {projects.map((project) => {
                        const isLeader = project.leaderId === userId;
                        const role = isLeader ? "LEADER" : "MEMBER";
                        const memberCount = project.members.length;
                        const progress = project.tasks && project.tasks.length > 0 
                            ? Math.round(project.tasks.reduce((acc, t) => acc + (t.status === "DONE" ? 100 : 0), 0) / project.tasks.length)
                            : 0;

                        return (
                            <div
                                key={project.id}
                                className="project-card group flex flex-col"
                            >
                                <div className="flex items-start justify-between gap-4 mb-3">
                                    <Link
                                        to="/dashboard/project/$projectId"
                                        params={{ projectId: project.id }}
                                        className="project-card__title group-hover:text-indigo-600 transition-colors flex-1"
                                    >
                                        {project.name}
                                    </Link>
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
                                                onDelete={() => handleDelete(project.id)}
                                                onLeave={() => handleLeave(project.id)}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="button button--leave button--compact"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleLeave(project.id);
                                                }}
                                            >
                                                <LogOut className="h-3.5 w-3.5" />
                                                Leave
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <Link
                                    to="/dashboard/project/$projectId"
                                    params={{ projectId: project.id }}
                                    className="flex-1 flex flex-col"
                                >
                                    <p className="project-card__description line-clamp-2">
                                        {project.description || "No description yet."}
                                    </p>

                                    <div className="card-role-row">
                                        <span className="role-label">Your Role:</span>
                                        <span className={`role-badge role-badge--${role.toLowerCase()}`}>
                                            {role}
                                        </span>
                                    </div>

                                    <div className="card-meta">
                                        <div className="flex items-center gap-1.5">
                                            <span className="flex items-center gap-1.5">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{project.members?.filter(m => m.role !== 'LECTURER').length || 0} members</span>
                                            </span>
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
                                                className="progress-fill"
                                                style={{ width: `${progress}%` }}
                                            />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
