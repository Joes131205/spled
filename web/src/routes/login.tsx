import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowRight, CheckCircle2, LogIn } from "lucide-react";

export const Route = createFileRoute("/login")({
    component: RouteComponent,
});

function RouteComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
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
        // Mock login - set demo user data
        setTimeout(() => {
            localStorage.setItem("token", "demo-token");
            localStorage.setItem("role", "leader");
            localStorage.setItem("username", email.split("@")[0]);
            localStorage.setItem("userId", "1");
            localStorage.setItem("displayName", email);
            localStorage.setItem("avatarUrl", "");
            navigate({ to: "/dashboard" });
        }, 300);
    };

    return (
        <div className="auth-shell">
            <div className="auth-shell__grid">
                <section className="auth-hero">
                    <div className="brand-mark">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="auth-badge">
                        <ArrowRight className="h-3.5 w-3.5" />
                        Work that feels organized
                    </div>
                    <h1 className="auth-title">
                        Split work with less friction.
                    </h1>
                    <p className="auth-copy">
                        Spled keeps projects, tasks, and ownership in one clean
                        space so teams can focus on shipping instead of sorting
                        through noise.
                    </p>
                    <div className="feature-list">
                        <div className="feature-item">
                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                            Role-aware dashboards for leaders and members
                        </div>
                        <div className="feature-item">
                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />
                            Projects, tasks, and profiles in a single flow
                        </div>
                        <div className="feature-item">
                            <CheckCircle2 className="h-4 w-4 text-cyan-300" />A
                            calmer interface with consistent spacing and type
                        </div>
                    </div>
                </section>

                <section className="auth-panel">
                    <div className="mb-8">
                        <p className="kicker">Welcome back</p>
                        <h2 className="page-title text-4xl">Sign in</h2>
                        <p className="page-subtitle mt-3">
                            Use your account to continue to the dashboard.
                        </p>
                    </div>

                    <form
                        onSubmit={handleLogin}
                        className="grid gap-5"
                        noValidate
                    >
                        {error && (
                            <div className="alert alert--error">
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <p className="text-sm leading-6">{error}</p>
                            </div>
                        )}

                        <div className="field">
                            <label className="label">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="input"
                            />
                        </div>

                        <div className="field">
                            <label className="label">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="input"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="button button--primary w-full"
                        >
                            <LogIn className="h-4 w-4" />
                            {loading ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="mt-6 text-sm text-slate-500">
                        Demo: email@test.com / pass
                    </p>
                </section>
            </div>
        </div>
    );
}
