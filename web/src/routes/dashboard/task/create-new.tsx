import { projectApi } from "#/utils/api";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/task/create-new")({
  component: RouteComponent,
  validateSearch: (search: Record<string, any>) => ({
    projectId: search.projectId as string,
  }),
});

function RouteComponent() {
  const { projectId } = useSearch({ from: "/dashboard/task/create" });
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight: "MEDIUM",
    deadline: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Task name is required");
      return;
    }

    setLoading(true);
    try {
      await projectApi.post("/tasks", {
        ...formData,
        projectId: projectId,
      });
      navigate({ to: `/dashboard/project/${projectId}` });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => navigate({ to: `/dashboard/project/${projectId}` })}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Project
      </button>

      <div className="max-w-2xl bg-white rounded-lg shadow border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Task</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Design homepage mockup"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what needs to be done"
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight
              </label>
              <select
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline
              </label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              {loading ? "Creating..." : "Create Task"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: `/dashboard/project/${projectId}` })}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
