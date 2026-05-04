import { projectApi } from "#/utils/api";
import {
    createFileRoute,
    useNavigate,
    useParams,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/project/edit")({
    component: RouteComponent,
});

function RouteComponent() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const navigate = useNavigate();
    const { id } = useParams();
    const role = localStorage.getItem("role");

    useEffect(() => {
        if (role !== "LEADER") {
            navigate({ to: "/dashboard" });
            return;
        }
        fetchProject();
    }, []);

    const fetchProject = async () => {
        try {
            const res = await projectApi.get(`/projects/${id}`);
            setName(res.data.name);
            setDescription(res.data.description || "");
        } catch (err) {
            setError("Failed to load project");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (name.length < 3) {
            setError("Project name must be at least 3 characters");
            return;
        }
        setLoading(true);
        try {
            await projectApi.patch(`/projects/${id}`, { name, description });
            navigate({ to: "/dashboard" });
        } catch (err) {
            setError("Failed to update project");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await projectApi.delete(`/projects/${id}`);
            navigate({ to: "/dashboard" });
        } catch (err) {
            setError("Failed to delete project");
        } finally {
            setDeleting(false);
        }
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
        .blob-a { animation: floatA 10s ease-in-out infinite; }
        .blob-b { animation: floatB 13s ease-in-out infinite; }
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
                            Edit Project
                        </h1>
                        <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            style={{ color: "#06b6d4" }}
                        >
                            <path
                                d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                            <path
                                d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </div>
                    <p className="text-gray-400 text-sm">
                        Update your project details.
                    </p>
                </div>

                <div
                    className="rounded-3xl p-8 border border-white/10 backdrop-blur-md"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                >
                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
                            {error}
                        </div>
                    )}

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-5"
                        noValidate
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Project Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Project name"
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
                                placeholder="Project description"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                            />
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
                            {loading ? "Saving..." : "Save Changes →"}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10 space-y-3">
                        <p className="text-xs text-gray-600 uppercase tracking-wider">
                            Danger Zone
                        </p>

                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="w-full py-2.5 rounded-xl text-sm font-medium border border-red-500/30 text-red-400 hover:bg-red-500/10 transition"
                            >
                                Delete Project
                            </button>
                        ) : (
                            <div className="p-3 rounded-xl border border-red-500/30 bg-red-500/5">
                                <p className="text-red-400 text-sm mb-3">
                                    This cannot be undone. Are you sure?
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleDelete}
                                        disabled={deleting}
                                        className="flex-1 py-2 rounded-lg text-sm font-medium bg-red-500/20 text-red-400 hover:bg-red-500/30 transition disabled:opacity-50"
                                    >
                                        {deleting
                                            ? "Deleting..."
                                            : "Yes, Delete"}
                                    </button>
                                    <button
                                        onClick={() =>
                                            setShowDeleteConfirm(false)
                                        }
                                        className="flex-1 py-2 rounded-lg text-sm text-gray-400 border border-white/10 hover:bg-white/5 transition"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
