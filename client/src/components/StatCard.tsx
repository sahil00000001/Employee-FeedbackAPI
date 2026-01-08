import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
    positive: boolean;
  };
  className?: string;
  color?: "primary" | "purple" | "emerald" | "amber";
}

const colorMap = {
  primary: "bg-blue-50 text-blue-600",
  purple: "bg-purple-50 text-purple-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
};

export function StatCard({ title, value, icon: Icon, trend, className, color = "primary" }: StatCardProps) {
  return (
    <div className={cn("bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow", className)}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-2 text-3xl font-display font-bold text-slate-900">{value}</h3>
        </div>
        <div className={cn("p-3 rounded-xl", colorMap[color])}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center text-sm">
          <span
            className={cn(
              "font-medium px-2 py-0.5 rounded-full text-xs",
              trend.positive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            )}
          >
            {trend.positive ? "+" : ""}{trend.value}%
          </span>
          <span className="ml-2 text-slate-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
