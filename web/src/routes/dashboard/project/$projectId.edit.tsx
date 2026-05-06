import {
    createFileRoute,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

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

export const Route = createFileRoute("/dashboard/project/$projectId/edit")({
    component: RouteComponent,
});

function RouteComponent() {
    const { projectId } = useParams({
        from: "/dashboard/project/$projectId/edit",
    });
    const navigate = useNavigate();
    const mockProject = MOCK_PROJECTS_MAP[projectId];
    const [formData, setFormData] = useState({
        name: mockProject?.name || "",
        description: mockProject?.description || "",
        endDate: mockProject?.endDate
            ? new Date(mockProject.endDate).toISOString().split("T")[0]
            : "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

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

        setSubmitting(true);
        setTimeout(() => {
            navigate({ to: "/dashboard" });
        }, 300);
    };

    if (!mockProject) {
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
