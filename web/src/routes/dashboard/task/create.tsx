import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/task/create")({
    component: RouteComponent,
    validateSearch: (search: Record<string, any>) => ({
        projectId: typeof search.projectId === "string" ? search.projectId : "",
    }),
});

function RouteComponent() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [weight, setWeight] = useState("MEDIUM");
    const [assignedTo, setAssignedTo] = useState("");
    const [deadline, setDeadline] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { projectId } = Route.useSearch();
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (role !== "LEADER") {
            navigate({ to: "/dashboard" });
        }
    }, [navigate, role]);

    const createTaskMutation = useMutation({
        mutationFn: async (data: any) => {
            await projectApi.post("/tasks", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
            navigate({ to: "/dashboard/project/$projectId", params: { projectId } });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Failed to create task");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!projectId) {
            setError("Missing project id.");
            return;
        }
        if (name.length < 3) {
            setError("Task name must be at least 3 characters");
            return;
        }

        createTaskMutation.mutate({
            projectId,
            name,
            description,
            weight,
            assignedTo: assignedTo || null,
            deadline: deadline || null,
        });
    };

    const loading = createTaskMutation.isPending;

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

                    <form
                        onSubmit={handleSubmit}
                        className="mt-6 grid gap-5"
                        noValidate
                    >
                        <div className="field">
                            <label className="label">Task name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Design login page"
                                className="input"
                                required
                            />
                        </div>

                        <div className="field">
                            <label className="label">
                                Description{" "}
                                <span className="muted text-xs font-normal">
                                    (optional)
                                </span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What needs to be done?"
                                rows={3}
                                className="textarea"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Assign to (User ID)</label>
                            <input
                                type="text"
                                value={assignedTo}
                                onChange={(e) =>
                                    setAssignedTo(e.target.value)
                                }
                                placeholder="Enter member's user ID"
                                className="input"
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="field">
                                <label className="label">
                                    Deadline{" "}
                                    <span className="muted text-xs font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <input
                                    type="date"
                                    value={deadline}
                                    onChange={(e) =>
                                        setDeadline(e.target.value)
                                    }
                                    min={new Date().toISOString().split("T")[0]}
                                    className="input"
                                />
                            </div>

                            <div className="field">
                                <label className="label">Weight</label>
                                <select
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                    className="select"
                                >
                                    <option value="EASY">Easy</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HARD">Hard</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="button button--primary w-full"
                        >
                            {loading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Create task"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}

