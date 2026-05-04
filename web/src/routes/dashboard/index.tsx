import { projectApi } from "#/utils/api";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/dashboard/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [projects, setProjects] = useState<any[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        // placeholder fetch
        const load = async () => {
            try {
                const res = await projectApi.get("/projects");
                setProjects(res.data || []);
            } catch (e) {}
        };
        load();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
            <button
                onClick={() => navigate({ to: "/dashboard/project/create" })}
            >
                New Project
            </button>
            <ul>
                {projects.map((p) => (
                    <li key={p.id}>{p.name}</li>
                ))}
            </ul>
        </div>
    );
}
