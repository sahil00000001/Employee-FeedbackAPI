import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { LoadingScreen } from "@/components/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, UserCheck, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { FeedbackAssignment } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { InteractiveFeedbackForm } from "@/components/InteractiveFeedbackForm";

export default function Feedback() {
  const { data: employees, isLoading: isLoadingEmployees } = useEmployees({ active: "1" });
  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<FeedbackAssignment[]>({
    queryKey: ["/api/feedback-assignment"],
  });
  const { mutate, isPending } = useSubmitFeedback();
  const { toast } = useToast();
  
  const employeesList = Array.isArray(employees?.data) ? employees.data : (Array.isArray(employees) ? employees : []);

  const currentUserEmployeeId = "0001";
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
    strengths: "",
    areasOfImprovement: "",
    detailedRatings: [] as any[],
  });

  const selectedEmployee = employeesList.find((emp: any) => (emp.employee_id || emp.employeeId) === formData.employeeId);
  const employeeRole = selectedEmployee?.designation || "Developer";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.employeeId) {
      toast({ title: "Error", description: "Please select an employee.", variant: "destructive" });
      return;
    }

    const submissionData = {
      employeeId: formData.employeeId,
      name: selectedEmployee?.name,
      reviewerId: currentUserEmployeeId, 
      reviewerName: "Harry Pod",
      feedbackType: formData.feedbackType,
      comments: formData.comments,
      strengths: formData.strengths,
      areasOfImprovement: formData.areasOfImprovement,
      detailedRatings: formData.detailedRatings,
      technicalSkills: 3,
      communication: 3,
      teamwork: 3,
      leadership: 3,
      problemSolving: 3,
      projectId: selectedEmployee?.project || "Management"
    };

    mutate(submissionData, {
      onSuccess: () => {
        toast({ title: "Success!", description: "Feedback submitted successfully." });
        setFormData({
          employeeId: "",
          feedbackType: "assigned",
          comments: "",
          strengths: "",
          areasOfImprovement: "",
          detailedRatings: [],
        });
      },
      onError: (err) => {
        toast({ title: "Error", description: err.message, variant: "destructive" });
      }
    });
  };

  if (isLoadingEmployees || isLoadingAssignments) return <LoadingScreen />;

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
                      {emp.name} — {emp.designation}
                    </SelectItem>
                  ))}
                  <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider border-t mt-1">
                    All Colleagues
                  </div>
                  {employeesList.map((emp: any) => (
                    <SelectItem key={emp.employee_id || emp.employeeId} value={emp.employee_id || emp.employeeId}>
                      {emp.name} — {emp.designation}
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
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-lg font-bold text-slate-900">Performance Review</h3>
            {formData.employeeId && (
              <div className="flex items-center gap-2 text-primary text-xs font-semibold bg-primary/5 px-3 py-1 rounded-full border border-primary/10">
                <Sparkles className="h-3 w-3" /> Custom {employeeRole} Template
              </div>
            )}
          </div>
          
          {formData.employeeId ? (
            <InteractiveFeedbackForm 
              role={employeeRole} 
              onUpdate={(detailedRatings) => setFormData(prev => ({ ...prev, detailedRatings }))}
            />
          ) : (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-400 font-medium">Please select a colleague above to start the review</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-100">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Key Strengths</Label>
              <Textarea 
                className="min-h-[100px] rounded-xl bg-slate-50/30 border-slate-100 focus:bg-white transition-colors" 
                placeholder="What does this person do exceptionally well?"
                value={formData.strengths}
                onChange={(e) => setFormData({...formData, strengths: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-slate-700">Areas for Growth</Label>
              <Textarea 
                className="min-h-[100px] rounded-xl bg-slate-50/30 border-slate-100 focus:bg-white transition-colors" 
                placeholder="Where could they improve or develop further?"
                value={formData.areasOfImprovement}
                onChange={(e) => setFormData({...formData, areasOfImprovement: e.target.value})}
              />
            </div>
          </div>

          <div className="pt-2">
            <Label className="text-sm font-semibold text-slate-700">Closing Comments</Label>
            <Textarea 
              className="min-h-[80px] rounded-xl bg-slate-50/30 border-slate-100 focus:bg-white transition-colors" 
              placeholder="Any final thoughts or overall impression..."
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
