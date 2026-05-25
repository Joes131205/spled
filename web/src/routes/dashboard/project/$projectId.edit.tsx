import {
    createFileRoute,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2, Save, Trash2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/project/$projectId/edit")({
    component: RouteComponent,
});

function RouteComponent() {
    const { projectId } = useParams({
        from: "/dashboard/project/$projectId/edit",
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userId = isMounted && typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    const { data: project, isLoading } = useQuery({
        queryKey: ["projects", projectId],
        queryFn: async () => {
            const response = await projectApi.get(`/projects/${projectId}`);
            return response.data;
        },
        enabled: !!projectId,
    });

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        endDate: "",
    });

    const [error, setError] = useState("");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
            await projectApi.patch(`/projects/${projectId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
            navigate({ to: "/dashboard" });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Failed to update project");
        },
    });

    const deleteProjectMutation = useMutation({
        mutationFn: async () => {
            await projectApi.delete(`/projects/${projectId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            navigate({ to: "/dashboard" });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Failed to delete project");
        }
    });

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

        if (!formData.name.trim()) {
            setError("Project name is required");
            return;
        }

        updateProjectMutation.mutate({
            ...formData,
            leaderId: project.leaderId,
        });
    };

    const handleDelete = () => {
        deleteProjectMutation.mutate();
    };

    if (isLoading) {
        return (
            <div className="flex min-h-[85vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (!project) {
        return (
            <div className="flex min-h-[85vh] items-center justify-center p-6 text-center">
                <div className="surface max-w-md p-10">
                    <p className="text-rose-600 font-bold mb-4">Project not found</p>
                    <button
                        onClick={() => navigate({ to: "/dashboard" })}
                        className="button button--secondary"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    if (project.leaderId !== userId && isMounted) {
        return (
            <div className="flex min-h-[85vh] items-center justify-center p-6 text-center">
                <div className="surface max-w-md p-10">
                    <p className="text-rose-600 font-bold mb-4">Unauthorized Access</p>
                    <p className="text-slate-500 text-sm mb-6">Only the project leader can edit this project.</p>
                    <button
                        onClick={() => navigate({ to: "/dashboard" })}
                        className="button button--secondary"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const submitting = updateProjectMutation.isPending;
    const deleting = deleteProjectMutation.isPending;

    return (
        <div className="flex min-h-[85vh] items-center justify-center p-6">
            <div className="surface w-full max-w-4xl shadow-xl">
                <div className="surface__body p-8 sm:p-10">
                    <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div>
                            <p className="kicker mb-1.5 text-xs font-semibold">Settings</p>
                            <h1 className="text-3xl font-bold text-slate-900">
                                Edit project
                            </h1>
                            <p className="text-slate-500 mt-1">
                                Update the project details and settings.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="alert alert--error mb-6 py-4 px-5">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm leading-6">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid gap-8">
                        <div className="grid gap-6">
                            <div className="field">
                                <label className="label text-base font-semibold mb-1.5">Project name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Project name"
                                    className="input text-sm py-3 px-5"
                                    required
                                />
                                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tight">Minimum 4 characters</p>
                            </div>

                            <div className="field">
                                <label className="label text-base font-semibold mb-1.5">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Brief project description"
                                    rows={3}
                                    className="textarea text-sm py-3 px-5"
                                />
                            </div>

                            <div className="field">
                                <label className="label text-base font-semibold mb-1.5">Deadline *</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className="input text-sm py-3 px-5"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="button button--primary px-8 py-3 text-base rounded-2xl flex-1 sm:flex-none"
                                >
                                    {submitting ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Save className="h-5 w-5" />
                                    )}
                                    {submitting ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate({ to: "/dashboard" })}
                                    className="button button--secondary px-8 py-3 text-base rounded-2xl flex-1 sm:flex-none"
                                >
                                    Cancel
                                </button>
                            </div>

                            <div className="w-full sm:w-auto">
                                {!showDeleteConfirm ? (
                                    <button
                                        type="button"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="button button--ghost text-rose-600 hover:bg-rose-50 hover:text-rose-700 px-6 py-3 rounded-2xl w-full sm:w-auto"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Project
                                    </button>
                                ) : (
                                    <div className="flex items-center gap-2 bg-rose-50 border border-rose-100 p-2 rounded-2xl animate-in fade-in slide-in-from-right-4">
                                        <p className="text-xs font-bold text-rose-700 px-3">Confirm delete?</p>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            disabled={deleting}
                                            className="h-9 px-4 rounded-xl bg-rose-600 text-white text-xs font-bold hover:bg-rose-700 transition-colors disabled:opacity-50"
                                        >
                                            {deleting ? "..." : "Delete"}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="h-9 w-9 flex items-center justify-center rounded-xl bg-white text-slate-400 border border-slate-200 hover:text-slate-600 transition-colors"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
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
