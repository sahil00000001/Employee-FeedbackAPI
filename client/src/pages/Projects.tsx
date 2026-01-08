import { useProjects } from "@/hooks/use-projects";
import { useEmployees } from "@/hooks/use-employees";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { FolderKanban, Users, Calendar, UserPlus, X, Check } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useFeedbackAssignments, useAssignReviewer, useRemoveReviewer } from "@/hooks/use-feedback-assignment";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const { data: projects, isLoading: projectsLoading, error: projectsError } = useProjects();
  const { data: employees, isLoading: employeesLoading } = useEmployees();
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isAssignOpen, setIsAssignOpen] = useState(false);

  if (projectsLoading || employeesLoading) return <LoadingScreen />;
  if (projectsError) return <ErrorScreen message="Failed to load projects" />;

  const projectsList = Array.isArray(projects?.data) ? projects.data : (Array.isArray(projects) ? projects : []);
  const employeesList = Array.isArray(employees?.data) ? employees.data : (Array.isArray(employees) ? employees : []);

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
        {projectsList.map((project) => (
          <div 
            key={project.project_id || project.id} 
            className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md hover:border-primary/20 transition-all group cursor-pointer"
            onClick={() => {
              setSelectedProject(project);
              setIsAssignOpen(true);
            }}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <FolderKanban className="h-6 w-6" />
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${project.active !== 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                {project.active !== 0 ? 'Active' : 'Completed'}
              </span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">{project.name}</h3>
            <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">
              {project.description || "No description provided for this project."}
            </p>
            
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Users className="h-4 w-4 text-slate-400" />
                <span>{Array.isArray(project.people) ? project.people.length : 0} Members</span>
              </div>
              <div className="text-xs text-slate-400">ID: {project.project_id || project.projectId}</div>
            </div>
          </div>
        ))}
      </div>

      <AssignFeedbackDialog 
        project={selectedProject} 
        open={isAssignOpen} 
        onOpenChange={setIsAssignOpen}
        employees={employeesList}
      />
      
      {projectsList.length === 0 && (
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

function AssignFeedbackDialog({ project, open, onOpenChange, employees }: any) {
  const [selectedEmpId, setSelectedEmpId] = useState<string>("");
  const projectMembers = project ? employees.filter((e: any) => project.people?.includes(e.employee_id)) : [];
  const selectedEmployee = projectMembers.find((e: any) => e.employee_id === selectedEmpId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Manage Project Feedback: {project?.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Team Member to Assign Reviewers</label>
            <Select value={selectedEmpId} onValueChange={setSelectedEmpId}>
              <SelectTrigger className="w-full rounded-xl">
                <SelectValue placeholder="Choose a member..." />
              </SelectTrigger>
              <SelectContent>
                {projectMembers.map((emp: any) => (
                  <SelectItem key={emp.employee_id} value={emp.employee_id}>
                    {emp.name} ({emp.designation})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEmployee && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">{selectedEmployee.name}</h4>
                  <p className="text-sm text-slate-500">{selectedEmployee.designation} • {selectedEmployee.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Project ID</p>
                  <p className="text-sm font-semibold text-slate-700">{project.project_id}</p>
                </div>
              </div>

              <ReviewerAssignment 
                employee={selectedEmployee} 
                project={project}
                allEmployees={employees}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ReviewerAssignment({ employee, project, allEmployees }: any) {
  const { data: assignmentData, isLoading } = useFeedbackAssignments(employee.employee_id);
  const assignMutation = useAssignReviewer();
  const removeMutation = useRemoveReviewer();
  const { toast } = useToast();
  const [newReviewerId, setNewReviewerId] = useState("");

  const assignments = assignmentData?.data?.assigned || [];
  
  // Members who are NOT the employee themselves and NOT already assigned
  const availableReviewers = allEmployees.filter((e: any) => 
    e.employee_id !== employee.employee_id && 
    !assignments.find((a: any) => a.reviewer_id === e.employee_id)
  );

  const handleAssign = () => {
    if (!newReviewerId) return;
    const reviewer = allEmployees.find((e: any) => e.employee_id === newReviewerId);
    if (!reviewer) return;

    assignMutation.mutate({
      employee_id: employee.employee_id,
      name: employee.name,
      manager_id: project.manager || "",
      reviewer_id: reviewer.employee_id,
      reviewer_name: reviewer.name
    }, {
      onSuccess: () => {
        setNewReviewerId("");
        toast({
          title: "Reviewer Assigned",
          description: `${reviewer.name} has been assigned to review ${employee.name}.`,
        });
      }
    });
  };

  const handleRemove = (reviewerId: string, reviewerName: string) => {
    removeMutation.mutate({
      employee_id: employee.employee_id,
      reviewer_id: reviewerId
    }, {
      onSuccess: () => {
        toast({
          title: "Reviewer Removed",
          description: `Removed ${reviewerName} as a reviewer.`,
        });
      }
    });
  };

  if (isLoading) return <div className="py-8 text-center text-slate-500">Loading assignments...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-semibold text-slate-900">Assigned Reviewers</h5>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
          {assignments.length} assigned
        </span>
      </div>

      <div className="space-y-2">
        {assignments.map((reviewer: any) => (
          <div key={reviewer.reviewer_id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-white group hover:border-red-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                {reviewer.reviewer_name.split(" ").map((n: any) => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">{reviewer.reviewer_name}</p>
                <p className="text-[10px] text-slate-400">Assigned on {new Date(reviewer.assigned_date).toLocaleDateString()}</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
              onClick={() => handleRemove(reviewer.reviewer_id, reviewer.reviewer_name)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {assignments.length === 0 && (
          <div className="py-8 text-center border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
            No reviewers assigned yet.
          </div>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Add New Reviewer</label>
        <div className="flex gap-2">
          <Select value={newReviewerId} onValueChange={setNewReviewerId}>
            <SelectTrigger className="flex-1 rounded-xl">
              <SelectValue placeholder="Select a person to assign..." />
            </SelectTrigger>
            <SelectContent>
              {availableReviewers.map((emp: any) => (
                <SelectItem key={emp.employee_id} value={emp.employee_id}>
                  {emp.name} ({emp.department})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            disabled={!newReviewerId || assignMutation.isPending}
            onClick={handleAssign}
            className="rounded-xl px-4"
          >
            {assignMutation.isPending ? "..." : <UserPlus className="h-4 w-4 mr-2" />}
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
}
