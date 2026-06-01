import {
    HeadContent,
    Scripts,
    createRootRouteWithContext,
    Link,
    useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { LogOut, Menu, ShieldCheck, UserCircle2, X, LayoutDashboard, User, Mail, ChevronLeft, ChevronRight } from "lucide-react";
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
    errorComponent: RootRouteError,
    shellComponent: RootDocument,
});

function RootRouteError({ error }: { error: Error }) {
    return (
        <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
            <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-slate-950/30 backdrop-blur">
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400">Route error</p>
                <h1 className="mt-3 text-3xl font-bold text-white">Something went wrong</h1>
                <p className="mt-4 text-sm leading-6 text-slate-300">
                    {error.message || "The route failed to render."}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                        to="/dashboard"
                        className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
                    >
                        Go to dashboard
                    </Link>
                    <Link
                        to="/login"
                        className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
                    >
                        Go to login
                    </Link>
                </div>
            </div>
        </div>
    );
}

function RootDocument({ children }: { children: ReactNode }) {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
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

        return `nav-link ${active ? "nav-link--active" : ""} ${sidebarCollapsed ? "justify-center px-2" : ""}`;
    };

    const bodyClass = isAuthPage ? "app-auth" : "";

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body className={bodyClass}>
                {showLogoutModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                        <div 
                            className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex items-start justify-between mb-6">
                                    <div className="h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg bg-indigo-50 text-indigo-600 shadow-indigo-100">
                                        <LogOut className="h-7 w-7" />
                                    </div>
                                    <button 
                                        onClick={() => setShowLogoutModal(false)}
                                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                                    Logout Confirmation
                                </h3>
                                <p className="text-slate-500 leading-relaxed text-base">
                                    Are you sure you want to log out? You will need to sign in again to access your workspace.
                                </p>

                                <div className="mt-8 grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => setShowLogoutModal(false)}
                                        className="px-6 py-3.5 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-all"
                                    >
                                        Stay here
                                    </button>
                                    <button
                                        onClick={confirmLogout}
                                        className="px-6 py-3.5 text-sm font-bold text-white rounded-2xl transition-all shadow-lg bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100"
                                    >
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {isAuthPage ? (
                    children
                ) : (
                    <div className={`app-shell transition-all duration-300 ${sidebarCollapsed ? "lg:grid-cols-[0px_minmax(0,1fr)]" : "lg:grid-cols-[280px_minmax(0,1fr)]"}`}>
                        <aside
                            className={`app-sidebar flex flex-col transition-all duration-300 overflow-hidden ${sidebarCollapsed ? "lg:w-0 lg:px-0 lg:opacity-0 lg:pointer-events-none" : "lg:w-72 lg:px-6 lg:opacity-100"}`}
                            style={{
                                transform: sidebarOpen
                                    ? "translateX(0)"
                                    : undefined,
                            }}
                        >
                            <div className="app-sidebar__brand flex items-center gap-3">
                                <div className="brand-mark bg-white border border-slate-100 overflow-hidden p-2 shrink-0">
                                    <img src="/logo.png" alt="Spled" className="h-full w-full object-contain" />
                                </div>
                                <div className="flex-1 truncate">
                                    <div className="brand-name text-xl truncate">Spled</div>
                                    <div className="brand-subtitle truncate">
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
                                    <LayoutDashboard className="h-4 w-4 shrink-0" />
                                    <span>Dashboard</span>
                                </Link>

                                <p className="nav-section-title">Account</p>
                                <Link
                                    to="/dashboard/profile/display"
                                    className={linkClass(
                                        "/dashboard/profile/display"
                                    )}
                                >
                                    <User className="h-4 w-4 shrink-0" />
                                    <span>Profile</span>
                                </Link>
                                <Link
                                    to="/dashboard/invitations/pending"
                                    className={linkClass(
                                        "/dashboard/invitations/pending"
                                    )}
                                >
                                    <Mail className="h-4 w-4 shrink-0" />
                                    <span>Invitations</span>
                                </Link>
                            </nav>

                            <div className="app-sidebar__footer">
                                <div className="sidebar-user flex items-center gap-3 px-2">
                                    <div className="sidebar-user__avatar shrink-0">
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
                                    <div className="sidebar-user__info min-w-0 flex-1">
                                        <div className="sidebar-user__name truncate">{userLabel}</div>
                                        <div className="sidebar-user__email truncate">{userEmail}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 truncate">
                                            {userRole}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="sidebar-user__logout shrink-0"
                                        title="Logout"
                                    >
                                        <LogOut className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </aside>

                        <div className="content-shell relative">
                            {/* Desktop Sidebar Toggle - Floating & Sticky */}
                            <div className="hidden lg:block sticky top-6 left-6 z-50 h-0 w-0 overflow-visible">
                                <button 
                                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                    className="flex items-center justify-center h-10 w-10 rounded-2xl border border-slate-200 bg-white/90 backdrop-blur-md text-slate-500 hover:text-indigo-600 hover:border-indigo-100 hover:bg-white transition-all shadow-md group absolute"
                                    aria-label={sidebarCollapsed ? "Open sidebar" : "Close sidebar"}
                                >
                                    {sidebarCollapsed ? (
                                        <Menu className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    ) : (
                                        <ChevronLeft className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    )}
                                </button>
                            </div>

                            <header className="topbar lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
                                <button
                                    onClick={() => setSidebarOpen(!sidebarOpen)}
                                    className="button button--ghost button--compact lg:hidden"
                                    aria-label="Toggle sidebar"
                                >
                                    {sidebarOpen ? (
                                        <X className="h-5 w-5" />
                                    ) : (
                                        <Menu className="h-5 w-5" />
                                    )}
                                </button>
                                <div className="ml-3 font-bold text-slate-900">Spled</div>
                            </header>

                            <main className="main-area transition-all duration-300 pt-16">
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
