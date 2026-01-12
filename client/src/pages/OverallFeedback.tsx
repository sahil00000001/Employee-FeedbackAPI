import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface FeedbackRecord {
  _id: string;
  reviewer_name?: string;
  reviewee_name?: string;
  name?: string;
  relationship?: string;
  ratings?: {
    technical_skills?: number;
    communication?: number;
    teamwork?: number;
    leadership?: number;
    problem_solving?: number;
  };
  comments?: string;
  strengths?: string;
  areas_of_improvement?: string;
  createdAt?: string;
}

export default function OverallFeedback() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: feedbackResponse, isLoading } = useQuery<{ data: FeedbackRecord[] }>({
    queryKey: ["/api/feedback-360"],
  });

  const feedback = Array.isArray(feedbackResponse?.data) ? feedbackResponse.data : [];

  const filteredFeedback = feedback.filter(f => {
    const revieweeName = (f.reviewee_name || f.name || "").toLowerCase();
    const reviewerName = (f.reviewer_name || "").toLowerCase();
    const search = searchTerm.toLowerCase();
    return revieweeName.includes(search) || reviewerName.includes(search);
  });

  const groupedFeedback = filteredFeedback.reduce((acc, f) => {
    const name = f.reviewee_name || f.name || "Unknown";
    if (!acc[name]) acc[name] = [];
    acc[name].push(f);
    return acc;
  }, {} as Record<string, FeedbackRecord[]>);

  const { data: employees } = useQuery<any>({
    queryKey: ["/api/employees"],
  });

  const { data: assignments } = useQuery<any>({
    queryKey: ["/api/feedback-assignment"],
  });

  const { data: kraAssessmentsResponse } = useQuery<any>({
    queryKey: ["/api/kra"],
  });

  const getEmployeeInfo = (name: string) => {
    const empList = Array.isArray(employees?.data) ? employees.data : (Array.isArray(employees) ? employees : []);
    const emp = empList.find((e: any) => e.name === name);
    
    // Find reporting manager from assignments
    const assignmentList = Array.isArray(assignments?.data) ? assignments.data : (Array.isArray(assignments) ? assignments : []);
    const assignment = assignmentList.find((a: any) => a.employee_id === emp?.employee_id);
    
    return {
      ...emp,
      reporting_manager: assignment?.manager_name || "N/A"
    };
  };

  const downloadReport = (personName: string, personFeedback: FeedbackRecord[]) => {
    const empInfo = getEmployeeInfo(personName);
    const kraData = Array.isArray(kraAssessmentsResponse?.data) 
      ? kraAssessmentsResponse.data.find((k: any) => k.employee_id === empInfo?.employee_id)
      : null;

    const doc = new jsPDF();
    
    // Header styling
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 65, 'F');
    
    doc.setFontSize(24);
    doc.setTextColor(31, 41, 55);
    doc.text(`Performance Review Report`, 14, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 32);

    // Employee Info Section
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(`Employee Details`, 14, 45);
    
    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.text(`Name: ${personName}`, 14, 52);
    doc.text(`Department: ${empInfo?.department || "N/A"}`, 80, 52);
    doc.text(`Project: ${empInfo?.project || "N/A"}`, 14, 59);
    doc.text(`Reporting Manager: ${empInfo?.reporting_manager || "N/A"}`, 14, 66);

    let currentY = 75;

    // KRA Assessment Section
    if (kraData) {
      doc.setFontSize(14);
      doc.setTextColor(31, 41, 55);
      doc.text(`KRA Assessment Summary`, 14, currentY);
      currentY += 10;

      // KRA Metrics Table
      if (Array.isArray(kraData.kra_metrics) && kraData.kra_metrics.length > 0) {
        doc.setFontSize(11);
        doc.text("Performance Metrics", 14, currentY);
        currentY += 5;
        
        autoTable(doc, {
          startY: currentY,
          head: [['Metric/KRA Title', 'Weightage', 'Self Rating', 'Priority']],
          body: kraData.kra_metrics.map((m: any) => [
            m.kra_title || "N/A",
            `${m.weightage || 0}%`,
            m.self_rating || "N/A",
            m.priority || "N/A"
          ]),
          theme: 'striped',
          headStyles: { fillColor: [100, 116, 139] },
          margin: { left: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Achievements
      if (Array.isArray(kraData.achievements) && kraData.achievements.length > 0) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        doc.setFontSize(11);
        doc.text("Key Achievements", 14, currentY);
        currentY += 5;
        
        autoTable(doc, {
          startY: currentY,
          head: [['Title', 'Impact', 'Description']],
          body: kraData.achievements.map((a: any) => [
            a.title || "N/A",
            a.impact_level || "N/A",
            a.description || "N/A"
          ]),
          theme: 'grid',
          headStyles: { fillColor: [100, 116, 139] },
          columnStyles: { 2: { cellWidth: 100 } },
          margin: { left: 14 }
        });
        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Self Assessment Comments
      if (kraData.overall_assessment?.self_overall_rating || kraData.ctc_information?.justification) {
        if (currentY > 250) { doc.addPage(); currentY = 20; }
        doc.setFontSize(11);
        doc.text("Self Assessment Overview", 14, currentY);
        currentY += 7;
        doc.setFontSize(10);
        doc.text(`Overall Self Rating: ${kraData.overall_assessment?.self_overall_rating || "N/A"}/5`, 14, currentY);
        currentY += 7;
        if (kraData.ctc_information?.justification) {
          doc.text("Increment Justification:", 14, currentY);
          currentY += 5;
          const splitJustification = doc.splitTextToSize(kraData.ctc_information.justification, 180);
          doc.text(splitJustification, 14, currentY);
          currentY += (splitJustification.length * 5) + 10;
        }
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(156, 163, 175);
      doc.text("No KRA Assessment data available for this period.", 14, currentY);
      currentY += 15;
    }

    // Peer Feedback Section
    if (currentY > 250) { doc.addPage(); currentY = 20; }
    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.text(`360-Degree Feedback`, 14, currentY);
    currentY += 10;
    
    const tableData = personFeedback.map(fb => {
      const ratings = fb.ratings || {};
      const ratingValues = Object.values(ratings).filter(v => typeof v === 'number');
      const avgRating = ratingValues.length > 0 
        ? (ratingValues.reduce((a, b) => a + b, 0) / ratingValues.length).toFixed(1)
        : "N/A";

      // Detailed ratings breakdown for this reviewer
      const ratingEntries = Object.entries(ratings)
        .map(([k, v]) => `${k.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}: ${v}`)
        .join('\n');

      return [
        { content: fb.reviewer_name || "N/A", styles: { fontStyle: 'bold' as const } },
        { content: `Avg: ${avgRating}/5\n\n${ratingEntries}`, styles: { fontSize: 8 } },
        fb.strengths || "N/A",
        fb.areas_of_improvement || "N/A",
        fb.comments || "N/A"
      ];
    });

    autoTable(doc, {
      startY: currentY,
      head: [['Reviewer', 'Ratings Detail', 'Strengths', 'Improvements', 'Comments']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [79, 70, 229],
        fontSize: 10,
        halign: 'center'
      },
      styles: { 
        fontSize: 9, 
        cellPadding: 5, 
        valign: 'top'
      },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
        4: { cellWidth: 40 }
      }
    });

    doc.save(`${personName.replace(/\s+/g, '_')}_Performance_Report.pdf`);
  };

  if (isLoading) return <div>Loading feedback...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Total Overall Feedback</h1>
          <p className="text-slate-500">View and manage all 360-degree feedback across the organization.</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by reviewer or reviewee name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-xl"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 font-semibold">Reviewee</th>
                  <th className="p-4 font-semibold">Reviewers</th>
                  <th className="p-4 font-semibold">Avg Rating</th>
                  <th className="p-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {Object.entries(groupedFeedback).map(([name, records]) => {
                  let totalRating = 0;
                  let ratingCount = 0;

                  records.forEach(f => {
                    const ratings = f.ratings || {};
                    const values = Object.values(ratings).filter(v => typeof v === 'number');
                    if (values.length > 0) {
                      totalRating += values.reduce((a, b) => a + b, 0) / values.length;
                      ratingCount++;
                    }
                  });

                  const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0;

                  return (
                    <tr key={name} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">{name}</td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {records.map((r, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                              {r.reviewer_name}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-20 bg-slate-100 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary" 
                              style={{ width: `${(avgRating / 5) * 100}%` }}
                            />
                          </div>
                          <span>{avgRating.toFixed(1)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="gap-2 rounded-lg"
                          onClick={() => downloadReport(name, records)}
                        >
                          <Download className="h-4 w-4" />
                          Full Report
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
