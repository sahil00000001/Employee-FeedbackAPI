import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ChevronRight, ChevronLeft, Plus, Trash2, Save } from "lucide-react";

export default function KRAAssessmentForm({ employeeId }: { employeeId: string }) {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<any>(null);

  const { data: employeeData, isLoading: empLoading } = useQuery<any>({
    queryKey: ["/api/employees", employeeId],
    enabled: !!employeeId,
  });

  const { data: existingAssessment, isLoading: assessmentLoading } = useQuery<any>({
    queryKey: ["/api/kra", employeeId],
    enabled: !!employeeId,
  });

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/kra", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Assessment saved successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/kra", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  });

  useEffect(() => {
    if (employeeData?.data && !formData) {
      const emp = employeeData.data;
      const initialData = {
        employee_id: emp.employee_id,
        employee_name: emp.name,
        employee_email: emp.email,
        designation: emp.designation,
        department: emp.department,
        assessment_year: 2025,
        assessment_period: "2024-2025",
        status: "Draft",
        educational_background: [],
        achievements: [],
        contributions: {
          projects: [],
          initiatives: [],
          process_improvements: []
        },
        learning_growth: {
          skills_acquired: [],
          training_courses: []
        },
        ctc_information: {
          current_ctc: 0,
          expected_ctc: 0,
          justification: ""
        },
        kra_metrics: [],
        overall_assessment: {
          strengths: [],
          areas_of_improvement: []
        }
      };

      if (existingAssessment?.data) {
        setFormData({ ...initialData, ...existingAssessment.data });
      } else {
        setFormData(initialData);
      }
    }
  }, [employeeData, existingAssessment, formData]);

  if (empLoading || assessmentLoading) return <LoadingScreen />;
  if (!formData) return <div className="flex items-center justify-center min-h-[400px]">Initializing form...</div>;

  const isCompleted = (formData?.status || "").toLowerCase() === "completed" || (formData?.status || "").toLowerCase() === "submitted";

  const handleSave = (isFinal = false) => {
    if (!formData || isCompleted) return;
    
    const currentStatus = formData?.status || "Draft";
    const newStatus = isFinal ? "Completed" : currentStatus;
    
    const dataToSave = { 
      ...formData, 
      status: newStatus
    };
    mutation.mutate(dataToSave);
  };

  const addArrayItem = (path: string, defaultValue: any) => {
    if (isCompleted) return;
    const newData = { ...formData };
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    const last = parts[parts.length - 1];
    if (!current[last]) current[last] = [];
    current[last].push(defaultValue);
    setFormData(newData);
  };

  const removeArrayItem = (path: string, index: number) => {
    if (isCompleted) return;
    const newData = { ...formData };
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    const last = parts[parts.length - 1];
    current[last].splice(index, 1);
    setFormData(newData);
  };

  const updateField = (path: string, value: any) => {
    if (isCompleted) return;
    const newData = { ...formData };
    let current = newData;
    const parts = path.split('.');
    for (let i = 0; i < parts.length - 1; i++) {
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = value;
    setFormData(newData);
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">KRA Assessment</h1>
          <p className="text-slate-500 font-medium">Step {step} of 6: {getStepTitle(step)}</p>
        </div>
        <div className="flex items-center gap-3">
          {!isCompleted && (
            <Button variant="outline" onClick={() => handleSave(false)} disabled={mutation.isPending} className="rounded-2xl h-12 px-6 font-bold border-2 hover:bg-slate-50 transition-all">
              <Save className="h-5 w-5 mr-2" />
              {mutation.isPending ? "Saving..." : "Save Draft"}
            </Button>
          )}
          {isCompleted && (
            <div className="bg-emerald-100 text-emerald-700 px-4 py-2 rounded-2xl font-bold border border-emerald-200 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Assessment Completed
            </div>
          )}
          <div className="flex bg-slate-100 p-1.5 rounded-2xl">
            <Button variant="ghost" size="icon" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="rounded-xl h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setStep(Math.min(6, step + 1))} disabled={step === 6} className="rounded-xl h-9 w-9">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`h-2 rounded-full transition-all duration-500 ${step >= i ? 'bg-primary shadow-sm shadow-primary/20' : 'bg-slate-200'}`} />
        ))}
      </div>

      <Card className="border-2 shadow-2xl shadow-slate-200/50 rounded-[2rem] overflow-hidden border-slate-100">
        <CardContent className="p-8 sm:p-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-500 ml-1">Full Name</Label>
                  <Input value={formData.employee_name} readOnly className="h-14 rounded-2xl bg-slate-50/50 border-2 font-semibold text-lg px-6" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-500 ml-1">Email</Label>
                  <Input value={formData.employee_email} readOnly className="h-14 rounded-2xl bg-slate-50/50 border-2 font-semibold text-lg px-6" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-500 ml-1">Designation</Label>
                  <Input value={formData.designation} readOnly className="h-14 rounded-2xl bg-slate-50/50 border-2 font-semibold text-lg px-6" />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-500 ml-1">Department</Label>
                  <Input value={formData.department} readOnly className="h-14 rounded-2xl bg-slate-50/50 border-2 font-semibold text-lg px-6" />
                </div>
              </div>
              
              <div className="pt-8 border-t-2 border-slate-50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-slate-800">Educational Background</h3>
                  {!isCompleted && (
                    <Button variant="outline" size="sm" onClick={() => addArrayItem('educational_background', { field_name: "", field_value: "", field_type: "text" })} className="rounded-xl border-2 font-bold hover:bg-primary hover:text-white hover:border-primary transition-all">
                      <Plus className="h-4 w-4 mr-2" /> Add Qualification
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4">
                  {formData.educational_background.map((edu: any, idx: number) => (
                    <div key={idx} className="flex items-end gap-4 p-6 rounded-3xl bg-slate-50/30 border-2 border-slate-100 hover:border-primary/20 transition-all group">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Field Name</Label>
                          <Input value={edu.field_name} onChange={(e) => updateField(`educational_background.${idx}.field_name`, e.target.value)} placeholder="e.g. Highest Qualification" readOnly={isCompleted} className="h-12 rounded-xl border-2 focus:ring-4" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Field Value</Label>
                          <Input value={edu.field_value} onChange={(e) => updateField(`educational_background.${idx}.field_value`, e.target.value)} readOnly={isCompleted} className="h-12 rounded-xl border-2 focus:ring-4" />
                        </div>
                      </div>
                      {!isCompleted && (
                        <Button variant="ghost" size="icon" onClick={() => removeArrayItem('educational_background', idx)} className="h-12 w-12 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all mb-0.5">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-black text-slate-900">Key Achievements</h3>
                {!isCompleted && (
                  <Button variant="outline" onClick={() => addArrayItem('achievements', { title: "", category: "Project", description: "", date: "", impact_level: "Medium" })} className="rounded-2xl border-2 font-bold px-6 py-6 h-auto">
                    <Plus className="h-5 w-5 mr-2" /> New Achievement
                  </Button>
                )}
              </div>
              <div className="space-y-6">
                {formData.achievements.map((ach: any, idx: number) => (
                  <div key={idx} className="p-8 rounded-[2rem] bg-white border-2 border-slate-100 shadow-sm hover:shadow-xl transition-all relative">
                    {!isCompleted && (
                      <Button variant="ghost" size="icon" onClick={() => removeArrayItem('achievements', idx)} className="absolute top-4 right-4 h-10 w-10 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-500 ml-1">Achievement Title</Label>
                        <Input value={ach.title} onChange={(e) => updateField(`achievements.${idx}.title`, e.target.value)} readOnly={isCompleted} className="h-14 rounded-2xl border-2 font-semibold px-6" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-500 ml-1">Impact Level</Label>
                        <select value={ach.impact_level} onChange={(e) => updateField(`achievements.${idx}.impact_level`, e.target.value)} disabled={isCompleted} className="w-full h-14 rounded-2xl border-2 font-semibold px-6 bg-white outline-none focus:ring-4 focus:ring-primary/10 transition-all">
                          <option value="High">High Impact</option>
                          <option value="Medium">Medium Impact</option>
                          <option value="Low">Low Impact</option>
                        </select>
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <Label className="text-sm font-bold text-slate-500 ml-1">Description</Label>
                        <Textarea value={ach.description} onChange={(e) => updateField(`achievements.${idx}.description`, e.target.value)} readOnly={isCompleted} className="min-h-[120px] rounded-[1.5rem] border-2 font-medium p-6" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
             <div className="space-y-8 animate-in fade-in duration-300">
               <h3 className="text-2xl font-black text-slate-900 mb-4">Project Contributions</h3>
               {formData.contributions.projects.map((proj: any, idx: number) => (
                 <div key={idx} className="p-8 rounded-[2rem] bg-slate-50/50 border-2 border-slate-100 relative group transition-all">
                    {!isCompleted && (
                      <Button variant="ghost" size="icon" onClick={() => removeArrayItem('contributions.projects', idx)} className="absolute top-4 right-4 h-10 w-10 rounded-full text-slate-300 hover:text-red-500 hover:bg-red-50">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-500">Project Name</Label>
                        <Input value={proj.project_name} onChange={(e) => updateField(`contributions.projects.${idx}.project_name`, e.target.value)} readOnly={isCompleted} className="h-14 rounded-2xl border-2 px-6" />
                      </div>
                      <div className="space-y-3">
                        <Label className="text-sm font-bold text-slate-500">Role</Label>
                        <Input value={proj.role} onChange={(e) => updateField(`contributions.projects.${idx}.role`, e.target.value)} readOnly={isCompleted} className="h-14 rounded-2xl border-2 px-6" />
                      </div>
                      <div className="md:col-span-2 space-y-3">
                        <Label className="text-sm font-bold text-slate-500">Key Outcome</Label>
                        <Textarea value={proj.outcome} onChange={(e) => updateField(`contributions.projects.${idx}.outcome`, e.target.value)} readOnly={isCompleted} className="rounded-2xl border-2 p-6" />
                      </div>
                    </div>
                 </div>
               ))}
               {!isCompleted && (
                 <Button variant="outline" onClick={() => addArrayItem('contributions.projects', { project_name: "", role: "", outcome: "", status: "In Progress" })} className="w-full py-8 border-dashed border-4 rounded-[2rem] text-slate-400 hover:text-primary hover:border-primary transition-all font-black text-xl">
                   <Plus className="h-8 w-8 mr-3" /> Add Project Contribution
                 </Button>
               )}
             </div>
          )}

          {step === 4 && (
             <div className="space-y-8 animate-in fade-in duration-300">
               <h3 className="text-2xl font-black text-slate-900 mb-6">Learning & Growth</h3>
               <div className="space-y-12">
                 <div>
                   <div className="flex items-center justify-between mb-6">
                     <h4 className="text-lg font-bold text-slate-700">Skills Acquired</h4>
                     {!isCompleted && (
                       <Button variant="outline" size="sm" onClick={() => addArrayItem('learning_growth.skills_acquired', { skill_name: "", proficiency_level: "Intermediate", acquired_date: "", how_acquired: "On-the-job" })} className="rounded-xl border-2">
                         <Plus className="h-4 w-4 mr-2" /> Add Skill
                       </Button>
                     )}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     {formData.learning_growth.skills_acquired.map((skl: any, idx: number) => (
                       <div key={idx} className="p-6 rounded-3xl bg-white border-2 border-slate-100 flex items-start gap-4">
                         <div className="flex-1 space-y-4">
                           <Input value={skl.skill_name} onChange={(e) => updateField(`learning_growth.skills_acquired.${idx}.skill_name`, e.target.value)} placeholder="Skill name" readOnly={isCompleted} className="rounded-xl" />
                           <select value={skl.proficiency_level} onChange={(e) => updateField(`learning_growth.skills_acquired.${idx}.proficiency_level`, e.target.value)} disabled={isCompleted} className="w-full h-10 px-3 rounded-xl border-2 bg-white outline-none">
                             <option value="Beginner">Beginner</option>
                             <option value="Intermediate">Intermediate</option>
                             <option value="Advanced">Advanced</option>
                           </select>
                         </div>
                         {!isCompleted && (
                           <Button variant="ghost" size="icon" onClick={() => removeArrayItem('learning_growth.skills_acquired', idx)} className="text-slate-300 hover:text-red-500">
                             <Trash2 className="h-5 w-5" />
                           </Button>
                         )}
                       </div>
                     ))}
                   </div>
                 </div>
               </div>
             </div>
          )}

          {step === 5 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-6">KRA Metrics & Performance</h3>
              <div className="space-y-8">
                {formData.kra_metrics.map((kra: any, idx: number) => (
                  <div key={idx} className="p-8 rounded-[2rem] border-2 border-slate-100 bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <Input value={kra.kra_title} onChange={(e) => updateField(`kra_metrics.${idx}.kra_title`, e.target.value)} placeholder="KRA Title" readOnly={isCompleted} className="text-xl font-black border-none px-0 h-auto focus-visible:ring-0" />
                      {!isCompleted && (
                        <Button variant="ghost" size="icon" onClick={() => removeArrayItem('kra_metrics', idx)} className="text-slate-300">
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500">Weightage (%)</Label>
                        <Input type="number" value={kra.weightage} onChange={(e) => updateField(`kra_metrics.${idx}.weightage`, parseInt(e.target.value))} readOnly={isCompleted} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500">Self Rating (1-5)</Label>
                        <Input type="number" step="0.5" value={kra.self_rating} onChange={(e) => updateField(`kra_metrics.${idx}.self_rating`, parseFloat(e.target.value))} readOnly={isCompleted} className="h-12 rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-500">Priority</Label>
                        <select value={kra.priority} onChange={(e) => updateField(`kra_metrics.${idx}.priority`, e.target.value)} disabled={isCompleted} className="w-full h-12 rounded-xl border-2 px-3">
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
                {!isCompleted && (
                  <Button variant="outline" onClick={() => addArrayItem('kra_metrics', { kra_title: "", weightage: 0, self_rating: 0, priority: "Medium", status: "In Progress" })} className="w-full py-6 border-dashed border-2 rounded-2xl text-slate-400">
                    Add KRA Metric
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Final Assessment & CTC Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-700">CTC Details</h4>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-500">Current CTC</Label>
                    <Input type="number" value={formData.ctc_information.current_ctc} onChange={(e) => updateField('ctc_information.current_ctc', parseInt(e.target.value))} readOnly={isCompleted} className="h-14 rounded-2xl border-2 px-6" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-500">Expected CTC</Label>
                    <Input type="number" value={formData.ctc_information.expected_ctc} onChange={(e) => updateField('expected_ctc', parseInt(e.target.value))} readOnly={isCompleted} className="h-14 rounded-2xl border-2 px-6" />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-slate-700">Self Assessment</h4>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-500">Overall Self Rating</Label>
                    <Input type="number" step="0.5" value={formData.overall_assessment.self_overall_rating} onChange={(e) => updateField('overall_assessment.self_overall_rating', parseFloat(e.target.value))} readOnly={isCompleted} className="h-14 rounded-2xl border-2 px-6" />
                  </div>
                </div>
                <div className="md:col-span-2 space-y-3">
                  <Label className="text-sm font-bold text-slate-500">Increment Justification</Label>
                  <Textarea value={formData.ctc_information.justification} onChange={(e) => updateField('ctc_information.justification', e.target.value)} readOnly={isCompleted} className="min-h-[150px] rounded-2xl border-2 p-6" />
                </div>
              </div>
              {!isCompleted && (
                <div className="flex justify-center pt-12">
                  <Button size="lg" onClick={() => handleSave(true)} disabled={mutation.isPending} className="h-16 px-12 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all">
                    {mutation.isPending ? "Submitting..." : "Submit Final Assessment"}
                  </Button>
                </div>
              )}
              {isCompleted && (
                <div className="flex justify-center pt-12">
                  <div className="bg-emerald-50 text-emerald-700 px-8 py-6 rounded-[2rem] border-2 border-emerald-100 flex flex-col items-center gap-2">
                    <span className="text-2xl font-black">Assessment Submitted</span>
                    <p className="text-emerald-600 font-medium">This assessment has been finalized and cannot be edited.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between p-2">
        <Button variant="ghost" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1} className="rounded-2xl h-12 px-6 font-bold text-slate-500">
          <ChevronLeft className="h-5 w-5 mr-2" /> Back
        </Button>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <button key={i} onClick={() => setStep(i)} className={`w-3 h-3 rounded-full transition-all ${step === i ? 'bg-primary w-8' : 'bg-slate-200 hover:bg-slate-300'}`} />
          ))}
        </div>
        <Button onClick={() => setStep(Math.min(6, step + 1))} disabled={step === 6} className="rounded-2xl h-12 px-6 font-bold bg-slate-900 text-white">
          Next Step <ChevronRight className="h-5 w-5 ml-2" />
        </Button>
      </div>
    </div>
  );
}

function getStepTitle(step: number) {
  switch (step) {
    case 1: return "Employee & Background";
    case 2: return "Key Achievements";
    case 3: return "Project Contributions";
    case 4: return "Learning & Growth";
    case 5: return "KRA Performance";
    case 6: return "Final Review & CTC";
    default: return "";
  }
}
