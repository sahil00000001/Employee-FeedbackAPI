import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, UserCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FeedbackAssignment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";

export default function Feedback() {
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees({ active: "1" });
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<FeedbackAssignment[]>({
    queryKey: ["/api/feedback-assignment"],
  });
  const { mutate, isPending } = useSubmitFeedback();
  const { toast } = useToast();
  
  const employeesList = Array.isArray(employees?.data) ? employees.data : (Array.isArray(employees) ? employees : []);

  // Filter employees that the current user is assigned to review
  // For demo purposes, we'll assume the current user is 'EMP-001'
  const currentUserEmployeeId = "EMP-001";
  const assignedColleagueIds = assignments
    ?.filter(a => a.peers?.includes(currentUserEmployeeId))
    .map(a => a.employeeId) || [];

  const assignedColleagues = employeesList.filter((emp: any) => 
    assignedColleagueIds.includes(emp.employee_id || emp.employeeId)
  );

  const [formData, setFormData] = useState({
    employeeId: "",
    feedbackType: "assigned",
    comments: "",
    technicalSkills: [3],
    communication: [3],
    teamwork: [3],
    leadership: [3],
    problemSolving: [3],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast({ title: "Error", description: "Please select an employee.", variant: "destructive" });
      return;
    }

    const submissionData = {
      employeeId: formData.employeeId,
      reviewerId: currentUserEmployeeId, 
      reviewerName: "Jane Doe",
      feedbackType: formData.feedbackType,
      comments: formData.comments,
      technicalSkills: formData.technicalSkills[0],
      communication: formData.communication[0],
      teamwork: formData.teamwork[0],
      leadership: formData.leadership[0],
      problemSolving: formData.problemSolving[0],
      projectId: "PROJ-001"
    };

    mutate(submissionData, {
      onSuccess: () => {
        toast({ title: "Success!", description: "Feedback submitted successfully." });
        setFormData({
          employeeId: "",
          feedbackType: "assigned",
          comments: "",
          technicalSkills: [3],
          communication: [3],
          teamwork: [3],
          leadership: [3],
          problemSolving: [3],
        });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoadingEmployees || isLoadingAssignments) return <LoadingScreen />;

  const getRatingLabel = (val: number) => {
    const labels: Record<number, string> = { 1: "Poor", 2: "Fair", 3: "Good", 4: "Very Good", 5: "Excellent" };
    return labels[val] || "";
  };

  const getRatingColor = (val: number) => {
    if (val <= 2) return "text-red-500";
    if (val === 3) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Submit 360 Feedback</h1>
        <p className="text-slate-500 mt-2">Your insights help your colleagues grow.</p>
      </div>

      {assignedColleagues.length > 0 && (
        <Card className="border-none shadow-sm bg-primary/5 border border-primary/10">
          <CardContent className="p-4 flex items-center gap-3">
            <UserCheck className="h-5 w-5 text-primary" />
            <p className="text-sm font-medium text-primary">
              You have {assignedColleagues.length} assigned review(s) pending.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="bg-white rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <div className="bg-slate-50/50 p-6 border-b border-slate-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Who are you reviewing?</Label>
              <Select 
                value={formData.employeeId} 
                onValueChange={(val) => setFormData({...formData, employeeId: val})}
              >
                <SelectTrigger className="bg-white h-11 rounded-xl">
                  <SelectValue placeholder="Select a colleague..." />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md">
                  {assignedColleagues.length > 0 && (
                    <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Assigned to You
                    </div>
                  )}
                  {assignedColleagues.map((emp: any) => (
                    <SelectItem key={emp.employee_id || emp.employeeId} value={emp.employee_id || emp.employeeId}>
                      {emp.name} — {emp.role}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-t mt-1">
                    All Colleagues
                  </div>
                  {employeesList.map((emp: any) => (
                    <SelectItem key={emp.employee_id || emp.employeeId} value={emp.employee_id || emp.employeeId}>
                      {emp.name} — {emp.role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Feedback Context</Label>
              <Select 
                value={formData.feedbackType} 
                onValueChange={(val) => setFormData({...formData, feedbackType: val})}
              >
                <SelectTrigger className="bg-white h-11 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md">
                  <SelectItem value="assigned">Assigned Review</SelectItem>
                  <SelectItem value="optional">Unsolicited Feedback</SelectItem>
                  <SelectItem value="project">Project Completion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <h3 className="text-lg font-bold text-slate-900 pb-2 border-b border-slate-100">Competency Ratings</h3>
          
          <div className="space-y-8">
            {[
              { id: 'technicalSkills', label: 'Technical Skills', desc: 'Job knowledge, technical proficiency' },
              { id: 'communication', label: 'Communication', desc: 'Clarity, listening, responsiveness' },
              { id: 'teamwork', label: 'Teamwork', desc: 'Collaboration, supportiveness, attitude' },
              { id: 'leadership', label: 'Leadership', desc: 'Initiative, mentoring, ownership' },
              { id: 'problemSolving', label: 'Problem Solving', desc: 'Critical thinking, solution-oriented' },
            ].map((field) => (
              <div key={field.id} className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <Label className="text-base font-semibold">{field.label}</Label>
                    <p className="text-xs text-slate-500 mt-0.5">{field.desc}</p>
                  </div>
                  <div className={`font-bold ${getRatingColor((formData as any)[field.id][0])}`}>
                    {getRatingLabel((formData as any)[field.id][0])} ({(formData as any)[field.id][0]}/5)
                  </div>
                </div>
                <Slider
                  value={(formData as any)[field.id]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(val) => setFormData({...formData, [field.id]: val})}
                  className="py-4"
                />
                <div className="flex justify-between text-xs text-slate-400 px-1">
                  <span>Poor</span>
                  <span>Excellent</span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100">
            <Label className="text-base font-semibold">Additional Comments</Label>
            <p className="text-xs text-slate-500 mb-3">Provide context for your ratings (optional but encouraged)</p>
            <Textarea 
              className="min-h-[120px] rounded-xl resize-none" 
              placeholder="Share specific examples..."
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
            />
          </div>
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button 
            onClick={handleSubmit}
            disabled={isPending}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:transform-none"
          >
            {isPending ? "Submitting..." : (
              <>
                Submit Feedback <Send className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
