import { useQuery, useMutation } from "@tanstack/react-query";
import { Employee, Manager, Project, FeedbackAssignment } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useState } from "react";
import { Users, FolderKanban, CheckCircle2 } from "lucide-react";

export default function Managers() {
  const { toast } = useToast();
  const [selectedManager, setSelectedManager] = useState<string>("");
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [selectedReviewers, setSelectedReviewers] = useState<Record<string, string[]>>({});

  const { data: managersData, isLoading: loadingManagers } = useQuery<any>({
    queryKey: ["/api/managers"],
  });

  const { data: projectsData, isLoading: loadingProjects } = useQuery<any>({
    queryKey: ["/api/projects"],
  });

  const { data: employeesData, isLoading: loadingEmployees } = useQuery<any>({
    queryKey: ["/api/employees"],
  });

  const { data: assignmentsData } = useQuery<any>({
    queryKey: ["/api/feedback-assignment"],
    enabled: !!selectedManager,
  });

  const mutation = useMutation({
    mutationFn: async (data: { employeeId: string; managerId: string; peers: string[] }) => {
      console.log("Submitting assignment:", data);
      const res = await apiRequest("POST", "/api/feedback-assignment", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/feedback-assignment"] });
      toast({
        title: "Success",
        description: "Reviewers assigned successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Assignment error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (loadingManagers || loadingProjects || loadingEmployees) return <LoadingScreen />;

  const managersList = Array.isArray(managersData?.data) ? managersData.data : (Array.isArray(managersData) ? managersData : []);
  const projectsList = Array.isArray(projectsData?.data) ? projectsData.data : (Array.isArray(projectsData) ? projectsData : []);
  const employeesList = Array.isArray(employeesData?.data) ? employeesData.data : (Array.isArray(employeesData) ? employeesData : []);
  const assignmentsList = Array.isArray(assignmentsData?.data) ? assignmentsData.data : (Array.isArray(assignmentsData) ? assignmentsData : []);

  const handleReviewerChange = (employeeId: string, reviewerId: string, index: number) => {
    setSelectedReviewers(prev => {
      const currentAssignment = assignmentsList.find((a: any) => a.employeeId === employeeId);
      const current = [...(prev[employeeId] || currentAssignment?.peers || ["", ""])];
      
      if (reviewerId === "REMOVE_SELECTION") {
        current[index] = "";
        return { ...prev, [employeeId]: current };
      }

      // Check if this reviewer is already selected for another slot
      if (reviewerId !== "" && current.some((id, i) => i !== index && id === reviewerId)) {
        toast({
          title: "Selection Error",
          description: "This reviewer is already selected for this person.",
          variant: "destructive",
        });
        return prev;
      }

      current[index] = reviewerId;
      return { ...prev, [employeeId]: current };
    });
  };

  const handleSave = (employeeId: string) => {
    const currentAssignment = assignmentsList.find((a: any) => a.employeeId === employeeId);
    const peers = selectedReviewers[employeeId] || currentAssignment?.peers || [];
    const validPeers = peers.filter(p => p && p !== "" && p !== "REMOVE_SELECTION");
    
    if (validPeers.length === 0) {
      toast({
        title: "Selection Required",
        description: "Please select at least one reviewer.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate({
      employeeId,
      managerId: selectedManager,
      peers: validPeers,
    });
  };

  const filteredEmployees = employeesList.filter((emp: any) => {
    if (!selectedProject) return false;
    const empProjectId = emp.project || emp.projectId || emp.project_id;
    return empProjectId === selectedProject;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Manager Dashboard</h1>
        <p className="text-slate-500 mt-2">Select reviewers for your team members</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" /> Select Manager
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedManager} onValueChange={setSelectedManager}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a manager" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                {managersList.map((m: any) => (
                  <SelectItem key={m._id || m.id} value={m.manager_id || m.managerId}>{m.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary" /> Select Project
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-md">
                {projectsList.map((p: any) => (
                  <SelectItem key={p._id || p.id} value={p.project_id || p.projectId}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      {selectedManager && selectedProject && (
        <div className="grid grid-cols-1 gap-4">
          {filteredEmployees.length > 0 ? (
            filteredEmployees.map((employee: any) => {
              const empId = employee.employee_id || employee.employeeId;
              const currentAssignment = assignmentsList.find((a: any) => a.employeeId === empId);
              const reviewers = selectedReviewers[empId] || currentAssignment?.peers || ["", ""];
              
              return (
                <Card key={employee._id || employee.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                      <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                      <p className="text-sm text-slate-500">{employee.designation || employee.role}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      {[0, 1].map((idx) => {
                        const currentVal = reviewers[idx] || "";
                        return (
                          <div key={idx} className="w-48">
                            <Select 
                              value={currentVal}
                              onValueChange={(val) => handleReviewerChange(empId, val, idx)}
                            >
                              <SelectTrigger className="bg-white">
                                <SelectValue placeholder={`Select Reviewer ${idx + 1}`} />
                              </SelectTrigger>
                              <SelectContent className="bg-white border shadow-md">
                                <SelectItem value="REMOVE_SELECTION">None</SelectItem>
                                {employeesList
                                  .filter((e: any) => {
                                    const itemEmpId = e.employee_id || e.employeeId;
                                    // Don't show the employee being reviewed
                                    if (itemEmpId === empId) return false;
                                    // Don't show if already selected in ANY slot for this employee
                                    if (reviewers.includes(itemEmpId) && reviewers[idx] !== itemEmpId) return false;
                                    return true;
                                  })
                                  .map((e: any) => (
                                    <SelectItem key={e._id || e.id} value={e.employee_id || e.employeeId}>{e.name}</SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          </div>
                        );
                      })}
                      <Button 
                        onClick={() => handleSave(empId)}
                        disabled={mutation.isPending}
                        className="gap-2"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Assign
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed">
              <p className="text-slate-400">No team members found for this project.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
