import { useState } from "react";
import { useEmployees, useCreateEmployee, useUpdateEmployee } from "@/hooks/use-employees";
import { LoadingScreen, ErrorScreen } from "@/components/LoadingScreen";
import { Link } from "wouter";
import { Plus, Search, Filter, MoreHorizontal, UserPlus, Edit2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertEmployeeSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export default function Employees() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const { data: employees, isLoading, error } = useEmployees();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Fetch all assessments to show status
  const { data: assessments } = useQuery<any>({
    queryKey: ["/api/kra"],
    enabled: !!user,
  });

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen message="Failed to load employees" />;

  const employeesList = Array.isArray(employees?.data) ? employees.data : (Array.isArray(employees) ? employees : []);
  
  // Managers see all employees, but they cannot create new ones
  const canCreate = user?.role === "admin";
  
  // If employee, only show themselves
  const displayEmployees = user?.role === ("employee" as any) 
    ? employeesList.filter((emp: any) => emp.email === (user as any).email || (user.employeeId && emp.employee_id === user.employeeId))
    : employeesList;

  const filteredEmployees = displayEmployees.filter((emp: any) => 
    emp.name.toLowerCase().includes(search.toLowerCase()) || 
    emp.email.toLowerCase().includes(search.toLowerCase()) ||
    (emp.department && emp.department.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {user?.role === ("employee" as any) ? "KRA Assignment" : "Employees"}
          </h1>
          <p className="text-slate-500 mt-1">
            {user?.role === ("employee" as any) 
              ? "Manage your performance assessment and KRA metrics." 
              : "Manage your team members and their roles."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canCreate && <CreateEmployeeDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />}
          {user?.role === "manager" && (
            <div className="bg-primary/5 text-primary px-4 py-2 rounded-xl text-sm font-bold border border-primary/10">
              Manager View: All Staff
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center gap-4 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, or department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 text-sm font-medium transition-colors">
            <Filter className="h-4 w-4" />
            Filter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Employee ID</th>
                <th className="px-6 py-4">KRA Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Designation</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEmployees?.map((employee: any) => (
                <tr key={employee.employee_id || employee.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <Link href={`/employees/${employee.employee_id || employee.id}`}>
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                          {employee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{employee.name}</div>
                          <div className="text-xs text-slate-500">{employee.email}</div>
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{employee.employee_id || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <Link href={`/kra-assessment/${employee.employee_id}`}>
                        <Button variant="outline" size="sm" className="rounded-xl text-xs gap-1 h-8 w-full justify-start px-3">
                          <Edit2 className="h-3 w-3" />
                          {(() => {
                            const assessment = assessments?.data?.find((a: any) => a.employee_id === employee.employee_id);
                            const status = assessment?.status || "Not Started";
                            if (user?.role === ("employee" as any)) {
                              return status === "Submitted" ? "View My Assessment" : "Fill My Assessment";
                            }
                            return status === "Submitted" ? "View Assessment" : "Assess Performance";
                          })()}
                        </Button>
                      </Link>
                      {(() => {
                        const assessment = assessments?.data?.find((a: any) => a.employee_id === employee.employee_id);
                        const status = assessment?.status || "Not Started";
                        return (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md w-fit ${
                            status === "Submitted" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : 
                            status === "Draft" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-slate-100 text-slate-500 border border-slate-200"
                          }`}>
                            {status === "Submitted" ? "COMPLETED" : status}
                          </span>
                        );
                      })()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{employee.role || "-"}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {employee.department || "General"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{employee.designation || "-"}</td>
                  <td className="px-6 py-4 text-right">
                    <EditEmployeeDialog employee={employee} />
                  </td>
                </tr>
              ))}
              {filteredEmployees?.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="bg-slate-50 p-4 rounded-full mb-3">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <p>No employees found matching your search.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function EditEmployeeDialog({ employee }: { employee: any }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const form = useForm({
    defaultValues: {
      name: employee.name || "",
      email: employee.email || "",
      department: employee.department || "",
      designation: employee.designation || "",
      role: employee.role || "Employee",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      await apiRequest("PUT", `/api/employees/${employee.employee_id}`, data);
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({
        title: "Success",
        description: "Employee updated successfully",
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="text-slate-400 hover:text-primary transition-colors">
          <Edit2 className="h-4 w-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display">Edit Employee</DialogTitle>
          <DialogDescription>
            Update employee details below.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input id="edit-name" {...form.register("name")} className="rounded-xl" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-email">Email Address</Label>
            <Input id="edit-email" type="email" {...form.register("email")} className="rounded-xl" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-department">Department</Label>
              <Input id="edit-department" {...form.register("department")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="UI/UX">UI/UX</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="BASM">BASM</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-designation">Designation</Label>
            <Input id="edit-designation" {...form.register("designation")} className="rounded-xl" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" className="rounded-xl bg-primary hover:bg-primary/90">
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function CreateEmployeeDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { mutate, isPending } = useCreateEmployee();
  
  const form = useForm<z.infer<typeof insertEmployeeSchema>>({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      name: "",
      email: "",
      employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
      department: "",
      role: "Employee",
      designation: "",
      isActive: true,
    },
  });

  const onSubmit = (data: z.infer<typeof insertEmployeeSchema>) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-xl font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Employee
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold font-display">Add New Employee</DialogTitle>
          <DialogDescription>
            Enter the details for the new team member. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" {...form.register("name")} placeholder="Jane Doe" className="rounded-xl" />
            {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employeeId">Employee ID</Label>
              <Input id="employeeId" {...form.register("employeeId")} className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" {...form.register("email")} placeholder="jane@company.com" className="rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" {...form.register("department")} placeholder="Engineering" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Controller
                name="role"
                control={form.control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select Role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="HR">HR</SelectItem>
                      <SelectItem value="Developer">Developer</SelectItem>
                      <SelectItem value="UI/UX">UI/UX</SelectItem>
                      <SelectItem value="DevOps">DevOps</SelectItem>
                      <SelectItem value="QA">QA</SelectItem>
                      <SelectItem value="BASM">BASM</SelectItem>
                      <SelectItem value="Intern">Intern</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input id="designation" {...form.register("designation")} placeholder="Senior Dev" className="rounded-xl" />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl">Cancel</Button>
            <Button type="submit" disabled={isPending} className="rounded-xl bg-primary hover:bg-primary/90">
              {isPending ? "Creating..." : "Create Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
