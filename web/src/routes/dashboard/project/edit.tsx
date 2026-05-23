import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Trash2, Loader2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/project/edit")({
    component: RouteComponent,
    validateSearch: (search: Record<string, any>) => ({
        id: typeof search.id === "string" ? search.id : "",
    }),
});

function RouteComponent() {
    const { id } = Route.useSearch();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    const { data: project, isLoading } = useQuery({
        queryKey: ["projects", id],
        queryFn: async () => {
            const response = await projectApi.get(`/projects/${id}`);
            return response.data;
        },
        enabled: !!id,
    });

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        endDate: "",
    });

    useEffect(() => {
        if (project) {
            setFormData({
                name: project.name || "",
                description: project.description || "",
                endDate: project.endDate
                    ? new Date(project.endDate).toISOString().split("T")[0]
                    : "",
            });
        }
    }, [project]);

    const updateProjectMutation = useMutation({
        mutationFn: async (data: any) => {
            await projectApi.patch(`/projects/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", id] });
            navigate({ to: "/dashboard" });
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async () => {
            await projectApi.delete(`/projects/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            navigate({ to: "/dashboard" });
        },
    });

    const [error, setError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!id) {
            setError("Missing project id.");
            return;
        }
        if (!formData.name.trim()) {
            setError("Project name is required");
            return;
        }

        updateProjectMutation.mutate(formData);
    };

    const handleDelete = () => {
        if (!id) {
            setError("Missing project id.");
            return;
        }
        deleteProjectMutation.mutate();
    };

    if (!id) {
        return (
            <div className="surface">
                <div className="empty-state text-red-700">
                    Missing project ID.
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="surface">
                <div className="empty-state text-red-700">
                    Project not found.
                </div>
            </div>
        );
    }

    if (project.leaderId !== userId) {
        return (
            <div className="surface">
                <div className="empty-state text-red-700">
                    Only the project leader can edit this project.
                </div>
            </div>
        );
    }

    const submitting = updateProjectMutation.isPending;
    const deleting = deleteProjectMutation.isPending;

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
                    >
                        <div className="field">
                            <label className="label">Project name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Project name"
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Project description"
                                rows={4}
                                className="textarea"
                            />
                        </div>

                        <div className="field">
                            <label className="label">End date</label>
                            <input
                                type="date"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
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

