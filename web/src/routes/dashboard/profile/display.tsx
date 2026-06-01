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
    <div className="flex min-h-[85vh] items-center justify-center p-6">
        <div className="surface w-full max-w-4xl shadow-2xl">
            <div className="surface__header flex items-center justify-between gap-4 p-10 sm:p-12">
                <div>
                    <p className="kicker mb-2 text-sm font-semibold">Profile</p>
                    <h1 className="text-4xl font-bold text-slate-900">
                        Your Profile
                    </h1>
                </div>
            </div>


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
                </div>

                <div className="grid gap-8 self-center">
                    <div className="field">
                        <label className="label text-base">E-mail</label>
                        <div className="input text-base py-4 px-6 bg-slate-50/50">
                            {username}@example.com
                        </div>
                    </div>

                    <div className="field">
                        <label className="label text-base">Display name</label>
                        <div className="input text-base py-4 px-6 bg-slate-50/50">
                            {displayName || username}
                        </div>
                    </div>


                    <div className="split-actions pt-6">
                        <button
                            type="button"
                            onClick={() =>
                                navigate({ to: "/dashboard/profile/edit" })
                            }
                            className="button button--primary px-8 py-4 text-base rounded-2xl"
                        >
                            <Pencil className="h-5 w-5" />Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}
