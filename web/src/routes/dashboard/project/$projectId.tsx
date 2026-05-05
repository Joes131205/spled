import { projectApi } from "#/utils/api";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Edit2, Trash2, CheckCircle2, Circle } from "lucide-react";

export const Route = createFileRoute("/dashboard/project/$projectId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const projRes = await projectApi.get(`/projects/${projectId}`);
        setProject(projRes.data);

        const tasksRes = await projectApi.get(`/tasks?projectId=${projectId}`);
        setTasks(tasksRes.data || []);
      } catch (e) {
        console.error("Failed to load project", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      await projectApi.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
    } catch (e) {
      console.error("Failed to delete task", e);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!project) {
    return <div className="text-center py-12 text-red-600">Project not found</div>;
  }

  const getWeightColor = (weight: string) => {
    switch (weight) {
      case "EASY": return "bg-green-100 text-green-800";
      case "MEDIUM": return "bg-yellow-100 text-yellow-800";
      case "HARD": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE": return "text-green-600";
      case "IN_PROGRESS": return "text-blue-600";
      case "PENDING": return "text-gray-400";
      default: return "text-gray-400";
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Projects
      </button>

      {/* Project Header */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8 mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
          <Link
            to={`/dashboard/project/${projectId}/edit`}
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-2"
          >
            <Edit2 className="w-5 h-5" />
            Edit
          </Link>
        </div>
      </div>

      {/* Tasks Section */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
          <Link
            to={`/dashboard/task/create?projectId=${projectId}`}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-600">
            No tasks yet. Create one to get started!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Weight</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Assigned To</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-gray-900">{task.name}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getWeightColor(task.weight)}`}>
                        {task.weight}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`flex items-center gap-1 text-sm ${getStatusColor(task.status)}`}>
                        {task.status === "DONE" ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                        {task.status}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {task.assignedTo || "Unassigned"}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
