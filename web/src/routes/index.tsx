import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
    component: Home,
    beforeLoad: async () => {
        throw redirect({
            to: "/login",
        });
    },
});

function Home() {
    return null;
}
