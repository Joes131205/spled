import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AlertCircle, ArrowRight, Layout, LogIn } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../utils/api";
import { z } from "zod";

export const Route = createFileRoute("/login")({
    component: RouteComponent,
});

const loginSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(4, "Password must be at least 4 characters"),
});

function RouteComponent() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [validationError, setValidationError] = useState<string | null>(null);
    const navigate = useNavigate();

    const loginMutation = useMutation({
        mutationFn: async () => {
            const response = await authApi.post("/auth/login", { email, password });
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem("token", data.accessToken);
            localStorage.setItem("email", data.user.email);
            localStorage.setItem("username", data.user.username);
            localStorage.setItem("userId", data.user.id);
            localStorage.setItem("role", data.user.role || "MEMBER");
            localStorage.setItem("displayName", data.user.displayName || data.user.username);
            navigate({ to: "/dashboard" });
        },
        onError: () => {
            setValidationError(null);
        }
    });

    const handleLogin = (e: FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        const result = loginSchema.safeParse({ email, password });
        if (!result.success) {
            setValidationError(result.error.errors[0].message);
            return;
        }

        loginMutation.mutate();
    };

    const serverError = loginMutation.error && (loginMutation.error as any).response?.data?.message;
    const displayError = validationError || (Array.isArray(serverError) ? serverError[0] : serverError) || (loginMutation.isError ? "Invalid credentials" : null);

    return (
        <div className="min-h-screen flex">
            <div
                className="hidden lg:flex lg:w-[58%] xl:w-[62%] flex-col items-center justify-center relative overflow-hidden"
                style={{
                    backgroundColor: "#000000",
                    backgroundImage: "radial-gradient(at 0% 0%, rgba(79, 70, 229, 0.35) 0px, transparent 50%)",
                }}
            >
                <div
                    className="absolute -top-10 -left-10 h-[500px] w-[500px] rounded-full pointer-events-none"
                    style={{
                        background: "radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, transparent 70%)",
                        filter: "blur(80px)",
                    }}
                />

                <div className="relative z-10 flex flex-col items-center gap-8 px-12 max-w-lg text-center">
                    <img src="/logo.png" alt="Spled logo" className="h-28 w-28 object-contain" />

                    <div>
                        <h1 className="text-5xl font-bold text-white tracking-tight font-serif">Spled</h1>
                        <span
                            className="inline-block mt-8 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
                            style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}
                        >
                            Group Task Splitter
                        </span>
                    </div>

                    <p className="text-3xl font-bold text-white leading-snug font-serif">
                        Split work with{" "}
                        <em className="italic text-slate-300">less friction</em>
                    </p>

                    <p className="text-sm text-white/40 leading-relaxed">
                        Spled gives your team a single, clear workspace:
                        projects, tasks, and owners all in one place.
                    </p>

                    <div className="flex flex-col gap-6 w-full mt-4">
                        {[
                            { icon: "/appicon1.png", label: "Role-aware views for leaders and members" },
                            { icon: "/appicon2.png", label: "Projects, tasks, and profiles in a single flow" },
                            { icon: "/appicon3.png", label: "Real-time updates and deadlines" },
                        ].map(({ icon, label }) => (
                            <div
                                key={label}
                                className="flex items-center gap-4 text-sm text-white/90 font-medium"
                            >
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-xl shadow-white/10">
                                    <img src={icon} alt="" className="h-6 w-6 object-contain" />
                                </div>
                                <span className="text-left leading-tight">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-white">
                <div className="w-full max-w-sm mx-auto">
                    <p className="text-xs font-bold tracking-widest uppercase text-indigo-700 mb-1">
                        Welcome back
                    </p>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Sign in</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        No account yet?{" "}
                        <Link to="/signup" className="text-indigo-700 font-semibold hover:underline">
                            Create one for free
                        </Link>
                    </p>

                    <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-5" noValidate>
                        {displayError && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p className="text-sm">{displayError}</p>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Email address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">Password</label>
                                <a href="#" className="text-xs font-semibold text-indigo-700 hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#00008B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#000066] disabled:opacity-60 transition"
                        >
                            <LogIn className="h-4 w-4" />
                            {loginMutation.isPending ? "Signing in…" : "Sign in"}
                        </button>
                    </form>

                    <div className="relative my-6 flex items-center gap-3">
                        <div className="flex-1 border-t border-slate-200" />
                        <span className="text-xs uppercase tracking-wider text-slate-400">or</span>
                        <div className="flex-1 border-t border-slate-200" />
                    </div>

                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                        Continue with Google
                    </button>

                    <div className="mt-6 rounded-xl bg-slate-50 border border-slate-100 px-4 py-3">
                        <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Demo credentials</p>
                        <p className="text-sm text-slate-600">
                            Email: <span className="font-semibold text-slate-900">test@gmail.com</span>
                        </p>
                        <p className="text-sm text-slate-600">
                            Password: <span className="font-semibold text-slate-900">test</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}