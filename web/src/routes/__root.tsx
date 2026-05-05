import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  Link,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { LogOut, Menu, X } from 'lucide-react'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'
import { useState } from 'react'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Spled - Group Task Splitter',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  if (isLoginPage) {
    return (
      <html lang="en">
        <head>
          <HeadContent />
        </head>
        <body className="bg-gray-50">
          {children}
          <Scripts />
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div
            className={`fixed inset-y-0 left-0 z-40 w-64 bg-indigo-700 text-white transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="p-6">
              <h1 className="text-2xl font-bold">Spled</h1>
              <p className="text-indigo-200 text-sm">Task Splitter</p>
            </div>
            <nav className="space-y-2 px-4">
              <Link
                to="/dashboard"
                className="block px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
              >
                Dashboard
              </Link>
              <Link
                to="/dashboard/profile/edit"
                className="block px-4 py-2 rounded hover:bg-indigo-600 transition-colors"
              >
                Profile
              </Link>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 shadow-sm">
              <div className="flex items-center justify-between px-4 py-4 md:px-6">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded"
                >
                  {sidebarOpen ? (
                    <X className="w-5 h-5" />
                  ) : (
                    <Menu className="w-5 h-5" />
                  )}
                </button>

                <div className="flex items-center gap-4 ml-auto">
                  <span className="text-sm text-gray-600">
                    {localStorage.getItem('displayName') ||
                      localStorage.getItem('username')}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </header>

            {/* Page Content */}
            <main className="flex-1 overflow-auto">
              <div className="container mx-auto p-4 md:p-6">{children}</div>
            </main>
          </div>
        </div>

        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
