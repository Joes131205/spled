import {
    HeadContent,
    Scripts,
    createRootRouteWithContext,
    Link,
    useLocation,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { LogOut, Menu, ShieldCheck, UserCircle2, X } from "lucide-react";

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
    const isLoginPage = location.pathname === "/login";
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        if (typeof window !== "undefined") {
            localStorage.clear();
            window.location.href = "/login";
        }
    };

    const userLabel =
        typeof window !== "undefined"
            ? localStorage.getItem("displayName") ||
              localStorage.getItem("username") ||
              "Guest"
            : "Guest";
    const userRole =
        typeof window !== "undefined"
            ? (localStorage.getItem("role") || "member").replace(/_/g, " ")
            : "member";

    const linkClass = (path: string) => {
        const active =
            location.pathname === path ||
            (path === "/dashboard" &&
                location.pathname.startsWith("/dashboard"));

        return `nav-link ${active ? "nav-link--active" : ""}`;
    };

    if (isLoginPage) {
        return (
            <html lang="en">
                <head>
                    <HeadContent />
                </head>
                <body className="app-auth">
                    {children}
                    <Scripts />
                </body>
            </html>
        );
    }

    return (
        <html lang="en">
            <head>
                <HeadContent />
            </head>
            <body>
                <div className="app-shell">
                    <aside
                        className="app-sidebar"
                        style={{
                            transform: sidebarOpen
                                ? "translateX(0)"
                                : undefined,
                        }}
                    >
                        <div className="app-sidebar__brand">
                            <div className="brand-mark">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="brand-name">Spled</div>
                                <div className="brand-subtitle">
                                    Group task splitter
                                </div>
                            </div>
                        </div>

                        <nav className="nav-stack">
                            <Link
                                to="/dashboard"
                                className={linkClass("/dashboard")}
                            >
                                <UserCircle2 className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                to="/dashboard/profile/edit"
                                className={linkClass("/dashboard/profile/edit")}
                            >
                                <UserCircle2 className="h-4 w-4" />
                                Profile
                            </Link>
                        </nav>
                    </aside>

                    <div className="content-shell">
                        <header className="topbar">
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

                            <div className="topbar__group ml-auto">
                                <div className="topbar__user">
                                    <p className="topbar__name">{userLabel}</p>
                                    <p className="topbar__role">{userRole}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="button button--ghost button--compact"
                                >
                                    <LogOut className="h-4 w-4" />
                                    Logout
                                </button>
                            </div>
                        </header>

                        <main className="main-area">
                            <div className="page">{children}</div>
                        </main>
                    </div>
                </div>

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
