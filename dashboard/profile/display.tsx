import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowLeft, Pencil } from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/dashboard/profile/display')({
  component: RouteComponent,
})

function RouteComponent() {
    const navigate = useNavigate();

    const [avatarPreview, setAvatarPreview] = useState(
        localStorage.getItem("avatarUrl") || "",
    );

    const username = localStorage.getItem("username") || "";

    const [displayName, setDisplayName] = useState(
        localStorage.getItem("displayName") || "",
    );

    const getInitials = () => {
        const name = displayName || username || "?";
        return name.slice(0, 2).toUpperCase();
    };

  return (
    <div className="grid gap-6">
        {/* is this button necessary in the first place? sidebar already exists */}
        <button
            onClick={() => navigate({ to: "/dashboard" })}
            className="back-link w-fit"
        >
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
        </button>
        
        <div className="surface">
            <div className="surface__header flex items-center justify-between gap-4">
                <div>
                    <p className="kicker">Profile</p>
                    <h1 className="text-3xl font-bold text-slate-900">
                        Your Profile
                    </h1>
                </div>
                <div className="text-right">
                    <p className="text-sm font-semibold text-slate-900">
                        {username}
                    </p>
                    {/* <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                        {role.replace(/_/g, " ")}
                    </p> */}
                </div>
            </div>


            <div className="surface__body grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
                <div className="grid justify-items-center gap-4">
                    <div className="avatar-mark h-28 w-28 text-3xl shadow-lg">
                        {avatarPreview ? ( // shouldn't have to read from edit page functions, temporary
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
                </div>

                <div className="grid gap-5">
                    <div className="field">
                        <label className="label">E-mail</label>
                        <div className="input">
                            @{username}
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">Display name</label>
                        <div className="input">
                            @{displayName}
                        </div>
                    </div>


                    <div className="split-actions pt-2">
                        <button
                            type="button"
                            onClick={() =>
                                navigate({ to: "/dashboard/profile/edit" })
                            }
                            className="button button--primary"
                        >
                            <Pencil className="h-4 w-4" />Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
