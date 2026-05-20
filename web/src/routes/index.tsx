import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { Calendar, MoreVertical, Plus, Trash2, Edit2, LogOut, Users } from "lucide-react";

export const Route = createFileRoute("/")({
    component: RouteComponent,
});

const MOCK_PROJECTS = [
    {
        id: "1",
        name: "Mobile App",
        description: "Launch a to-do list for iOS and Android mobile applications",
        endDate: "2026-07-30",
        createdAt: "2026-04-15",
        memberCount: 3,
        role: "LEADER" as const,
        progress: 15,
    },
    {
        id: "2",
        name: "Website Redesign",
        description: "Complete redesign of the company website",
        endDate: "2026-06-15",
        createdAt: "2026-05-01",
        memberCount: 3,
        role: "MEMBER" as const,
        progress: 40,
    },
];

type Project = (typeof MOCK_PROJECTS)[number];

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
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const navigate = useNavigate();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userRole =
        isMounted && typeof window !== "undefined"
            ? localStorage.getItem("role") || "MEMBER"
            : "MEMBER";
    const isLecturer = userRole === "LECTURER";

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        setProjects(projects.filter((p) => p.id !== id));
    };

    const handleLeave = (id: string) => {
        if (!confirm("Are you sure you want to leave this project?")) return;
        setProjects(projects.filter((p) => p.id !== id));
    };

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
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to="/dashboard/project/$projectId"
                            params={{ projectId: project.id }}
                            className="project-card"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <h3 className="project-card__title">{project.name}</h3>
                                {project.role === "LEADER" ? (
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

                            <p className="project-card__description line-clamp-2">
                                {project.description || "No description yet."}
                            </p>

                            <div className="card-role-row">
                                <span className="role-label">Your Role:</span>
                                <span className={`role-badge role-badge--${project.role.toLowerCase()}`}>
                                    {project.role}
                                </span>
                            </div>

                            <div className="card-meta">
                                <div className="flex items-center gap-1.5">
                                    <span className="flex items-center gap-1.5">
                                        <Users className="h-3.5 w-3.5" />
                                        <span>{project.memberCount} members</span>
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

                            <div className="progress-section">
                                <div className="progress-header">
                                    <span>Progress</span>
                                    <span>{project.progress}%</span>
                                </div>
                                <div className="progress-track">
                                    <div
                                        className="progress-fill"
                                        style={{ width: `${project.progress}%` }}
                                    />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}