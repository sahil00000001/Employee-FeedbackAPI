import { useAuth } from "@/lib/auth";
import { useEmployees } from "@/hooks/use-employees";
import { useProjects } from "@/hooks/use-projects";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { Users, Briefcase, TrendingUp, AlertCircle, Pencil } from "lucide-react";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: employees, isLoading: loadingEmployees, error: errorEmployees } = useEmployees();
  const { data: projects, isLoading: loadingProjects, error: errorProjects } = useProjects();

  const { data: assignments } = useQuery<any>({
    queryKey: ["/api/feedback-assignment/reviewer", user?.employeeId],
    enabled: !!user?.employeeId,
  });

  const { data: submittedFeedback } = useQuery<any>({
    queryKey: ["/api/feedback-360"],
  });

  if (loadingEmployees || loadingProjects) return <LoadingScreen />;
  if (errorEmployees || errorProjects) return <ErrorScreen message="Failed to load dashboard data" />;

  const employeesList = Array.isArray(employees?.data) ? employees.data : (Array.isArray(employees) ? employees : []);
  const projectsList = Array.isArray(projects?.data) ? projects.data : (Array.isArray(projects) ? projects : []);
  
  const activeEmployees = employeesList.filter((e: any) => e.active !== 0).length || 0;
  const activeProjects = projectsList.filter((p: any) => p.active !== 0).length || 0;
  
  // Calculate average team size
  const totalTeamMembers = projectsList.reduce((acc: number, curr: any) => acc + (Array.isArray(curr.people) ? curr.people.length : 0), 0) || 0;
  const avgTeamSize = activeProjects > 0 ? Math.round(totalTeamMembers / activeProjects) : 0;

  const assignmentList = assignments?.data || [];
  
  // Adjusted to handle both direct array or wrapped data object
  const rawSubmittedList = submittedFeedback?.data || submittedFeedback || [];
  const submittedList = Array.isArray(rawSubmittedList) 
    ? rawSubmittedList.filter((f: any) => f.reviewer_id === user?.employeeId)
    : [];

  if (user?.role === "user") {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">My Performance Portal</h1>
          <p className="text-slate-500">Welcome back, {user.name}. Track your feedback assignments.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            title="Pending Reviews"
            value={assignmentList.filter((a: any) => a.status !== 'completed').length}
            icon={AlertCircle}
            color="amber"
          />
          <StatCard
            title="Total Assigned"
            value={assignmentList.length}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Completed"
            value={submittedList.length}
            icon={Users}
            color="emerald"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">Reviews Assigned to Me</CardTitle>
              <CardDescription>People waiting for your valuable feedback</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignmentList.slice(0, 3).map((review: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100 group hover:border-primary/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center font-bold text-primary">
                        {review.employeeName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{review.employeeName}</p>
                        <p className="text-xs text-slate-500">Assigned on {new Date(review.assignedDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Badge variant={review.status === "pending" ? "secondary" : "default"} className="rounded-full px-3 capitalize">
                      {review.status}
                    </Badge>
                  </div>
                ))}
                {assignmentList.length === 0 && (
                  <p className="text-center py-6 text-slate-500 text-sm">No assignments found.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold">My Completed Reviews</CardTitle>
              <CardDescription>History of feedback you've successfully submitted</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submittedList.slice(0, 3).map((review: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-white group hover:bg-slate-50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center font-bold text-emerald-600">
                        {(review.name || review.reviewer_name)?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{review.name || review.reviewer_name || `Employee ${review.employee_id}`}</p>
                        <p className="text-xs text-slate-500">Submitted on {new Date(review.submitted_date || review.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                ))}
                {submittedList.length === 0 && (
                  <p className="text-center py-6 text-slate-500 text-sm">No completed feedbacks yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2">Welcome back, here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Employees"
          value={activeEmployees}
          icon={Users}
          color="primary"
          trend={{ value: 12, label: "vs last month", positive: true }}
        />
        <StatCard
          title="Active Projects"
          value={activeProjects}
          icon={Briefcase}
          color="purple"
          trend={{ value: 4, label: "vs last month", positive: true }}
        />
        <StatCard
          title="Avg. Team Size"
          value={avgTeamSize}
          icon={TrendingUp}
          color="emerald"
          trend={{ value: 2, label: "vs last quarter", positive: true }}
        />
        <StatCard
          title="Pending Feedback"
          value="14"
          icon={AlertCircle}
          color="amber"
          trend={{ value: 5, label: "overdue", positive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Projects */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900">Active Projects</h3>
            <button className="text-sm font-medium text-primary hover:text-primary/80">View All</button>
          </div>
          <div className="space-y-4">
            {projectsList.slice(0, 5).map((project: any) => (
              <div key={project.project_id || project.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold group-hover:border-primary/30 group-hover:text-primary transition-colors">
                    {project.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900">{project.name}</h4>
                    <p className="text-sm text-slate-500">{Array.isArray(project.people) ? project.people.length : 0} members • Manager ID: {project.manager || "Unassigned"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${project.active !== 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                    {project.active !== 0 ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))}
            {projectsList.length === 0 && (
              <div className="text-center py-8 text-slate-500">No active projects found.</div>
            )}
          </div>
        </div>

        {/* Quick Actions / Notifications */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group">
              <h5 className="font-semibold text-slate-900 group-hover:text-primary">Add New Employee</h5>
              <p className="text-xs text-slate-500 mt-1">Onboard a new team member</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group">
              <h5 className="font-semibold text-slate-900 group-hover:text-primary">Create Project</h5>
              <p className="text-xs text-slate-500 mt-1">Start a new initiative</p>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-xl border border-slate-200 hover:border-primary/50 hover:bg-slate-50 transition-all group">
              <h5 className="font-semibold text-slate-900 group-hover:text-primary">Request Feedback</h5>
              <p className="text-xs text-slate-500 mt-1">Initiate a 360 review cycle</p>
            </button>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Pending Tasks</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-amber-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">Review Q3 performance for Engineering team</p>
                  <p className="text-xs text-slate-400 mt-1">Due in 2 days</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 h-2 w-2 rounded-full bg-red-500 flex-shrink-0" />
                <div>
                  <p className="text-sm text-slate-700">Approve new project budget</p>
                  <p className="text-xs text-slate-400 mt-1">Overdue by 1 day</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
