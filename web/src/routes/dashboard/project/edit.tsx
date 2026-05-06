import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Trash2 } from "lucide-react";

const MOCK_PROJECTS_MAP: { [key: string]: any } = {
    "1": {
        id: "1",
        name: "Website Redesign",
        description: "Complete redesign of the company website",
        endDate: "2026-06-15",
    },
    "2": {
        id: "2",
        name: "Mobile App",
        description: "Launch iOS and Android mobile applications",
        endDate: "2026-07-30",
    },
};

export const Route = createFileRoute("/dashboard/project/edit")({
    component: RouteComponent,
    validateSearch: (search: Record<string, any>) => ({
        id: typeof search.id === "string" ? search.id : "",
    }),
});

function RouteComponent() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [endDate, setEndDate] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();
    const { id } = Route.useSearch();
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (role !== "LEADER") {
            navigate({ to: "/dashboard" });
            return;
        }

        if (!id) {
            setError("Missing project id.");
            return;
        }

        const mockProject = MOCK_PROJECTS_MAP[id];
        if (mockProject) {
            setName(mockProject.name || "");
            setDescription(mockProject.description || "");
            setEndDate(
                mockProject.endDate
                    ? new Date(mockProject.endDate).toISOString().split("T")[0]
                    : "",
            );
        }
    }, [id, navigate, role]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!id) {
            setError("Missing project id.");
            return;
        }
        if (name.length < 3) {
            setError("Project name must be at least 3 characters");
            return;
        }

        setSubmitting(true);
        setTimeout(() => {
            navigate({ to: "/dashboard" });
        }, 300);
    };

    const handleDelete = () => {
        if (!id) {
            setError("Missing project id.");
            return;
        }

        setDeleting(true);
        setTimeout(() => {
            navigate({ to: "/dashboard" });
        }, 300);
    };

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
                <div className="surface__body max-w-2xl">
                    <p className="kicker">Project</p>
                    <h1 className="page-title">Edit project</h1>
                    <p className="page-subtitle mt-3">
                        Update the details the team sees in the workspace.
                    </p>

                    {error && (
                        <div className="alert alert--error mt-6">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm leading-6">{error}</p>
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 grid gap-5"
                        noValidate
                    >
                        <div className="field">
                            <label className="label">Project name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Project name"
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Project description"
                                rows={4}
                                className="textarea"
                            />
                        </div>

                        <div className="field">
                            <label className="label">End date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input"
                            />
                        </div>

                        <div className="split-actions pt-2">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="button button--primary"
                            >
                                {submitting ? "Saving..." : "Save changes"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/dashboard" })}
                                className="button button--secondary"
                            >
                                Cancel
                            </button>
                        </div>

                        <div className="surface mt-2">
                            <div className="surface__body">
                                <p className="kicker">Danger zone</p>
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowDeleteConfirm(true)
                                        }
                                        className="button button--danger w-full"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete project
                                    </button>
                                ) : (
                                    <div className="grid gap-3">
                                        <p className="text-sm text-rose-700">
                                            Are you sure? This action cannot be
                                            undone.
                                        </p>
                                        <div className="split-actions">
                                            <button
                                                type="button"
                                                onClick={handleDelete}
                                                disabled={deleting}
                                                className="button button--danger"
                                            >
                                                {deleting
                                                    ? "Deleting..."
                                                    : "Yes, delete"}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setShowDeleteConfirm(false)
                                                }
                                                className="button button--ghost"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
