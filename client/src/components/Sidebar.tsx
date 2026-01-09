import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, FolderKanban, MessageSquarePlus, LogOut, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const navigation = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["admin", "manager", "employee", "user"] },
    { name: "Employees", href: "/employees", icon: Users, roles: ["admin", "manager"] },
    { name: "Projects", href: "/projects", icon: FolderKanban, roles: ["admin", "manager"] },
    { name: "Managers", href: "/managers", icon: Users, roles: ["admin"] },
    { name: "My Feedbacks", href: "/my-reviews", icon: ClipboardList, roles: ["admin", "manager", "employee", "user"] },
    { name: "Feedback", href: "/feedback", icon: MessageSquarePlus, roles: ["admin", "manager", "employee", "user"] },
  ].filter(item => item.roles.includes(user?.role || ""));

  return (
    <div className="flex h-screen w-64 flex-col fixed inset-y-0 z-50 bg-slate-900 text-white shadow-xl">
      <div className="flex h-16 items-center px-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="bg-primary/20 p-2 rounded-lg">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
            Talent360
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1 px-3 py-6">
        <div className="text-xs font-medium text-slate-400 uppercase px-3 mb-2 tracking-wider">
          Main Menu
        </div>
        {navigation.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.name} href={item.href}>
              <div
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-800/50 rounded-xl p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
            {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name || 'Guest'}</p>
            <p className="text-xs text-slate-400 truncate capitalize">{user?.role || 'Guest'}</p>
          </div>
          <button 
            onClick={logout}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
