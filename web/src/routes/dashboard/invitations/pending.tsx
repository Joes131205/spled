import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Mail, Loader2, Calendar } from "lucide-react";
import { projectApi, authApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/invitations/pending")({
    component: RouteComponent,
});

interface Invitation {
    id: string;
    taskName: string;
    difficulty: string;
    project: {
        id: string;
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

    const { data: invitations = [], isLoading } = useQuery<Invitation[]>({
        queryKey: ["invitations", "pending"],
        queryFn: async () => {
            const response = await projectApi.get("/invitations/my");
            return response.data;
        },
    });

    const respondMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: "ACCEPTED" | "DECLINED" }) => {
            await projectApi.post(`/invitations/${id}/respond`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations"] });
            queryClient.invalidateQueries({ queryKey: ["projects"] });
        },
    });

    const handleRespond = (id: string, status: "ACCEPTED" | "DECLINED") => {
        respondMutation.mutate({ id, status });
    };

    const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;

    return (
        <div className="flex min-h-[85vh] items-center justify-center p-6">
            <div className="surface w-full max-w-4xl shadow-2xl">
                <div className="surface__body p-10 sm:p-12">
                    <div className="mb-10">
                        <p className="kicker mb-2 text-sm font-semibold">Account</p>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Invitations
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Manage your project invitations and team requests.
                        </p>
                    </div>

                    <div className="flex p-1 rounded-2xl gap-2 mb-10 bg-slate-100 w-fit">
                        <button className="bg-white text-slate-900 shadow-sm px-6 py-2 rounded-xl font-bold text-sm">
                            Pending
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate({ to: "/dashboard/invitations/history" })}
                            className="text-slate-500 hover:text-slate-900 px-6 py-2 rounded-xl font-bold text-sm transition-all"
                        >
                            History
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                            <p className="font-medium">Loading invitations...</p>
                        </div>
                    ) : invitations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                <Mail className="h-8 w-8 text-slate-300" />
                            </div>
                            <p className="text-slate-500 font-medium text-lg">No pending invitations</p>
                            <p className="text-slate-400 text-sm mt-1">When someone invites you to a project, it will appear here.</p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {invitations.map((invitation) => (
                                <div key={invitation.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-6 transition-all hover:shadow-md hover:bg-white group relative">
                                    <div className="flex gap-5 flex-1">
                                        <LeaderAvatar userId={invitation.project.leaderId} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-slate-900">{invitation.project.name}</h3>
                                                {userRole !== "LECTURER" && (
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                                        invitation.difficulty === "EASY" ? "bg-green-100 text-green-700" : invitation.difficulty === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                    }`}>
                                                        {invitation.difficulty}
                                                    </span>
                                                )}
                                            </div>
                                            {userRole === "LECTURER" ? (
                                                <p className="text-indigo-600 font-medium text-sm mb-1">
                                                    You've been invited to view and evaluate this group project.
                                                </p>
                                            ) : (
                                                <p className="text-slate-600 font-medium text-sm mb-1">
                                                    Task: <span className="text-indigo-600">{invitation.taskName}</span>
                                                </p>
                                            )}
                                            <p className="text-slate-500 text-sm line-clamp-1">
                                                {invitation.project.description || "No description provided."}
                                            </p>
                                            <div className="flex items-center gap-1.5 mt-2 text-slate-400">
                                                <Calendar className="h-3 w-3" />
                                                <span className="text-[10px] font-bold uppercase tracking-tight">
                                                    Deadline: {invitation.project.endDate ? new Date(invitation.project.endDate).toLocaleDateString("en-US", {
                                                        month: "short",
                                                        day: "numeric",
                                                        year: "numeric",
                                                    }) : "N/A"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleRespond(invitation.id, "ACCEPTED")}
                                            className="h-12 w-12 rounded-2xl bg-[#00008B] text-white flex items-center justify-center shadow-lg shadow-indigo-200 hover:bg-[#000066] transition-all"
                                            title="Accept Invitation"
                                        >
                                            <Check className="h-6 w-6" />
                                        </button>
                                        <button
                                            onClick={() => handleRespond(invitation.id, "DECLINED")}
                                            className="h-12 w-12 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-all"
                                            title="Decline Invitation"
                                        >
                                            <X className="h-6 w-6" />
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
