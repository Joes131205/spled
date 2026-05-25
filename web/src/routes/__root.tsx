import {
    HeadContent,
    Scripts,
    createRootRouteWithContext,
    Link,
    useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { LogOut, Menu, ShieldCheck, UserCircle2, X, LayoutDashboard, User, Mail } from "lucide-react";
import React from "react";

import TanStackQueryDevtools from "../integrations/tanstack-query/devtools";

import appCss from "../styles.css?url";

import type { QueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

interface MyRouterContext {
    queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
    head: () => ({
        meta: [
            {
                charSet: "utf-8",
            },
            {
                name: "viewport",
                content: "width=device-width, initial-scale=1",
            },
            {
                title: "Spled - Group Task Splitter",
            },
        ],
        links: [
            {
                rel: "stylesheet",
                href: appCss,
            },
        ],
    }),
    shellComponent: RootDocument,
});

function RootDocument({ children }: { children: ReactNode }) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Use effect to handle mounting state for hydration safety
    React.useEffect(() => {
        setIsMounted(true);
    }, []);

    const userId = isMounted && typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    
    const isAuthPage =
        location.pathname === "/login" || 
        location.pathname === "/signup" || 
        (location.pathname === "/" && !userId);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.href = "/login";
        }
    };

    const userLabel =
        isMounted && typeof window !== "undefined"
            ? localStorage.getItem("displayName") && localStorage.getItem("displayName") !== "undefined"
                ? localStorage.getItem("displayName")
                : localStorage.getItem("username") && localStorage.getItem("username") !== "undefined"
                    ? localStorage.getItem("username")
                    : "Guest"
            : "Guest";
    const rawRole =
        isMounted && typeof window !== "undefined"
            ? localStorage.getItem("role") || "MEMBER"
            : "MEMBER";

    const userRole =
        rawRole === "LECTURER" ? "Lecturer" : "Student";

    const userEmail =
        isMounted && typeof window !== "undefined"
            ? localStorage.getItem("email") && localStorage.getItem("email") !== "undefined"
                ? localStorage.getItem("email")
                : "user@example.com"
            : "user@example.com";

    const userAvatar =
        isMounted && typeof window !== "undefined"
            ? localStorage.getItem("avatarUrl")
            : null;

    const linkClass = (path: string) => {
        const active =
            path === "/dashboard"
                ? location.pathname === "/dashboard" ||
                  location.pathname === "/"
                : location.pathname.startsWith(path);

        return `nav-link ${active ? "nav-link--active" : ""}`;
    };

    const bodyClass = isAuthPage ? "app-auth" : "";

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className={bodyClass}>
                {isAuthPage ? (
                    children
                ) : (
                    <div className="app-shell">
                        <aside
                            className="app-sidebar flex flex-col"
                            style={{
                                transform: sidebarOpen
                                    ? "translateX(0)"
                                    : undefined,
                            }}
                        >
                            <div className="app-sidebar__brand">
                                <div className="brand-mark bg-white border border-slate-100 overflow-hidden p-2">
                                    <img src="/logo.png" alt="Spled" className="h-full w-full object-contain" />
                                </div>
                                <div>
                                    <div className="brand-name text-xl">Spled</div>
                                    <div className="brand-subtitle">
                                        Group task splitter
                                    </div>
                                </div>
                            </div>

                            <nav className="nav-stack flex-1">
                                <p className="nav-section-title">Workspace</p>
                                <Link
                                    to="/dashboard"
                                    className={linkClass("/dashboard")}
                                >
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Link>

                                <p className="nav-section-title">Account</p>
                                <Link
                                    to="/dashboard/profile/display"
                                    className={linkClass(
                                        "/dashboard/profile/display"
                                    )}
                                >
                                    <User className="h-4 w-4" />
                                    Profile
                                </Link>
                                <Link
                                    to="/dashboard/invitations/pending"
                                    className={linkClass(
                                        "/dashboard/invitations/pending"
                                    )}
                                >
                                    <Mail className="h-4 w-4" />
                                    Invitations
                                </Link>
                            </nav>

                            <div className="app-sidebar__footer">
                                <div className="sidebar-user">
                                    <div className="sidebar-user__avatar">
                                        {userAvatar ? (
                                            <img
                                                src={userAvatar}
                                                alt={userLabel}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-indigo-50 text-xs font-bold text-indigo-700">
                                                {userLabel.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="sidebar-user__info">
                                        <div className="sidebar-user__name">{userLabel}</div>
                                        <div className="sidebar-user__email">{userEmail}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                                            {userRole}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="sidebar-user__logout"
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </aside>

                        <div className="content-shell">
                            <header className="topbar md:hidden">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="button button--ghost button--compact md:hidden"
                                    aria-label="Toggle sidebar"
                                >
                                    {sidebarOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </button>
                            </header>

                            <main className="main-area">
                                <div className="page">{children}</div>
                            </main>
                        </div>
                    </div>
                )}

                <TanStackDevtools
                    config={{
                        position: "bottom-right",
                    }}
                    plugins={[
                        {
                            name: "Tanstack Router",
                            render: <TanStackRouterDevtoolsPanel />,
                        },
                        TanStackQueryDevtools,
                    ]}
                />
                <Scripts />
            </body>
        </html>
    );
}
