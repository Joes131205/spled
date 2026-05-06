import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/project/create")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        endDate: "",
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

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

        setLoading(true);
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
                    <h1 className="page-title">Create new project</h1>
                    <p className="page-subtitle mt-3">
                        Give the team a clear place to split work and track
                        progress.
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
                                placeholder="e.g., Website redesign"
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Describe the project goals and scope"
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
                                disabled={loading}
                                className="button button--primary"
                            >
                                {loading ? "Creating..." : "Create project"}
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
