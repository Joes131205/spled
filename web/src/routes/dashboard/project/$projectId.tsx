import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, Plus, Edit2 } from "lucide-react";

const MOCK_PROJECTS_MAP: { [key: string]: any } = {
    "1": {
        id: "1",
        name: "Website Redesign",
        description: "Complete redesign of the company website",
        endDate: "2026-06-15",
        createdAt: "2026-05-01",
    },
    "2": {
        id: "2",
        name: "Mobile App",
        description: "Launch iOS and Android mobile applications",
        endDate: "2026-07-30",
        createdAt: "2026-04-15",
    },
};

const MOCK_TASKS = [
    {
        id: "1",
        title: "Design homepage",
        description: "Create mockups for the homepage",
        weight: "MEDIUM",
        status: "IN_PROGRESS",
        projectId: "1",
    },
    {
        id: "2",
        title: "Set up database",
        description: "Configure PostgreSQL for the app",
        weight: "HARD",
        status: "TODO",
        projectId: "1",
    },
    {
        id: "3",
        title: "API integration",
        description: "Connect frontend to backend services",
        weight: "HARD",
        status: "TODO",
        projectId: "1",
    },
];

export const Route = createFileRoute("/dashboard/project/$projectId")({
    component: RouteComponent,
});

function RouteComponent() {
    const { projectId } = Route.useParams();
    const navigate = useNavigate();
    const project = MOCK_PROJECTS_MAP[projectId];
    const [tasks, setTasks] = useState(
        MOCK_TASKS.filter((t) => t.projectId === projectId),
    );

    const handleDeleteTask = (taskId: string) => {
        if (!confirm("Delete this task?")) return;
        setTasks(tasks.filter((t) => t.id !== taskId));
    };

    if (!project) {
        return (
            <div className="surface">
                <div className="empty-state text-red-700">
                    Project not found
                </div>
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="back-link w-fit"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Projects
            </button>

            <div className="surface">
                <div className="surface__body">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <p className="kicker">Project</p>
                            <h1 className="page-title">{project.name}</h1>
                            <p className="page-subtitle mt-3">
                                {project.description}
                            </p>
                        </div>

                        <Link
                            to="/dashboard/project/$projectId/edit"
                            params={{ projectId }}
                            className="button button--ghost"
                        >
                            <Edit2 className="h-4 w-4" />
                            Edit project
                        </Link>
                    </div>
                </div>
            </div>

            <div className="surface">
                <div className="surface__header flex items-center justify-between gap-4">
                    <div>
                        <p className="kicker mb-1">Tasks</p>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Task board
                        </h2>
                    </div>
                    <Link
                        to="/dashboard/task/create"
                        search={{ projectId }}
                        className="button button--primary"
                    >
                        <Plus className="h-5 w-5" />
                        Add task
                    </Link>
                </div>

                {tasks.length === 0 ? (
                    <div className="empty-state">
                        No tasks yet. Create one to get started.
                    </div>
                ) : (
                    <div className="table-wrap">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Weight</th>
                                    <th>Status</th>
                                    <th>Assigned to</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tasks.map((task) => (
                                    <tr key={task.id}>
                                        <td className="font-medium text-slate-900">
                                            {task.title}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${
                                                    task.weight === "EASY"
                                                        ? "badge--success"
                                                        : task.weight ===
                                                            "MEDIUM"
                                                          ? "badge--warning"
                                                          : "badge--danger"
                                                }`}
                                            >
                                                {task.weight}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`badge ${task.status === "DONE" ? "badge--success" : task.status === "IN_PROGRESS" ? "badge--project" : "badge--neutral"}`}
                                            >
                                                {task.status}
                                            </span>
                                        </td>
                                        <td className="text-slate-600">
                                            {task.status || "Unassigned"}
                                        </td>
                                        <td>
                                            <button
                                                onClick={() =>
                                                    handleDeleteTask(task.id)
                                                }
                                                className="button button--ghost button--compact"
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
