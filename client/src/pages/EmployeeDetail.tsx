import { useRoute } from "wouter";
import { useEmployee } from "@/hooks/use-employees";
import { useFeedbackSummary, useEmployeeFeedback } from "@/hooks/use-feedback";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";
import { Mail, Briefcase, Building, Calendar, Star, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function EmployeeDetail() {
  const [, params] = useRoute("/employees/:id");
  const id = params ? parseInt(params.id) : 0;
  
  const { data: employee, isLoading: empLoading } = useEmployee(id);
  // Using employeeId string for feedback queries
  const employeeIdStr = employee?.employeeId || "";
  
  const { data: summary, isLoading: sumLoading } = useFeedbackSummary(employeeIdStr);
  const { data: feedbackData, isLoading: feedLoading } = useEmployeeFeedback(employeeIdStr);
  const feedbackList = feedbackData?.data || [];

  if (empLoading || sumLoading || feedLoading) return <LoadingScreen />;
  if (!employee) return <ErrorScreen message="Employee not found" />;

  const chartData = summary ? [
    { subject: 'Technical', A: summary.categoryAverages.technicalSkills, fullMark: 5 },
    { subject: 'Comm.', A: summary.categoryAverages.communication, fullMark: 5 },
    { subject: 'Teamwork', A: summary.categoryAverages.teamwork, fullMark: 5 },
    { subject: 'Leadership', A: summary.categoryAverages.leadership, fullMark: 5 },
    { subject: 'Solving', A: summary.categoryAverages.problemSolving, fullMark: 5 },
  ] : [];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Profile */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-8 items-start">
        <div className="h-24 w-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-indigo-500/20">
          {employee.name.substring(0, 2).toUpperCase()}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-display font-bold text-slate-900">{employee.name}</h1>
              <div className="flex flex-wrap gap-4 mt-3 text-slate-500 text-sm">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {employee.email}
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4" /> {employee.role}
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4" /> {employee.department}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Joined {employee.joinedAt ? format(new Date(employee.joinedAt), "MMM yyyy") : "-"}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${employee.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {employee.isActive ? "Active Employee" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Radar Chart */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Skills Assessment</h3>
          <div className="h-[300px] w-full">
            {summary ? (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tick={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    fill="#6366f1"
                    fillOpacity={0.4}
                  />
                </RadarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">
                No feedback data yet
              </div>
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">Overall Rating</p>
            <div className="text-4xl font-bold text-slate-900 mt-1">
              {summary?.overallRating.toFixed(1) || "N/A"}
              <span className="text-lg text-slate-400 font-normal">/5.0</span>
            </div>
          </div>
        </div>

        {/* Feedback History */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Feedback</h3>
            <span className="text-sm text-slate-500">{feedbackList?.length || 0} reviews</span>
          </div>

          <div className="space-y-4">
            {feedbackList?.map((fb: any) => (
              <div key={fb.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900">{fb.reviewerName || "Anonymous Reviewer"}</h4>
                      <p className="text-xs text-slate-500 capitalize">{fb.feedbackType} Feedback</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg text-yellow-700 font-bold text-sm">
                    <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                    {(
                      (fb.technicalSkills + fb.communication + fb.teamwork + fb.leadership + fb.problemSolving) / 5
                    ).toFixed(1)}
                  </div>
                </div>
                {fb.comments && (
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">
                    "{fb.comments}"
                  </p>
                )}
                <div className="grid grid-cols-5 gap-2 text-xs text-center border-t border-slate-100 pt-4">
                  <div>
                    <div className="text-slate-400 mb-1">Tech</div>
                    <div className="font-bold text-slate-700">{fb.technicalSkills}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Comm</div>
                    <div className="font-bold text-slate-700">{fb.communication}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Team</div>
                    <div className="font-bold text-slate-700">{fb.teamwork}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Lead</div>
                    <div className="font-bold text-slate-700">{fb.leadership}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 mb-1">Solve</div>
                    <div className="font-bold text-slate-700">{fb.problemSolving}</div>
                  </div>
                </div>
              </div>
            ))}
            {feedbackList?.length === 0 && (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                No feedback submitted for this employee yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
