import { projectApi } from "#/utils/api";
import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/dashboard/project/$projectId/edit")({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = useParams({ from: "/dashboard/project/$projectId/edit" });
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await projectApi.get(`/projects/${projectId}`);
        setFormData({
          name: res.data.name || "",
          description: res.data.description || "",
          endDate: res.data.endDate ? new Date(res.data.endDate).toISOString().split('T')[0] : "",
        });
      } catch (e) {
        setError("Failed to load project");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Project name is required");
      return;
    }

    setSubmitting(true);
    try {
      await projectApi.patch(`/projects/${projectId}`, formData);
      navigate({ to: "/dashboard" });
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update project");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div>
      <button
        onClick={() => navigate({ to: "/dashboard" })}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Projects
      </button>

      <div className="max-w-2xl bg-white rounded-lg shadow border border-gray-200 p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Project</h1>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
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
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3 rounded-lg transition-colors"
            >
              {submitting ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: "/dashboard" })}
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
