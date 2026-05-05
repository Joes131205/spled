import { projectApi } from "#/utils/api";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Edit2, Trash2, Users, Calendar } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
    component: RouteComponent,
});

function RouteComponent() {
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const load = async () => {
            try {
                const res = await projectApi.get("/projects");
                setProjects(res.data || []);
            } catch (e) {
                console.error("Failed to load projects", e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;
        try {
            await projectApi.delete(`/projects/${id}`);
            setProjects(projects.filter(p => p.id !== id));
        } catch (e) {
            console.error("Failed to delete project", e);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
                    <p className="text-gray-600 mt-1">Manage your group tasks and contributions</p>
                </div>
                <button
                    onClick={() => navigate({ to: "/dashboard/project/create" })}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    New Project
                </button>
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-12">
                    <p className="text-gray-600">Loading projects...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && projects.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-600 mb-4">No projects yet</p>
                    <button
                        onClick={() => navigate({ to: "/dashboard/project/create" })}
                        className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Create Your First Project
                    </button>
                </div>
            )}

            {/* Projects Grid */}
            {!loading && projects.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            to={`/dashboard/project/${project.id}`}
                            className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden cursor-pointer"
                        >
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{project.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>

                                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <Users className="w-4 h-4" />
                                        <span>Leader</span>
                                    </div>
                                    {project.endDate && (
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(project.endDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            navigate({ to: `/dashboard/project/${project.id}/edit` });
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleDelete(project.id);
                                        }}
                                        className="flex-1 flex items-center justify-center gap-2 py-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
