import { useProjects } from "@/hooks/use-projects";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { FolderKanban, Users, Calendar } from "lucide-react";

export default function Projects() {
  const { data: projects, isLoading, error } = useProjects();

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Failed to load projects" />;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Ongoing initiatives and team assignments.</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
          New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects?.map((project) => (
          <div key={project.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban className="h-6 w-6" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {project.isActive ? 'Active' : 'Completed'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
              {project.description || "No description provided for this project."}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4 text-slate-400" />
                <span>{project.teamSize || 0} Members</span>
              </div>
              <div className="text-xs text-slate-400">ID: {project.projectId}</div>
            </div>
          </div>
        ))}
      </div>
      
      {projects?.length === 0 && (
        <div className="text-center py-20">
          <div className="inline-flex items-center justify-center p-6 bg-slate-50 rounded-full mb-4">
            <FolderKanban className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-medium text-slate-900">No Projects Found</h3>
          <p className="text-slate-500 mt-2">Get started by creating your first project.</p>
        </div>
      )}
    </div>
  );
}
