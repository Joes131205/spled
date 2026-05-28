import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { projectApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/task/create-new")({
    component: RouteComponent,
    validateSearch: (search: Record<string, any>) => ({
        projectId: typeof search.projectId === "string" ? search.projectId : "",
    }),
});

function RouteComponent() {
    const { projectId } = Route.useSearch();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        weight: "MEDIUM",
        deadline: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Task name is required");
            return;
        }

        setLoading(true);
        try {
            await projectApi.post("/tasks", {
                projectId,
                name: formData.name,
                description: formData.description,
                weight: formData.weight,
                deadline: formData.deadline || undefined,
            });
            navigate({ to: `/dashboard/project/${projectId}` });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create task");
            setLoading(false);
        }
    };

    return (
        <div className="grid gap-6">
            <button
                onClick={() =>
                    navigate({
                        to: "/dashboard/project/$projectId",
                        params: { projectId },
                    })
                }
                className="back-link w-fit"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Project
            </button>

            <div className="surface">
                <div className="surface__body max-w-2xl">
                    <p className="kicker">Task</p>
                    <h1 className="page-title">Create new task</h1>
                    <p className="page-subtitle mt-3">
                        Assign work to a teammate and keep the project moving.
                    </p>

                    {error && (
                        <div className="alert alert--error mt-6">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm leading-6">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
                        <div className="field">
                            <label className="label">Task name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g., Design homepage mockup"
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe what needs to be done"
                                rows={4}
                                className="textarea"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="field">
                                <label className="label">Weight</label>
                                <select
                                    name="weight"
                                    value={formData.weight}
                                    onChange={handleChange}
                                    className="select"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>

                            <div className="field">
                                <label className="label">Deadline</label>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    className="input"
                                />
                            </div>
                        </div>

                        <div className="split-actions pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="button button--primary"
                            >
                                {loading ? "Creating..." : "Create task"}
                            </button>
                            <button
                                type="button"
                                onClick={() =>
                                    navigate({
                                        to: "/dashboard/project/$projectId",
                                        params: { projectId },
                                    })
                                }
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
