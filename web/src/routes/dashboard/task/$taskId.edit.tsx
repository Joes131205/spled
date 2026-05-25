import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import { AlertCircle, ArrowLeft, Loader2, Check, ChevronDown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { projectApi, authApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/task/$taskId/edit")({
    component: RouteComponent,
});

function MemberOption({ userId, isSelected, onSelect }: { userId: string, isSelected: boolean, onSelect: () => void }) {
    const { data: user } = useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const response = await authApi.get(`/auth/users/${userId}`);
            return response.data;
        },
    });

    if (user?.role === "LECTURER") return null;

    return (
        <button
            type="button"
            onClick={onSelect}
            className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-all ${
                isSelected 
                    ? "bg-slate-50 text-[#00008B]" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
        >
            <div className="flex items-center gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] border border-slate-200 uppercase">
                    {user?.username?.substring(0, 2) || "??"}
                </div>
                <span>{user?.username || "Loading..."}</span>
            </div>
            {isSelected && <Check className="h-4 w-4" />}
        </button>
    );
}

function RouteComponent() {
    const { taskId } = Route.useParams();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [weight, setWeight] = useState("MEDIUM");
    const [assignedTo, setAssignedTo] = useState("");
    const [error, setError] = useState("");
    
    const [weightMenuOpen, setWeightMenuOpen] = useState(false);
    const [assignMenuOpen, setAssignMenuOpen] = useState(false);
    
    const weightRef = useRef<HTMLDivElement>(null);
    const assignRef = useRef<HTMLDivElement>(null);

    const navigate = useNavigate();
    const queryClient = useQueryClient();

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (weightRef.current && !weightRef.current.contains(e.target as Node)) setWeightMenuOpen(false);
            if (assignRef.current && !assignRef.current.contains(e.target as Node)) setAssignMenuOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const { data: task, isLoading: isTaskLoading } = useQuery({
        queryKey: ["tasks", taskId],
        queryFn: async () => {
            const response = await projectApi.get(`/tasks/detail/${taskId}`);
            return response.data;
        },
    });

    const { data: project } = useQuery({
        queryKey: ["projects", task?.projectId],
        queryFn: async () => {
            const response = await projectApi.get(`/projects/${task.projectId}`);
            return response.data;
        },
        enabled: !!task?.projectId,
    });

    const { data: assignedUser } = useQuery({
        queryKey: ["user", assignedTo],
        queryFn: async () => {
            const response = await authApi.get(`/auth/users/${assignedTo}`);
            return response.data;
        },
        enabled: !!assignedTo,
    });

    useEffect(() => {
        if (task) {
            setName(task.name);
            setDescription(task.description || "");
            setWeight(task.weight);
            setAssignedTo(task.assignedTo || "");
        }
    }, [task]);

    const updateTaskMutation = useMutation({
        mutationFn: async (data: any) => {
            await projectApi.patch(`/tasks/${taskId}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks", taskId] });
            if (task?.projectId) {
                queryClient.invalidateQueries({ queryKey: ["projects", task.projectId] });
                navigate({ to: "/dashboard/project/$projectId", params: { projectId: task.projectId } });
            } else {
                navigate({ to: "/dashboard" });
            }
        },
        onError: (err: any) => {
            setError(err.response?.data?.message || "Failed to update task");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (name.length < 3) {
            setError("Task name must be at least 3 characters");
            return;
        }

        updateTaskMutation.mutate({
            name,
            description,
            weight,
            assignedTo: assignedTo || null,
        });
    };

    const weights = [
        { id: "EASY", label: "Easy", pts: 1, colorClass: "bg-emerald-500" },
        { id: "MEDIUM", label: "Medium", pts: 2, colorClass: "bg-amber-500" },
        { id: "HARD", label: "Hard", pts: 3, colorClass: "bg-rose-500" },
    ];

    const activeWeight = weights.find(w => w.id === weight) || weights[1];

    if (isTaskLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-10 w-10 animate-spin text-[#00008B]" />
            </div>
        );
    }

    return (
        <div className="grid gap-6">
            <button
                onClick={() =>
                    task?.projectId 
                        ? navigate({ to: "/dashboard/project/$projectId", params: { projectId: task.projectId } })
                        : navigate({ to: "/dashboard" })
                }
                className="back-link w-fit"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Project
            </button>

            <div className="surface">
                <div className="surface__body max-w-2xl">
                    <p className="kicker">Task</p>
                    <h1 className="page-title">Edit task</h1>
                    <p className="page-subtitle mt-3">
                        Update task details and assignments.
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
                            <label className="label text-xs uppercase tracking-widest text-slate-500">Task name *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Design login page"
                                className="input h-12"
                                required
                            />
                        </div>

                        <div className="field">
                            <div className="flex items-center justify-between">
                                <label className="label text-xs uppercase tracking-widest text-slate-500">
                                    Short Description{" "}
                                    <span className="muted text-[10px] font-normal">
                                        (optional)
                                    </span>
                                </label>
                                <span className={`text-[10px] font-bold ${description.length === 30 ? 'text-rose-500' : 'text-slate-400'}`}>
                                    {description.length}/30
                                </span>
                            </div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What needs to be done?"
                                rows={3}
                                maxLength={30}
                                className="textarea min-h-24"
                            />
                        </div>

                        <div className="field relative" ref={assignRef}>
                            <label className="label text-xs uppercase tracking-widest text-slate-500">Assign to Member</label>
                            <button
                                type="button"
                                onClick={() => setAssignMenuOpen(!assignMenuOpen)}
                                className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                            >
                                <div className="flex items-center gap-2">
                                    {assignedTo ? (
                                        <>
                                            <div className="h-6 w-6 rounded-full bg-[#00008B] flex items-center justify-center text-[10px] text-white uppercase font-bold">
                                                {assignedUser?.username?.substring(0, 2) || "??"}
                                            </div>
                                            <span className="text-[#00008B]">{assignedUser?.username || "Loading..."}</span>
                                        </>
                                    ) : (
                                        <span className="text-slate-400">Select member</span>
                                    )}
                                </div>
                                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${assignMenuOpen ? "rotate-180" : ""}`} />
                            </button>

                            {assignMenuOpen && (
                                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-200">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setAssignedTo("");
                                            setAssignMenuOpen(false);
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-all ${
                                            assignedTo === "" 
                                                ? "bg-slate-50 text-[#00008B]" 
                                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                    >
                                        <span>Unassigned</span>
                                        {assignedTo === "" && <Check className="h-4 w-4" />}
                                    </button>
                                    <div className="h-px bg-slate-100 mx-2 my-1" />
                                    <div className="max-h-48 overflow-y-auto">
                                        {project?.members?.map((m: any) => (
                                            <MemberOption 
                                                key={m.userId} 
                                                userId={m.userId} 
                                                isSelected={assignedTo === m.userId} 
                                                onSelect={() => {
                                                    setAssignedTo(m.userId);
                                                    setAssignMenuOpen(false);
                                                }} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="field relative" ref={weightRef}>
                            <label className="label text-xs uppercase tracking-widest text-slate-500">Task Difficulty</label>
                            <button
                                type="button"
                                onClick={() => setWeightMenuOpen(!weightMenuOpen)}
                                className="flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 focus:outline-none focus:ring-4 focus:ring-indigo-100"
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`h-2.5 w-2.5 rounded-full ${activeWeight.colorClass}`} />
                                    <span>{activeWeight.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                                        {activeWeight.pts} PTS
                                    </span>
                                    <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${weightMenuOpen ? "rotate-180" : ""}`} />
                                </div>
                            </button>

                            {weightMenuOpen && (
                                <div className="absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl shadow-slate-900/10 animate-in fade-in zoom-in-95 duration-200">
                                    {weights.map((w) => (
                                        <button
                                            key={w.id}
                                            type="button"
                                            onClick={() => {
                                                setWeight(w.id);
                                                setWeightMenuOpen(false);
                                            }}
                                            className={`flex w-full items-center justify-between px-4 py-3 text-sm font-medium transition-all ${
                                                weight === w.id 
                                                    ? "bg-slate-50 text-[#00008B]" 
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`h-2.5 w-2.5 rounded-full ${w.colorClass}`} />
                                                <span>{w.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className={`text-[10px] font-bold uppercase tracking-tight px-2 py-0.5 rounded-md ${
                                                    weight === w.id ? "bg-[#00008B] text-white" : "bg-slate-100 text-slate-400"
                                                }`} style={{ fontFamily: '"DM Sans", sans-serif' }}>
                                                    {w.pts} PTS
                                                </span>
                                                {weight === w.id && <Check className="h-4 w-4" />}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={updateTaskMutation.isPending}
                            className="button button--primary w-full mt-4 h-12 text-base font-bold shadow-lg shadow-indigo-100"
                        >
                            {updateTaskMutation.isPending ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                "Update task"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
