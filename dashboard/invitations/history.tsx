import { createFileRoute, useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/invitations/history')({
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate();

  return (
    <div className="grid gap-6">
      <div className="surface">
        <div className="surface__header flex flex-col justify-between gap-4">
          <div>
            <p className="kicker">ACCOUNT</p>
            <h1 className="text-3xl font-bold text-slate-900">
              Invitations
            </h1>
          </div>
          {/* pending/history tabs */}
          <div className="flex p-1 rounded-md gap-4 leading-6 mt-6 bg-gray-3  00 w-fit">
            <button
              type="button"
              onClick={() =>
                navigate({to: "/dashboard/invitations/pending"})
              }
              className="p-2"
            >
              Pending
            </button>
            <p className="nav-link--active p-2 rounded-sm font-medium">
              History
            </p>
          </div>
        </div>
      </div>
      {/* add the invitation cards here */}
      <div className="surface__body flex">

      </div>
    </div>
  )
}
