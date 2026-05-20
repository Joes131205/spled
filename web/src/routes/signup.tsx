import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AlertCircle, ArrowRight, Layout, UserPlus } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../utils/api";
import { z } from "zod";

export const Route = createFileRoute("/signup")({
    component: RouteComponent,
});

const signupSchema = z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(4, "Password must be at least 4 characters"),
    confirmPassword: z.string(),
    role: z.enum(["student", "lecturer"]),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

function RouteComponent() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [role, setRole] = useState<"student" | "lecturer">("student");
    const [validationError, setValidationError] = useState<string | null>(null);
    const navigate = useNavigate();

    const signupMutation = useMutation({
        mutationFn: async () => {
            const response = await authApi.post("/auth/register", {
                username: `${firstName}${lastName}`.toLowerCase().replace(/\s/g, ""),
                email,
                password,
                role: role === "student" ? "MEMBER" : "LECTURER",
            });
            return response.data;
        },
        onSuccess: () => {
            navigate({ to: "/login" });
        },
        onError: () => {
            setValidationError(null);
        }
    });

    const handleSignup = (e: FormEvent) => {
        e.preventDefault();
        setValidationError(null);

        const result = signupSchema.safeParse({ firstName, lastName, email, password, confirmPassword, role });
        if (!result.success) {
            setValidationError(result.error.errors[0].message);
            return;
        }

        signupMutation.mutate();
    };

    const serverError = signupMutation.error && (signupMutation.error as any).response?.data?.message;
    const displayError = validationError || (Array.isArray(serverError) ? serverError[0] : serverError) || (signupMutation.isError ? "Registration failed" : null);

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

            <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-20 bg-white overflow-y-auto">
                <div className="w-full max-w-sm mx-auto py-10">
                    <p className="text-xs font-bold tracking-widest uppercase text-indigo-700 mb-1">
                        Get started
                    </p>
                    <h2 className="text-4xl font-bold text-slate-900 tracking-tight">Create an account</h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Already have an account?{" "}
                        <Link to="/login" className="text-indigo-700 font-semibold hover:underline">
                            Sign in instead
                        </Link>
                    </p>

                    <form onSubmit={handleSignup} className="mt-8 flex flex-col gap-5" noValidate>
                        {displayError && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                <p className="text-sm">{displayError}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">First name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    placeholder="Alex"
                                    required
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                                />
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Last name</label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Rivera"
                                    required
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                                />
                            </div>
                        </div>

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
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="At least 8 characters"
                                required
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Confirm password</label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat your password"
                                required
                                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-slate-700">I am a</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(["student", "lecturer"] as const).map((r) => (
                                    <button
                                        key={r}
                                        type="button"
                                        onClick={() => setRole(r)}
                                        className={[
                                            "flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium capitalize transition",
                                            role === r
                                                ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
                                        ].join(" ")}
                                    >
                                        <span
                                            className={[
                                                "h-4 w-4 rounded-full border-2 flex items-center justify-center flex-shrink-0",
                                                role === r ? "border-indigo-700" : "border-slate-300",
                                            ].join(" ")}
                                        >
                                            {role === r && (
                                                <span className="h-2 w-2 rounded-full bg-indigo-700" />
                                            )}
                                        </span>
                                        {r.charAt(0).toUpperCase() + r.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500">
                                As a <span className="font-semibold capitalize text-indigo-700">{role}</span>,{" "}
                                {role === "student"
                                    ? "you can join projects as a Leader or Member — you choose your role per project."
                                    : "you can create and oversee projects for your class or group."}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={signupMutation.isPending}
                            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#00008B] px-4 py-3 text-sm font-semibold text-white hover:bg-[#000066] disabled:opacity-60 transition"
                        >
                            <UserPlus className="h-4 w-4" />
                            {signupMutation.isPending ? "Creating account…" : "Create account"}
                        </button>
                    </form>

                    <div className="relative my-6 flex items-center gap-3">
                        <div className="flex-1 border-t border-slate-200" />
                        <span className="text-xs uppercase tracking-wider text-slate-400">or</span>
                        <div className="flex-1 border-t border-slate-200" />
                    </div>

                    <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                        Sign up with Google
                    </button>

                    <p className="mt-4 text-center text-xs text-slate-400">
                        By creating an account you agree to our{" "}
                        <a href="#" className="underline hover:text-slate-600">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="underline hover:text-slate-600">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}