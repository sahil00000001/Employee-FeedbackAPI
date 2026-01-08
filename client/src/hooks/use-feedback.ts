import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import type { InsertFeedback360 } from "@shared/schema";
import { z } from "zod";

export function useEmployeeFeedback(employeeId: string) {
  return useQuery({
    queryKey: [api.feedback.listForEmployee.path, employeeId],
    queryFn: async () => {
      const url = buildUrl(api.feedback.listForEmployee.path, { employeeId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feedback");
      return api.feedback.listForEmployee.responses[200].parse(await res.json());
    },
    enabled: !!employeeId,
  });
}

export function useFeedbackSummary(employeeId: string) {
  return useQuery({
    queryKey: [api.feedback.summary.path, employeeId],
    queryFn: async () => {
      const url = buildUrl(api.feedback.summary.path, { employeeId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch feedback summary");
      return api.feedback.summary.responses[200].parse(await res.json());
    },
    enabled: !!employeeId,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertFeedback360) => {
      // Coerce numeric fields from strings if coming from form inputs
      const coercedData = {
        ...data,
        technicalSkills: Number(data.technicalSkills),
        communication: Number(data.communication),
        teamwork: Number(data.teamwork),
        leadership: Number(data.leadership),
        problemSolving: Number(data.problemSolving),
      };

      const validated = api.feedback.submit.input.parse(coercedData);
      
      const res = await fetch(api.feedback.submit.path, {
        method: api.feedback.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 400) {
          const error = api.feedback.submit.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to submit feedback");
      }
      return api.feedback.submit.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: [api.feedback.listForEmployee.path, variables.employeeId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [api.feedback.summary.path, variables.employeeId] 
      });
    },
  });
}
