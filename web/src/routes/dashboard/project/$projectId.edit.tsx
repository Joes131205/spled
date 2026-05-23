import {
    createFileRoute,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
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
    const userId = typeof window !== "undefined" ? localStorage.getItem("userId") : null;

    const { data: project, isLoading } = useQuery({
        queryKey: ["projects", projectId],
        queryFn: async () => {
            const response = await projectApi.get(`/projects/${projectId}`);
            return response.data;
        },
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
            await projectApi.patch(`/projects/${projectId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
            navigate({ to: "/dashboard" });
        },
    });

    const [error, setError] = useState("");

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

        updateProjectMutation.mutate(formData);
    };

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
                    Project not found
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

                    <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
                        <div className="field">
                            <label className="label">Project name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
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
                    </form>
                </div>
            </div>
        </div>
    );
}

