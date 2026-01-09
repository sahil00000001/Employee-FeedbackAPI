import { useQuery } from "@tanstack/react-query";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { ClipboardList, User, ArrowRight, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth";

export default function MyReviews() {
  const { user } = useAuth();

  const { data: assignments, isLoading: loadingAssignments, error: errorAssignments } = useQuery<any>({
    queryKey: ["/api/feedback-assignment/reviewer", user?.employeeId],
    enabled: !!user?.employeeId,
  });

  const { data: submittedFeedback, isLoading: loadingSubmitted, error: errorSubmitted } = useQuery<any>({
    queryKey: ["/api/feedback-360"],
  });

  if (loadingAssignments || loadingSubmitted) return <LoadingScreen />;
  if (errorAssignments || errorSubmitted) return <ErrorScreen message="Failed to load your reviews" />;

  const assignmentList = assignments?.data || [];
  
  // Adjusted to handle both direct array or wrapped data object
  const rawSubmittedList = submittedFeedback?.data || submittedFeedback || [];
  const submittedList = Array.isArray(rawSubmittedList) 
    ? rawSubmittedList.filter((f: any) => f.reviewer_id === user?.employeeId)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Feedbacks</h1>
        <p className="text-slate-500 mt-1">Manage feedback assignments and view your completed reviews.</p>
      </div>

      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Pending Assignments</h2>
          <div className="grid grid-cols-1 gap-4">
            {assignmentList.filter((a: any) => a.status === 'pending' || a.status === 'in_progress').map((review: any) => (
              <Card key={review.employeeId} className="hover-elevate transition-all border-slate-100 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {review.employeeName?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{review.employeeName}</h3>
                        <p className="text-sm text-slate-500">
                          Assigned on {new Date(review.assignedDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Link href={`/feedback?employeeId=${review.employeeId}`}>
                      <Button variant="outline" className="rounded-xl group">
                        Provide Feedback
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
            {assignmentList.filter((a: any) => a.status === 'pending' || a.status === 'in_progress').length === 0 && (
              <p className="text-slate-500 text-sm">No pending assignments.</p>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-4">Completed Feedbacks</h2>
          <div className="grid grid-cols-1 gap-4">
            {submittedList.map((feedback: any) => (
              <Card key={feedback._id || feedback.id} className="hover-elevate transition-all border-slate-100 shadow-sm">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between p-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                        {(feedback.name || feedback.reviewer_name)?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">{feedback.name || feedback.reviewer_name || `Employee ${feedback.employee_id}`}</h3>
                        <p className="text-sm text-slate-500">
                          Submitted on {new Date(feedback.submitted_date || feedback.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-primary hover:text-primary hover:bg-primary/5">
                      <Pencil className="h-4 w-4" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {submittedList.length === 0 && (
              <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200">
                <ClipboardList className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500">No completed feedbacks yet.</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
