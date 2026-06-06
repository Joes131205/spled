import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState, useEffect } from "react";
import { AlertCircle, UserPlus, X, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "../utils/api";

export const Route = createFileRoute("/signup")({
    component: RouteComponent,
});

function RouteComponent() {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [role, setRole] = useState<"student" | "lecturer">("student");
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
    const [generalError, setGeneralError] = useState<string | null>(null);
    const navigate = useNavigate();
    const signupMutation = useMutation({
        mutationFn: async () => {
            const response = await authApi.post("/auth/register", {
                username: `${firstName}${lastName || ""}`.toLowerCase().replace(/\s/g, ""),
                email,
                password,
                role: role === "student" ? "MEMBER" : "LECTURER",
            });
            return response.data;
        },
        onSuccess: (data) => {
            if (!data || !data.user || !data.accessToken) {
                navigate({ to: "/login" });
                return;
            }

            try {
                localStorage.clear();
                localStorage.setItem("token", data.accessToken);
                localStorage.setItem("email", data.user.email);
                localStorage.setItem("username", data.user.username);
                localStorage.setItem("userId", data.user.id);
                localStorage.setItem("role", data.user.role || "MEMBER");
                localStorage.setItem("displayName", data.user.displayName || data.user.username);
                localStorage.setItem("avatarUrl", data.user.avatarUrl || "");
                
                window.location.href = "/dashboard";
            } catch (e) {
                console.error("Auto-login failed:", e);
                navigate({ to: "/login" });
            }
        },
        onError: (err: any) => {
            const msg = err.response?.data?.message || "Registration failed. Please try again.";
            setGeneralError(msg);
        }
    });

    useEffect(() => {
        const checkEmail = async () => {
            if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
                setEmailStatus("idle");
                return;
            }

            setEmailStatus("checking");
            try {
                const response = await authApi.get(`/auth/validate-email?email=${email}`);
                if (response.data.exists) {
                    setEmailStatus("taken");
                    setErrors(prev => ({ ...prev, email: "This email is already registered" }));
                } else {
                    setEmailStatus("available");
                    setErrors(prev => {
                        const newErr = { ...prev };
                        delete newErr.email;
                        return newErr;
                    });
                }
            } catch (err) {
                setEmailStatus("idle");
            }
        };

        const timer = setTimeout(checkEmail, 500);
        return () => clearTimeout(timer);
    }, [email]);

    const handleSignup = (e: FormEvent) => {
        e.preventDefault();
        setGeneralError(null);
        
        const newErrors: Record<string, string> = {};
        
        if (firstName.trim().length < 3) {
            newErrors.firstName = "First name must be at least 3 characters";
        }
        
        if (!email.trim()) {
            newErrors.email = "Email address is required";
        } else if (!/^\S+@\S+\.\S+$/.test(email)) {
            newErrors.email = "Please enter a valid email address";
        } else if (emailStatus === "taken") {
            newErrors.email = "This email is already registered";
        }

        if (!password) {
            newErrors.password = "Password is required";
        } else if (password.length < 4) {
            newErrors.password = "Password must be at least 4 characters";
        }

        if (password !== confirmPassword) {
            newErrors.confirmPassword = "Passwords do not match";
        }

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            signupMutation.mutate();
        }
    };

    const clearError = (field: string) => {
        if (errors[field]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            <div
                className="flex lg:w-[58%] xl:w-[62%] flex-col items-center justify-center relative overflow-hidden py-12 lg:py-0"
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
                        {generalError && (
                            <div className="flex items-center justify-between gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700">
                                <div className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 shrink-0" />
                                    <p className="text-sm font-medium">{generalError}</p>
                                </div>
                                <button type="button" onClick={() => setGeneralError(null)} className="text-red-400 hover:text-red-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">First name</label>
                                <input
                                    type="text"
                                    value={firstName}
                                    onChange={(e) => { setFirstName(e.target.value); clearError("firstName"); }}
                                    placeholder="Alex"
                                    className={`rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                                        errors.firstName ? "border-red-500 bg-red-50/30 focus:ring-red-100" : "border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                    }`}
                                />
                                {errors.firstName && (
                                    <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5">
                                        <AlertCircle className="h-2.5 w-2.5" />
                                        {errors.firstName}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <label className="text-sm font-medium text-slate-700">Last name <span className="text-slate-400 font-normal">(opt)</span></label>
                                <input
                                    type="text"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    placeholder="Rivera"
                                    className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-700">Email address</label>
                                {emailStatus === "checking" && <span className="text-[10px] font-bold text-slate-400 animate-pulse">Verifying...</span>}
                                {emailStatus === "available" && <div className="flex items-center gap-1 text-emerald-500 font-bold text-[10px]"><CheckCircle2 className="h-3 w-3" /> AVAILABLE</div>}
                            </div>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); clearError("email"); }}
                                placeholder="you@example.com"
                                className={`rounded-lg border bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                                    errors.email ? "border-red-500 bg-red-50/30 focus:ring-red-100" : "border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                }`}
                            />
                            {errors.email && (
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5">
                                    <AlertCircle className="h-2.5 w-2.5" />
                                    {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); clearError("password"); clearError("confirmPassword"); }}
                                    placeholder="At least 4 characters"
                                    className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                                        errors.password ? "border-red-500 bg-red-50/30 focus:ring-red-100" : "border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5">
                                    <AlertCircle className="h-2.5 w-2.5" />
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-slate-700">Confirm password</label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => { setConfirmPassword(e.target.value); clearError("confirmPassword"); }}
                                    placeholder="Repeat your password"
                                    className={`w-full rounded-lg border bg-white px-4 py-2.5 pr-10 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all ${
                                        errors.confirmPassword ? "border-red-500 bg-red-50/30 focus:ring-red-100" : "border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                                    }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wide flex items-center gap-1 mt-0.5">
                                    <AlertCircle className="h-2.5 w-2.5" />
                                    {errors.confirmPassword}
                                </p>
                            )}
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
                            <p className="text-xs text-slate-500 leading-relaxed mt-1">
                                As a <span className="font-semibold capitalize text-indigo-700">{role}</span>,{" "}
                                {role === "student"
                                    ? "you can join projects as a Leader or Member — you choose your role per project."
                                    : "you can create and oversee projects for your class or group."}
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={signupMutation.isPending}
                            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-[#00008B] px-4 py-3.5 text-sm font-semibold text-white hover:bg-[#000066] disabled:opacity-60 shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
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

                    <button 
                        type="button" 
                        onClick={() => window.location.href = 'http://127.0.0.1:3001/auth/google'}
                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="h-4 w-4" />
                        Sign up with Google
                    </button>

                    <p className="mt-6 text-center text-xs font-medium text-slate-400">
                        By creating an account you agree to our{" "}
                        <a href="#" className="text-slate-600 underline hover:text-indigo-600 transition-colors">Terms of Service</a>{" "}
                        and{" "}
                        <a href="#" className="text-slate-600 underline hover:text-indigo-600 transition-colors">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
