import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";

import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import EmployeeDetail from "@/pages/EmployeeDetail";
import Projects from "@/pages/Projects";
import Managers from "@/pages/Managers";
import Feedback from "@/pages/Feedback";
import MyReviews from "@/pages/MyReviews";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType<any>, roles?: string[] }) {
  const { user } = useAuth();
  
  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role!)) return <Redirect to="/" />;
  
  return <Component />;
}

function Router() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50/50">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <main className="flex-1 p-8">
          <Switch>
            <Route path="/login" component={Login} />
            <Route path="/">
              <ProtectedRoute component={Dashboard} />
            </Route>
            <Route path="/employees">
              <ProtectedRoute component={Employees} roles={["admin", "manager"]} />
            </Route>
            <Route path="/employees/:id">
              {(params) => <ProtectedRoute component={() => <EmployeeDetail />} roles={["admin", "manager"]} />}
            </Route>
            <Route path="/projects">
              <ProtectedRoute component={Projects} roles={["admin", "manager"]} />
            </Route>
            <Route path="/managers">
              <ProtectedRoute component={Managers} roles={["admin"]} />
            </Route>
            <Route path="/feedback">
              <ProtectedRoute component={Feedback} />
            </Route>
            <Route path="/my-reviews">
              <ProtectedRoute component={MyReviews} />
            </Route>
            <Route component={NotFound} />
          </Switch>
        </main>
        <footer className="py-6 px-8 border-t border-slate-200 bg-white/50 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} Talent360 Performance Suite. All rights reserved.</p>
            <p className="font-medium">Developed by <span className="text-primary">Sahil</span></p>
          </div>
        </footer>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
