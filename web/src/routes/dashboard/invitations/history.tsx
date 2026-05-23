import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Inbox, Loader2, Calendar } from "lucide-react";
import { projectApi, authApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/invitations/history")({
    component: RouteComponent,
});

interface InvitationHistory {
    id: string;
    taskName: string;
    difficulty: string;
    status: "ACCEPTED" | "DECLINED";
    updatedAt: string;
    project: {
        name: string;
        description: string;
        leaderId: string;
        endDate: string | null;
    };
}

function LeaderAvatar({ userId }: { userId: string }) {
    const { data: leader, isLoading } = useQuery({
        queryKey: ["user", userId],
        queryFn: async () => {
            const response = await authApi.get(`/auth/users/${userId}`);
            return response.data;
        },
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="h-14 w-14 rounded-2xl bg-slate-100 animate-pulse shrink-0" />
        );
    }

    if (leader?.avatarUrl) {
        return (
            <img 
                src={leader.avatarUrl} 
                alt={leader.username} 
                className="h-14 w-14 rounded-2xl object-cover shrink-0 shadow-lg shadow-indigo-100" 
            />
        );
    }

    return (
        <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-lg shadow-indigo-100">
            {leader?.username?.charAt(0).toUpperCase() || "?"}
        </div>
    );
}

function RouteComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: history = [], isLoading } = useQuery<InvitationHistory[]>({
        queryKey: ["invitations", "history"],
        queryFn: async () => {
            const response = await projectApi.get("/invitations/history");
            return response.data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await projectApi.delete(`/invitations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations", "history"] });
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: async () => {
            await projectApi.delete("/invitations/history/all");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations", "history"] });
        },
    });

    const handleDelete = (id: string) => {
        if (confirm("Delete this history record?")) {
            deleteMutation.mutate(id);
        }
    };

    const handleClearAll = () => {
        if (confirm("Clear all invitation history? This cannot be undone.")) {
            clearAllMutation.mutate();
        }
    };

    const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

    return (
        <div className="flex min-h-[85vh] items-center justify-center p-6">
            <div className="surface w-full max-w-4xl shadow-2xl">
                <div className="surface__body p-10 sm:p-12">
                    <div className="mb-10 flex justify-between items-start">
                        <div>
                            <p className="kicker mb-2 text-sm font-semibold">Account</p>
                            <h1 className="text-4xl font-bold text-slate-900">
                                Invitations
                            </h1>
                            <p className="text-slate-500 mt-2">
                                Manage your project invitations and team requests.
                            </p>
                        </div>
                        {history.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                            >
                                <Trash2 className="h-4 w-4" />
                                Clear All
                            </button>
                        )}
                    </div>

                    <div className="flex p-1 rounded-2xl gap-2 mb-10 bg-slate-100 w-fit">
                        <button 
                            type="button"
                            onClick={() => navigate({ to: "/dashboard/invitations/pending" })}
                            className="text-slate-500 hover:text-slate-900 px-6 py-2 rounded-xl font-bold text-sm transition-all"
                        >
                            Pending
                        </button>
                        <button
                            className="bg-white text-slate-900 shadow-sm px-6 py-2 rounded-xl font-bold text-sm"
                        >
                            History
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                            <p className="font-medium">Loading history...</p>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Inbox className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium text-lg">No invitation history</p>
                            <p className="text-slate-400 text-sm mt-1">Your past responses will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {history.map((item) => (
                                <div key={item.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-6 transition-all hover:shadow-md hover:bg-white group relative">
                                    <div className="flex gap-5 flex-1">
                                        <LeaderAvatar userId={item.project.leaderId} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-slate-900">{item.project.name}</h3>
                                                <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                                    item.status === "ACCEPTED" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                                                }`}>
                                                    {item.status}
                                                </span>
                                            </div>
                                            {userRole === "LECTURER" ? (
                                                <p className="text-indigo-600 font-medium text-sm mb-1">
                                                    You've been invited to view and evaluate this group project.
                                                </p>
                                            ) : (
                                                <p className="text-slate-600 font-medium text-sm mb-1">
                                                    Task: <span className="text-indigo-600">{item.taskName}</span>
                                                </p>
                                            )}
                                            <p className="text-slate-500 text-sm line-clamp-1">
                                                {item.project.description || "No description provided."}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                                    Deadline: {item.project.endDate ? new Date(item.project.endDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }) : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center">
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="p-3 text-slate-300 hover:text-rose-600 transition-colors"
                                            title="Delete history"
                                        >
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
