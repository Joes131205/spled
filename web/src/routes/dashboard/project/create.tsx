import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/dashboard/project/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/dashboard/project/create"!</div>
}
