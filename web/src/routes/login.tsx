import { authApi } from "#/utils/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LogIn, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/login")({
    component: RouteComponent,
});

function RouteComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError("Please enter a valid email address");
            return;
        }
        if (password.length < 4) {
            setError("Password must be at least 4 characters");
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.post("/auth/login", { email, password });
            localStorage.setItem("token", res.data.accessToken);
            localStorage.setItem("role", res.data.user.role);
            localStorage.setItem("username", res.data.user.username);
            localStorage.setItem("userId", res.data.user.id);
            localStorage.setItem(
                "displayName",
                res.data.user.displayName || "",
            );
            localStorage.setItem("avatarUrl", res.data.user.avatarUrl || "");
            navigate({ to: "/dashboard" });
        } catch (err: any) {
            const status = err.response?.status;
            if (status === 401) {
                setError("Incorrect email or password. Please try again.");
            } else if (status === 404) {
                setError("No account found with this email.");
            } else {
                setError("Something went wrong. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Spled</h1>
                    <p className="text-gray-600 mt-2">Group Task Splitter</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6" noValidate>
                    {error && (
                        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <LogIn className="w-4 h-4" />
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-gray-600 mt-6">
                    Demo: email@test.com / pass
                </p>
            </div>
        </div>
    );
}
