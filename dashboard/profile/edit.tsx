import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AlertCircle, ArrowLeft, Camera, Upload } from "lucide-react";

export const Route = createFileRoute("/dashboard/profile/edit")({
    component: RouteComponent,
});

function RouteComponent() {
    const navigate = useNavigate();
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
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

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
        setSaving(true);
        setMessage({ type: "", text: "" });

        setTimeout(() => {
            localStorage.setItem("displayName", displayName || "");
            localStorage.setItem("avatarUrl", avatarUrl || "");
            window.dispatchEvent(new Event("storage"));

            setMessage({
                type: "success",
                text: "Profile updated successfully.",
            });
            setSaving(false);
        }, 300);
    };

    return (
        <div className="grid gap-6">
            {/* i think it looks better this way -M */}
            {/* <button
                onClick={() => navigate({ to: "/dashboard" })}
                className="back-link w-fit"
            >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
            </button> */}

            <div className="surface">
                <div className="surface__header flex items-center justify-between gap-4">
                    <div>
                        <p className="kicker">Profile</p>
                        <h1 className="text-3xl font-bold text-slate-900">
                            Edit Profile
                        </h1>
                        {/* <p className="page-subtitle mt-2">
                            Keep your name and avatar consistent across the
                            workspace.
                        </p> */}
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                            {username}
                        </p>
                        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                            {role.replace(/_/g, " ")}
                        </p>
                    </div>
                </div>

                {false ? ( // modify accordingly, i set it to false to see this page, set true otherwise to see Loading...
                    <div className="empty-state">Loading...</div>
                ) : (
                    <div className="surface__body grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                        <div className="grid justify-items-center gap-4">
                            <div className="avatar-mark h-28 w-28 text-3xl shadow-lg">
                                {/* show the user's avatar if it exists, otherwise show user's initials */}
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

                            <div className="grid gap-2 text-center">
                                <p className="font-semibold text-slate-900">
                                    {displayName || username}
                                </p>
                                <p className="text-sm text-slate-500">
                                    @{username}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="button button--ghost w-full"
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

                        <div className="grid gap-5">
                            {/* for profile update alert messages */}
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
                                <label className="label">Username</label>
                                <div className="input bg-slate-50 text-slate-500">
                                    @{username}
                                </div>
                            </div>

                            <div className="field">
                                <label className="label">Display name</label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) =>
                                        setDisplayName(e.target.value)
                                    }
                                    placeholder={username || "Your name"}
                                    maxLength={32}
                                    className="input"
                                />
                                <p className="text-xs text-slate-500">
                                    {displayName.length}/32
                                </p>
                            </div>

                            <div className="field">
                                <label className="label">Avatar URL</label>
                                <input
                                    type="url"
                                    value={avatarUrl}
                                    onChange={(e) =>
                                        handleAvatarUrlChange(e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="input"
                                />
                            </div>

                            <div className="split-actions pt-2">
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="button button--primary"
                                >
                                    <Camera className="h-4 w-4" />
                                    {saving ? "Saving..." : "Save changes"}
                                </button>
                                <button
                                    type="button"
                                    onClick={() =>
                                        navigate({ to: "/dashboard/profile/display"})
                                    }
                                    className="button button--secondary"
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
