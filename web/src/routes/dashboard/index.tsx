import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Calendar, Edit2, Plus, Trash2, Users } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
    component: RouteComponent,
});

const MOCK_PROJECTS = [
    {
        id: "1",
        name: "Website Redesign",
        description: "Complete redesign of the company website",
        endDate: "2026-06-15",
        createdAt: "2026-05-01",
        taskCount: 8,
    },
    {
        id: "2",
        name: "Mobile App",
        description: "Launch iOS and Android mobile applications",
        endDate: "2026-07-30",
        createdAt: "2026-04-15",
        taskCount: 12,
    },
];

function RouteComponent() {
    const [projects, setProjects] = useState(MOCK_PROJECTS);
    const navigate = useNavigate();

    const handleDelete = (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        setProjects(projects.filter((p) => p.id !== id));
    };

    return (
        <div className="grid gap-6">
            <div className="page-header">
                <div>
                    <p className="kicker">Workspace</p>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">
                        Keep track of what the team is building and who owns the
                        next step.
                    </p>
                </div>
                <button
                    onClick={() =>
                        navigate({ to: "/dashboard/project/create" })
                    }
                    className="button button--primary"
                >
                    <Plus className="h-5 w-5" />
                    New Project
                </button>
            </div>

            {projects.length === 0 && (
                <div className="surface">
                    <div className="empty-state">
                        <p className="mb-4">No projects yet</p>
                        <button
                            onClick={() =>
                                navigate({ to: "/dashboard/project/create" })
                            }
                            className="button button--primary"
                        >
                            <Plus className="h-5 w-5" />
                            Create your first project
                        </button>
                    </div>
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
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="badge badge--project mb-3">
                                        Project
                                    </p>
                                    <h3 className="project-card__title">
                                        {project.name}
                                    </h3>
                                </div>
                                <div className="brand-mark shrink-0 h-11 w-11">
                                    <Users className="h-5 w-5" />
                                </div>
                            </div>

                            <p className="project-card__description line-clamp-3">
                                {project.description || "No description yet."}
                            </p>

                            <div className="card-meta">
                                <div className="flex items-center gap-1.5">
                                    <Users className="h-4 w-4" />
                                    <span>Leader</span>
                                </div>
                                {project.endDate && (
                                    <div className="flex items-center gap-1.5">
                                        <Calendar className="h-4 w-4" />
                                        <span>
                                            {new Date(
                                                project.endDate,
                                            ).toLocaleDateString()}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="split-actions">
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        navigate({
                                            to: "/dashboard/project/$projectId/edit",
                                            params: { projectId: project.id },
                                        });
                                    }}
                                    className="button button--ghost button--compact"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    Edit
                                </button>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        handleDelete(project.id);
                                    }}
                                    className="button button--danger button--compact"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
