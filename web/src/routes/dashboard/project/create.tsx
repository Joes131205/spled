import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AlertCircle, Plus, Trash2, UserPlus, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectApi, authApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/project/create")({
    component: RouteComponent,
});

interface TeamMember {
    task: string;
    email: string;
    difficulty: "easy" | "medium" | "hard";
}

function RouteComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const userId = isMounted && typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const userEmail = isMounted && typeof window !== "undefined" ? localStorage.getItem("email") : "";

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        endDate: "",
    });
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
        { task: "", email: "", difficulty: "medium" },
    ]);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isMounted && userEmail) {
            setTeamMembers([{ task: "", email: userEmail, difficulty: "medium" }]);
        }
    }, [isMounted, userEmail]);

    const createProjectMutation = useMutation({
        mutationFn: async (data: any) => {
            const response = await projectApi.post("/projects", data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["projects"] });
            navigate({ to: "/dashboard" });
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Failed to create project");
        },
    });

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        // Clear field error when user types
        if (fieldErrors[e.target.name]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[e.target.name];
                return updated;
            });
        }
    };

    const handleTeamMemberChange = (
        index: number,
        field: keyof TeamMember,
        value: string,
    ) => {
        const updatedMembers = [...teamMembers];
        updatedMembers[index] = { ...updatedMembers[index], [field]: value } as TeamMember;
        setTeamMembers(updatedMembers);

        // Clear field error when user types
        const errorKey = `member.${index}.${field}`;
        if (fieldErrors[errorKey]) {
            setFieldErrors(prev => {
                const updated = { ...prev };
                delete updated[errorKey];
                return updated;
            });
        }
    };

    const addTeamMember = () => {
        setTeamMembers([
            ...teamMembers,
            { task: "", email: "", difficulty: "medium" },
        ]);
    };

    const removeTeamMember = (index: number) => {
        if (teamMembers.length > 1) {
            setTeamMembers(teamMembers.filter((_, i) => i !== index));
            // Clear errors for this index and shift others? 
            // Simplified: just clear all member errors to be safe, or leave them.
            setFieldErrors({}); 
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const newFieldErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newFieldErrors.name = "Project name is required";
        } else if (formData.name.trim().length < 4) {
            newFieldErrors.name = "Project name must be at least 4 characters";
        } else if (formData.name.length > 30) {
            newFieldErrors.name = "Project name must be at most 30 characters";
        }

        if (formData.description.length > 80) {
            newFieldErrors.description = "Description must be at most 80 characters";
        }

        if (!formData.endDate) {
            newFieldErrors.endDate = "A deadline is required";
        }

        const validMembers = teamMembers.filter(m => m.task.trim() || m.email.trim());

        for (let i = 0; i < teamMembers.length; i++) {
            const member = teamMembers[i];
            
            if (i === 0 || member.task.trim() || member.email.trim()) {
                if (!member.task.trim()) {
                    newFieldErrors[`member.${i}.task`] = "Task name is required";
                } else if (member.task.trim().length < 4) {
                    newFieldErrors[`member.${i}.task`] = "Task name must be at least 4 characters";
                }
                
                if (!member.email.trim()) {
                    newFieldErrors[`member.${i}.email`] = "Email is required";
                } else if (!/^\S+@\S+\.\S+$/.test(member.email)) {
                    newFieldErrors[`member.${i}.email`] = "Please provide a valid email";
                } else {
                    try {
                        const response = await authApi.get(`/auth/validate-email?email=${member.email}`);
                        if (!response.data.exists) {
                            newFieldErrors[`member.${i}.email`] = "Email is not registered";
                        } else if (response.data.role === "LECTURER") {
                            newFieldErrors[`member.${i}.email`] = "Lecturers cannot be invited";
                        }
                    } catch (err) {
                        console.error("Email validation failed", err);
                        setError("Failed to verify emails. Please try again.");
                    }
                }
            }
        }

        if (Object.keys(newFieldErrors).length > 0) {
            setFieldErrors(newFieldErrors);
            return;
        }

        createProjectMutation.mutate({
            ...formData,
            leaderId: userId,
            teamMembers: validMembers,
        });
    };

    const loading = createProjectMutation.isPending;

    return (
        <div className="flex min-h-[85vh] items-center justify-center p-6">
            <div className="surface w-full max-w-4xl shadow-xl">
                <div className="surface__body p-8 sm:p-10">
                    <div className="mb-8">
                        <p className="kicker mb-1.5 text-xs font-semibold">Project</p>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Create new project
                        </h1>
                        <p className="text-slate-500 mt-1">
                            Give the team a clear place to split work and track
                            progress.
                        </p>
                    </div>

                    {error && (
                        <div className="alert alert--error mb-6 py-4 px-5">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <p className="text-sm leading-6">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid gap-6" noValidate>
                        <div className="grid gap-4">
                            <div className="field">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="label text-base font-semibold">Project name *</label>
                                    <span className={`text-[10px] font-bold ${formData.name.length === 30 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {formData.name.length}/30
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="e.g., Website redesign"
                                    maxLength={30}
                                    className={`input text-sm py-3 px-5 transition-all ${fieldErrors.name ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100" : ""}`}
                                />
                                {fieldErrors.name ? (
                                    <p className="text-rose-500 text-[10px] mt-1.5 font-bold uppercase tracking-wide flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.name}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-tight">Minimum 4 characters</p>
                                )}
                            </div>

                            <div className="field">
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="label text-base font-semibold">Description (optional)</label>
                                    <span className={`text-[10px] font-bold ${formData.description.length === 80 ? 'text-rose-500' : 'text-slate-400'}`}>
                                        {formData.description.length}/80
                                    </span>
                                </div>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    placeholder="Describe the project goals and scope"
                                    rows={2}
                                    maxLength={80}
                                    className={`textarea text-sm py-3 px-5 transition-all ${fieldErrors.description ? "border-rose-500 bg-rose-50/30" : ""}`}
                                />
                                {fieldErrors.description && (
                                    <p className="text-rose-500 text-[10px] mt-1.5 font-bold uppercase tracking-wide flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.description}
                                    </p>
                                )}
                            </div>

                            <div className="field">
                                <label className="label text-base font-semibold mb-3">Team & Tasks</label>
                                <div className="grid gap-3 max-h-[350px] overflow-y-auto pr-2">
                                    {teamMembers.map((member, index) => (
                                        <div key={index} className={`flex flex-wrap items-start gap-3 p-4 rounded-2xl border transition-all relative group ${
                                            fieldErrors[`member.${index}.task`] || fieldErrors[`member.${index}.email`] 
                                                ? "bg-rose-50/30 border-rose-200" 
                                                : "bg-slate-50 border-slate-100"
                                        }`}>
                                            <div className="flex-1 min-w-[190px]">
                                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Task (min 4 chars)</label>
                                                <input
                                                    type="text"
                                                    value={member.task}
                                                    onChange={(e) => handleTeamMemberChange(index, "task", e.target.value)}
                                                    placeholder="Task name"
                                                    className={`input py-2 px-4 bg-white text-sm ${fieldErrors[`member.${index}.task`] ? "border-rose-500 focus:border-rose-600" : ""}`}
                                                />
                                                {fieldErrors[`member.${index}.task`] && (
                                                    <p className="text-rose-500 text-[9px] mt-1.5 font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <AlertCircle className="h-2.5 w-2.5" />
                                                        {fieldErrors[`member.${index}.task`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-[190px]">
                                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">
                                                    Email (Registered) {index === 0 && <span className="text-indigo-600 font-extrabold">(YOU)</span>}
                                                </label>
                                                <input
                                                    type="email"
                                                    value={member.email}
                                                    onChange={(e) => handleTeamMemberChange(index, "email", e.target.value)}
                                                    placeholder="alex@example.com"
                                                    readOnly={index === 0}
                                                    className={`input py-2 px-4 text-sm ${
                                                        index === 0 
                                                            ? "bg-slate-100 text-slate-500 cursor-not-allowed border-slate-200" 
                                                            : `bg-white ${fieldErrors[`member.${index}.email`] ? "border-rose-500 focus:border-rose-600" : ""}`
                                                    }`}
                                                />
                                                {fieldErrors[`member.${index}.email`] && (
                                                    <p className="text-rose-500 text-[9px] mt-1.5 font-bold uppercase tracking-wide flex items-center gap-1">
                                                        <AlertCircle className="h-2.5 w-2.5" />
                                                        {fieldErrors[`member.${index}.email`]}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="w-fit">
                                                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1 block">Difficulty</label>
                                                <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                                                    {(["easy", "medium", "hard"] as const).map((d) => (
                                                        <button
                                                            key={d}
                                                            type="button"
                                                            onClick={() => handleTeamMemberChange(index, "difficulty", d)}
                                                            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-tight rounded-md transition-all ${
                                                                member.difficulty === d
                                                                    ? d === "easy" ? "bg-green-100 text-green-700" : d === "medium" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                                    : "text-slate-400 hover:bg-slate-50"
                                                            }`}
                                                        >
                                                            {d}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            {index > 0 ? (
                                                <button
                                                    type="button"
                                                    onClick={() => removeTeamMember(index)}
                                                    className="p-2 mt-5 text-slate-300 hover:text-red-500 transition-colors"
                                                    title="Remove member"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            ) : (
                                                <div className="p-2 h-9 w-9 mt-5" /> // Spacer for alignment
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all font-medium text-sm"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Team Member
                                    </button>
                                </div>
                            </div>

                            <div className="field">
                                <label className="label text-base font-semibold mb-1.5">Deadline *</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleChange}
                                    className={`input text-sm py-3 px-5 transition-all ${fieldErrors.endDate ? "border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100" : ""}`}
                                />
                                {fieldErrors.endDate ? (
                                    <p className="text-rose-500 text-[10px] mt-1.5 font-bold uppercase tracking-wide flex items-center gap-1">
                                        <AlertCircle className="h-3 w-3" />
                                        {fieldErrors.endDate}
                                    </p>
                                ) : (
                                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-bold tracking-tight">Required for tracking</p>
                                )}
                            </div>
                        </div>

                        <div className="split-actions pt-6 border-t border-slate-100">
                            <button
                                type="submit"
                                disabled={loading}
                                className="button button--primary px-8 py-3 text-base rounded-2xl"
                            >
                                {loading ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <UserPlus className="h-5 w-5" />
                                )}
                                {loading ? "Creating..." : "Create project"}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate({ to: "/dashboard" })}
                                className="button button--secondary px-8 py-3 text-base rounded-2xl"
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
