import { authApi } from "#/utils/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

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
        <div
            className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
            style={{
                background:
                    "linear-gradient(135deg, #0f0c29, #1a1a2e, #16213e)",
            }}
        >
            <div className="w-full max-w-md relative z-10">
                <form onSubmit={handleLogin} className="space-y-5" noValidate>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) =>
                                setEmail((e.target as HTMLInputElement).value)
                            }
                            required
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) =>
                                setPassword(
                                    (e.target as HTMLInputElement).value,
                                )
                            }
                            required
                            className="w-full"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full">
                        {loading ? "Signing in..." : "Sign in →"}
                    </button>
                </form>
            </div>
        </div>
    );
}
