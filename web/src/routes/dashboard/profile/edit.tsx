import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Camera, Upload } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../../../utils/api";

export const Route = createFileRoute("/dashboard/profile/edit")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const username = localStorage.getItem("username") || "";
    const role = localStorage.getItem("role") || "";

    const [displayName, setDisplayName] = useState(
        localStorage.getItem("displayName") || "",
    );
    const [avatarUrl, setAvatarUrl] = useState(
        localStorage.getItem("avatarUrl") || "",
    );
    const [avatarPreview, setAvatarPreview] = useState(
        localStorage.getItem("avatarUrl") || "",
    );
    const [message, setMessage] = useState({ type: "", text: "" });

    const updateProfileMutation = useMutation({
        mutationFn: async (data: { displayName: string; avatarUrl: string }) => {
            const response = await authApi.put("/profile", data);
            return response.data;
        },
        onSuccess: (data) => {
            localStorage.setItem("displayName", data.displayName || "");
            localStorage.setItem("avatarUrl", data.avatarUrl || "");
            window.dispatchEvent(new Event("storage"));

            setMessage({
                type: "success",
                text: "Profile updated successfully.",
            });

            queryClient.invalidateQueries({ queryKey: ["me"] });
        },
        onError: (error: any) => {
            setMessage({
                type: "error",
                text: error.response?.data?.message || "Failed to update profile.",
            });
        },
    });

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !file.type.startsWith("image/")) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result;
            if (typeof dataUrl === "string") {
                setAvatarUrl(dataUrl);
                setAvatarPreview(dataUrl);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleAvatarUrlChange = (val: string) => {
        setAvatarUrl(val);
        setAvatarPreview(val);
    };

    const getInitials = () => {
        const name = displayName || username || "?";
        return name.slice(0, 2).toUpperCase();
    };

    const handleSave = () => {
        setMessage({ type: "", text: "" });
        updateProfileMutation.mutate({
            displayName: displayName || "",
            avatarUrl: avatarUrl || "",
        });
    };

    const saving = updateProfileMutation.isPending;

    return (
        <div className="flex min-h-[85vh] items-center justify-center p-6">
            <div className="surface w-full max-w-4xl shadow-2xl">
                <div className="surface__header flex items-center justify-between gap-4 p-10 sm:p-12">
                    <div>
                        <p className="kicker mb-2 text-sm font-semibold">Profile</p>
                        <h1 className="text-4xl font-bold text-slate-900">
                            Edit Profile
                        </h1>
                    </div>
                </div>

                {false ? ( 
                    <div className="empty-state">Loading...</div>
                ) : (
                    <div className="surface__body grid gap-12 p-10 sm:p-12 lg:grid-cols-[300px_minmax(0,1fr)]">
                        <div className="grid justify-items-center gap-6">
                            <div className="avatar-mark h-40 w-40 text-5xl shadow-xl rounded-[2.5rem]">
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="h-full w-full object-cover"
                                        onError={() => setAvatarPreview("")}
                                    />
                                ) : (
                                    getInitials()
                                )}
                            </div>

                            <div className="grid gap-3 text-center">
                                <p className="text-2xl font-bold text-slate-900">
                                    {displayName || username}
                                </p>
                                <p className="text-lg text-slate-500">
                                    @{username}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="button button--ghost w-full py-3"
                            >
                                <Upload className="h-4 w-4" />
                                Upload avatar
                            </button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileUpload}
                                className="hidden"
                            />
                        </div>

                        <div className="grid gap-8">
                            {message.text && (
                                <div
                                    className={`alert ${message.type === "success" ? "alert--success" : "alert--error"}`}
                                >
                                    <AlertCircle className="h-5 w-5 shrink-0" />
                                    <p className="text-sm leading-6">
                                        {message.text}
                                    </p>
                                </div>
                            )}

                            <div className="field">
                                <label className="label text-base">Username</label>
                                <div className="input text-base py-4 px-6 bg-slate-50 text-slate-500">
                                    @{username}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label text-base">Display name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.target.value)
                                    }
                                    placeholder={username || "Your name"}
                                    maxLength={32}
                                    className="input text-base py-4 px-6"
                                />
                                <p className="text-xs text-slate-500 mt-1">
                                    {displayName.length}/32
                                </p>
                            </div>

                            <div className="field">
                                <label className="label text-base">Avatar URL</label>
                                <input
                                    type="url"
                                    value={avatarUrl}
                                    onChange={(e) =>
                                        handleAvatarUrlChange(e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="input text-base py-4 px-6"
                                />
                            </div>

                            <div className="split-actions pt-6">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="button button--primary px-8 py-4 text-base rounded-2xl"
                                >
                                    <Camera className="h-5 w-5" />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate({ to: "/dashboard/profile/display"})
                                    }
                                    className="button button--secondary px-8 py-4 text-base rounded-2xl"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
