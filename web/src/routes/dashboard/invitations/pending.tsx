import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, Mail, Loader2, Calendar, Trash2, Inbox } from "lucide-react";
import { useState } from "react";
import { projectApi, authApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/invitations/pending")({
    component: RouteComponent,
});

interface Invitation {
    id: string;
    taskName: string;
    difficulty: string;
    status?: "ACCEPTED" | "DECLINED";
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
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        type: "delete" | "clear" | null;
        invitationId: string | null;
    }>({
        isOpen: false,
        type: null,
        invitationId: null,
    });

    const { data: pendingInvitations = [], isLoading: isLoadingPending } = useQuery<Invitation[]>({
        queryKey: ["invitations", "pending"],
        queryFn: async () => {
            const response = await projectApi.get("/invitations/my");
            return response.data;
        },
    });

    const { data: historyInvitations = [], isLoading: isLoadingHistory } = useQuery<Invitation[]>({
        queryKey: ["invitations", "history"],
        queryFn: async () => {
            const response = await projectApi.get("/invitations/history");
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

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await projectApi.delete(`/invitations/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations", "history"] });
            setConfirmModal({ isOpen: false, type: null, invitationId: null });
        },
    });

    const clearAllMutation = useMutation({
        mutationFn: async () => {
            await projectApi.delete("/invitations/history/all");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["invitations", "history"] });
            setConfirmModal({ isOpen: false, type: null, invitationId: null });
        },
    });

    const handleRespond = (id: string, status: "ACCEPTED" | "DECLINED") => {
        respondMutation.mutate({ id, status });
    };

    const handleDelete = (id: string) => {
        setConfirmModal({
            isOpen: true,
            type: "delete",
            invitationId: id,
        });
    };

    const handleClearAll = () => {
        setConfirmModal({
            isOpen: true,
            type: "clear",
            invitationId: null,
        });
    };

    const userRole = typeof window !== "undefined" ? localStorage.getItem("role") : null;
    const isLoading = activeTab === "pending" ? isLoadingPending : isLoadingHistory;
    const currentList = activeTab === "pending" ? pendingInvitations : historyInvitations;

    return (
        <div className="flex min-h-[85vh] items-center justify-center p-6">
            {confirmModal.isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div 
                        className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8">
                            <div className="flex items-start justify-between mb-6">
                                <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg bg-rose-50 text-rose-600 shadow-rose-100">
                                    <Trash2 className="h-7 w-7" />
                                </div>
                                <button 
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                {confirmModal.type === "delete" ? "Delete Record?" : "Clear All History?"}
                            </h3>
                            <p className="text-slate-500 leading-relaxed">
                                {confirmModal.type === "delete" 
                                    ? "This will remove this invitation record from your history. This action cannot be undone."
                                    : "This will permanently clear your entire invitation history. This action cannot be undone."
                                }
                            </p>

                            <div className="mt-8 grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                                    className="px-6 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirmModal.type === "delete") {
                                            deleteMutation.mutate(confirmModal.invitationId!);
                                        } else {
                                            clearAllMutation.mutate();
                                        }
                                    }}
                                    disabled={deleteMutation.isPending || clearAllMutation.isPending}
                                    className="px-6 py-3.5 text-sm font-bold text-white rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                                >
                                    {(deleteMutation.isPending || clearAllMutation.isPending) ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        "Delete"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="surface w-full max-w-4xl shadow-2xl">
                <div className="surface__body p-6 sm:p-10 lg:p-12">
                    <div className="mb-10 flex flex-col sm:flex-row justify-between items-start gap-4 sm:gap-0">
                        <div>
                            <p className="kicker mb-2 text-sm font-semibold">Account</p>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
                                Invitations
                            </h1>
                            <p className="text-slate-500 mt-2">
                                Manage your project invitations and team requests.
                            </p>
                        </div>
                        {activeTab === "history" && historyInvitations.length > 0 && (
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
                            onClick={() => setActiveTab("pending")}
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "pending" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setActiveTab("history")}
                            className={`px-6 py-2 rounded-xl font-bold text-sm transition-all ${activeTab === "history" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
                        >
                            History
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                            <p className="font-medium">Loading {activeTab} invitations...</p>
                        </div>
                    ) : currentList.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 rounded-[2rem] border-2 border-dashed border-slate-100 bg-slate-50/50">
                            <div className="h-16 w-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4">
                                {activeTab === "pending" ? <Mail className="h-8 w-8 text-slate-300" /> : <Inbox className="h-8 w-8 text-slate-300" />}
                            </div>
                            <p className="text-slate-500 font-medium text-lg">No {activeTab} invitations</p>
                            <p className="text-slate-400 text-sm mt-1">
                                {activeTab === "pending" 
                                    ? "When someone invites you to a project, it will appear here." 
                                    : "Your past responses will appear here."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {currentList.map((invitation) => (
                                <div key={invitation.id} className="p-4 sm:p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 transition-all hover:shadow-md hover:bg-white group relative">
                                    <div className="flex gap-4 sm:gap-5 flex-1 w-full">
                                        <LeaderAvatar userId={invitation.project.leaderId} />
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-bold text-xl text-slate-900">{invitation.project.name}</h3>
                                                {activeTab === "history" ? (
                                                    <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                                        invitation.status === "ACCEPTED" ? "bg-green-100 text-green-700" : "bg-rose-100 text-rose-700"
                                                    }`}>
                                                        {invitation.status}
                                                    </span>
                                                ) : (
                                                    userRole !== "LECTURER" && (
                                                        <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest rounded-full ${
                                                            invitation.difficulty === "EASY" ? "bg-green-100 text-green-700" : invitation.difficulty === "MEDIUM" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                        }`}>
                                                            {invitation.difficulty}
                                                        </span>
                                                    )
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

                                    {activeTab === "pending" ? (
                                        <div className="flex gap-3 sm:w-auto w-full justify-end sm:pl-0 pl-[72px]">
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
                                    ) : (
                                        <div className="flex items-center sm:w-auto w-full justify-end sm:pl-0 pl-[72px]">
                                            <button
                                                onClick={() => handleDelete(invitation.id)}
                                                className="p-3 text-slate-300 hover:text-rose-600 transition-colors"
                                                title="Delete history"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
