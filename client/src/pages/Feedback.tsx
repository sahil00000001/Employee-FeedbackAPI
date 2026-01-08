import { useState } from "react";
import { useEmployees } from "@/hooks/use-employees";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Star } from "lucide-react";
import { z } from "zod";

export default function Feedback() {
  const { data: employees, isLoading } = useEmployees({ active: "1" });
  const { mutate, isPending } = useSubmitFeedback();
  const { toast } = useToast();
  
  // Local state for the form
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

    // Hardcoded reviewer for demo purposes
    const submissionData = {
      employeeId: formData.employeeId,
      reviewerId: "USER-CURRENT", 
      reviewerName: "Jane Doe",
      feedbackType: formData.feedbackType,
      comments: formData.comments,
      technicalSkills: formData.technicalSkills[0],
      communication: formData.communication[0],
      teamwork: formData.teamwork[0],
      leadership: formData.leadership[0],
      problemSolving: formData.problemSolving[0],
      projectId: "PROJ-001" // Optional
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

  if (isLoading) return <LoadingScreen />;

  const getRatingLabel = (val: number) => {
    if (val === 1) return "Poor";
    if (val === 2) return "Fair";
    if (val === 3) return "Good";
    if (val === 4) return "Very Good";
    if (val === 5) return "Excellent";
    return "";
  };

  const getRatingColor = (val: number) => {
    if (val <= 2) return "text-red-500";
    if (val === 3) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900">Submit 360 Feedback</h1>
        <p className="text-slate-500 mt-2">Your insights help your colleagues grow.</p>
      </div>

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
                <SelectContent>
                  {employees?.map((emp) => (
                    <SelectItem key={emp.employeeId} value={emp.employeeId}>
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
                <SelectContent>
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
            {isPending ? (
              "Submitting..."
            ) : (
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
