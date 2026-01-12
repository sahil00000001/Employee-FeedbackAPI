import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/Sidebar";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShieldCheck, Lock } from "lucide-react";

import Dashboard from "@/pages/Dashboard";
import Employees from "@/pages/Employees";
import EmployeeDetail from "@/pages/EmployeeDetail";
import Projects from "@/pages/Projects";
import Managers from "@/pages/Managers";
import Feedback from "@/pages/Feedback";
import MyReviews from "@/pages/MyReviews";
import OverallFeedback from "@/pages/OverallFeedback";
import KRAAssessmentForm from "@/pages/KRAAssessmentForm";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, roles }: { component: React.ComponentType<any>, roles?: string[] }) {
  const { user } = useAuth();
  
  if (!user) return <Redirect to="/login" />;
  if (roles && !roles.includes(user.role!)) return <Redirect to="/" />;
  
  return <Component />;
}

function RoleLoginPage({ role }: { role: "admin" | "manager" }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { loginWithOtp } = useAuth();
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === role && password === role) {
      if (role === "admin") {
        loginWithOtp({ name: "Administrator", role: "admin" }, "admin");
      } else {
        loginWithOtp({ name: "Project Manager", role: "manager", employeeId: "1066" }, "manager");
      }
      setLocation("/");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-xl border-slate-200">
        <CardHeader className="text-center space-y-1">
          <div className="mx-auto bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mb-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight capitalize">{role} Login</CardTitle>
          <CardDescription>
            Enter your {role} credentials to access the portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl"
                />
              </div>
            </div>
            <Button type="submit" className="w-full rounded-xl py-6 font-bold">
              Login as {role}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Router() {
  const { user } = useAuth();
  
  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/admin">
          <RoleLoginPage role="admin" />
        </Route>
        <Route path="/manager">
          <RoleLoginPage role="manager" />
        </Route>
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
              <ProtectedRoute component={Employees} roles={["admin", "manager", "employee"]} />
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
            <Route path="/overall-feedback">
              <ProtectedRoute component={OverallFeedback} roles={["admin"]} />
            </Route>
            <Route path="/kra-assessment/:employee_id">
              {(params) => <ProtectedRoute component={() => <KRAAssessmentForm employeeId={params.employee_id} />} />}
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
