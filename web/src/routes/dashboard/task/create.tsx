import { projectApi } from "#/utils/api";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/task/create")({
    component: RouteComponent,
});

function RouteComponent() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [weight, setWeight] = useState("easy");
    const [assignedUsername, setAssignedUsername] = useState("");
    const [deadline, setDeadline] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const projectId = new URLSearchParams(location.search).get("projectId");
    const role = localStorage.getItem("role");
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (role !== "LEADER") {
            navigate({ to: "/dashboard" });
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (name.length < 3) {
            setError("Task name must be at least 3 characters");
            return;
        }
        if (!assignedUsername) {
            setError("Please assign this task to a member");
            return;
        }
        setLoading(true);
        try {
            await projectApi.post(`/tasks/${projectId}`, {
                name,
                description,
                weight: weight.toUpperCase(),
                assignedTo: assignedUsername,
                deadline: deadline || undefined,
            });
            navigate({ to: "/dashboard" });
        } catch (err) {
            console.log("Create Task Error:", err.response?.data || err);
            const data = err.response?.data;
            const backendMessage =
                data?.message ||
                data?.error ||
                err.response?.statusText ||
                err.message;
            const errorMessage = Array.isArray(backendMessage)
                ? backendMessage[0]
                : backendMessage;

            setError(
                errorMessage || "Failed to create task. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    const WeightIcon = ({ type }) => {
        if (type === "easy")
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M9 12l2 2 4-4"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            );
        if (type === "medium")
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M8 12h8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <path
                        d="M12 8v8"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                </svg>
            );
        if (type === "hard")
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle
                        cx="12"
                        cy="12"
                        r="9"
                        stroke="currentColor"
                        strokeWidth="1.8"
                    />
                    <path
                        d="M12 8v5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                    />
                    <circle cx="12" cy="16" r="0.8" fill="currentColor" />
                </svg>
            );
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)",
            }}
        >
            <style>{`
        @keyframes floatA {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(40px, -50px) scale(1.1); }
          66% { transform: translate(-30px, 30px) scale(0.95); }
        }
        @keyframes floatB {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(-50px, 40px) scale(1.05); }
          66% { transform: translate(30px, -30px) scale(0.9); }
        }
        @keyframes floatC {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(20px, -40px) scale(1.1); }
        }
        .blob-a { animation: floatA 10s ease-in-out infinite; }
        .blob-b { animation: floatB 13s ease-in-out infinite; }
        .blob-c { animation: floatC 8s ease-in-out infinite; }
        .weight-card { transition: all 0.2s ease; cursor: pointer; }
        .weight-card:hover { transform: translateY(-2px); }
      `}</style>

            <div
                className="blob-a absolute top-[-80px] left-[-80px] w-[400px] h-[400px] rounded-full opacity-30 blur-3xl"
                style={{
                    background: "radial-gradient(circle, #7c3aed, transparent)",
                }}
            />
            <div
                className="blob-b absolute bottom-[-100px] right-[-60px] w-[450px] h-[450px] rounded-full opacity-25 blur-3xl"
                style={{
                    background: "radial-gradient(circle, #06b6d4, transparent)",
                }}
            />
            <div
                className="blob-c absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full opacity-20 blur-3xl"
                style={{
                    background: "radial-gradient(circle, #10b981, transparent)",
                }}
            />

            <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage:
                        "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                }}
            />

            <div className="w-full max-w-md relative z-10 py-10">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{
                                background:
                                    "linear-gradient(135deg, #7c3aed, #06b6d4)",
                            }}
                        >
                            <svg
                                width="22"
                                height="22"
                                viewBox="0 0 24 24"
                                fill="none"
                            >
                                <circle
                                    cx="12"
                                    cy="12"
                                    r="3"
                                    fill="white"
                                    opacity="0.9"
                                />
                                <path
                                    d="M12 3 L12 7"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M12 17 L12 21"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M3 12 L7 12"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M17 12 L21 12"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                />
                                <path
                                    d="M5.6 5.6 L8.5 8.5"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                                <path
                                    d="M15.5 15.5 L18.4 18.4"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                                <path
                                    d="M18.4 5.6 L15.5 8.5"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                                <path
                                    d="M8.5 15.5 L5.6 18.4"
                                    stroke="white"
                                    strokeWidth="1.5"
                                    strokeLinecap="round"
                                    opacity="0.7"
                                />
                            </svg>
                        </div>
                        <span className="text-2xl font-bold text-white tracking-tight">
                            SplitTask
                        </span>
                    </div>
                    <div className="flex items-center justify-center gap-3 mb-2">
                        <h1 className="text-3xl font-bold text-white">
                            New Task
                        </h1>
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="text-cyan-400"
                            style={{ color: "#06b6d4" }}
                        >
                            <rect
                                x="3"
                                y="5"
                                width="18"
                                height="16"
                                rx="2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                            />
                            <path
                                d="M3 10h18"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8 3v4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M16 3v4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8 14h4"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                            <path
                                d="M8 17h2"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Assign a task to your team member.
                    </p>
                </div>

                <div
                    className="rounded-3xl p-8 border border-white/10 backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                >
                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        noValidate
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Task Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Design login page"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Description
                                <span className="text-gray-600 font-normal ml-1">
                                    (optional)
                                </span>
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What needs to be done?"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Assign to
                            </label>
                            <input
                                type="text"
                                value={assignedUsername}
                                onChange={(e) =>
                                    setAssignedUsername(e.target.value)
                                }
                                placeholder="Enter member's username"
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                            />
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                                    {error}
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Deadline
                                <span className="text-gray-600 font-normal ml-1">
                                    (optional)
                                </span>
                            </label>
                            <input
                                type="date"
                                value={deadline}
                                onChange={(e) => setDeadline(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                                style={{ colorScheme: "dark" }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Task Weight
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    {
                                        value: "easy",
                                        label: "Easy",
                                        desc: "1 point",
                                        color: "#10b981",
                                    },
                                    {
                                        value: "medium",
                                        label: "Medium",
                                        desc: "2 points",
                                        color: "#f59e0b",
                                    },
                                    {
                                        value: "hard",
                                        label: "Hard",
                                        desc: "3 points",
                                        color: "#ef4444",
                                    },
                                ].map((w) => (
                                    <div
                                        key={w.value}
                                        className="weight-card rounded-xl p-3 border text-center"
                                        onClick={() => setWeight(w.value)}
                                        style={{
                                            borderColor:
                                                weight === w.value
                                                    ? w.color
                                                    : "rgba(255,255,255,0.1)",
                                            background:
                                                weight === w.value
                                                    ? `${w.color}15`
                                                    : "rgba(255,255,255,0.03)",
                                        }}
                                    >
                                        <div
                                            className="flex justify-center mb-2"
                                            style={{
                                                color:
                                                    weight === w.value
                                                        ? w.color
                                                        : "#6b7280",
                                            }}
                                        >
                                            <WeightIcon type={w.value} />
                                        </div>
                                        <p
                                            className="text-sm font-semibold"
                                            style={{
                                                color:
                                                    weight === w.value
                                                        ? w.color
                                                        : "#9ca3af",
                                            }}
                                        >
                                            {w.label}
                                        </p>
                                        <p
                                            className="text-xs mt-1"
                                            style={{
                                                color:
                                                    weight === w.value
                                                        ? w.color
                                                        : "#6b7280",
                                            }}
                                        >
                                            {w.desc}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full font-semibold py-3 rounded-xl transition duration-200 text-white shadow-lg disabled:opacity-50"
                            style={{
                                background:
                                    "linear-gradient(135deg, #7c3aed, #06b6d4)",
                            }}
                        >
                            {loading ? "Creating..." : "Create Task →"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 mt-6">
                        <Link
                            to="/dashboard"
                            className="text-cyan-400 font-medium hover:text-cyan-300 transition"
                        >
                            ← Back to Dashboard
                        </Link>
                    </p>
                </div>

                <p className="text-center text-xs text-gray-400 mt-6">
                    SplitTask — Fair work for everyone.
                </p>
            </div>
        </div>
    );
}
