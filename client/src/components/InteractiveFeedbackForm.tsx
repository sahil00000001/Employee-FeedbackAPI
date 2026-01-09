import { useState, useEffect } from "react";
import { ROLE_TEMPLATES, FeedbackCategory, FeedbackPoint } from "@/lib/roleTemplates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Props {
  role: string;
  onUpdate: (detailedRatings: any[]) => void;
}

export function InteractiveFeedbackForm({ role, onUpdate }: Props) {
  const template = ROLE_TEMPLATES[role as keyof typeof ROLE_TEMPLATES] || ROLE_TEMPLATES["Developer"];
  const [categories, setCategories] = useState<FeedbackCategory[]>(template.categories);

  useEffect(() => {
    // Sync with parent when categories change
    const detailedRatings = categories.map(cat => ({
      category_id: cat.id,
      category_title: cat.title,
      points: cat.points.map(p => ({
        point_id: p.id,
        label: p.label,
        rating: p.rating || 3
      }))
    }));
    onUpdate(detailedRatings);
  }, [categories]);

  const updateRating = (catId: string, pointId: string, rating: number) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return {
        ...cat,
        points: cat.points.map(p => {
          if (p.id !== pointId) return p;
          return { ...p, rating };
        })
      };
    }));
  };

  const addPoint = (catId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      const newPoint: FeedbackPoint = {
        id: `custom-${Date.now()}`,
        label: "New Insight",
        description: "Specify a custom area of feedback",
        rating: 3
      };
      return { ...cat, points: [...cat.points, newPoint] };
    }));
  };

  const removePoint = (catId: string, pointId: string) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== catId) return cat;
      return { ...cat, points: cat.points.filter(p => p.id !== pointId) };
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
          Role: {role}
        </Badge>
        <span className="text-xs text-slate-500 italic">Customizing form based on role expectations</span>
      </div>

      {categories.map((category) => (
        <Card key={category.id} className="border-slate-100 shadow-sm overflow-visible">
          <CardHeader className="bg-slate-50/50 pb-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900">{category.title}</CardTitle>
                <CardDescription className="text-slate-500 text-xs mt-1">{category.description}</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => addPoint(category.id)}
                className="text-primary hover:bg-primary/5"
              >
                <Plus className="h-4 w-4 mr-1" /> Add Point
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-8">
            {category.points.map((point) => (
              <div key={point.id} className="relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-2 max-w-[70%]">
                    <div>
                      <Label className="text-sm font-semibold text-slate-700">{point.label}</Label>
                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{point.description}</p>
                    </div>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-3 w-3 text-slate-300 mt-1 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="text-xs">{point.description}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
                      {point.rating || 3}/5
                    </span>
                    {point.id.startsWith('custom-') && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-300 hover:text-red-500"
                        onClick={() => removePoint(category.id, point.id)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <Slider
                  value={[point.rating || 3]}
                  min={1}
                  max={5}
                  step={1}
                  onValueChange={(val) => updateRating(category.id, point.id, val[0])}
                  className="py-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-medium px-1 mt-1">
                  <span>Needs Improvement</span>
                  <span>Meets Expectations</span>
                  <span>Exceeds</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Badge({ children, variant = "default", className = "" }: any) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}
