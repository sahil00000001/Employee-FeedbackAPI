import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useEmployeeFeedback(employeeId: string) {
  return useQuery<any>({
    queryKey: ["/api/feedback-360/employee", employeeId],
    queryFn: async () => {
      const url = `/api/feedback-360/employee/${employeeId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch feedback");
      return res.json();
    },
    enabled: !!employeeId,
  });
}

export function useFeedbackSummary(employeeId: string) {
  return useQuery<any>({
    queryKey: ["/api/feedback-360/summary", employeeId],
    queryFn: async () => {
      const url = `/api/feedback-360/summary/${employeeId}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch feedback summary");
      return res.json();
    },
    enabled: !!employeeId,
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/feedback-360/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        throw new Error("Failed to submit feedback");
      }
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/feedback-360/employee", variables.employeeId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ["/api/feedback-360/summary", variables.employeeId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: [`/api/feedback-assignment/reviewer/${variables.reviewerId}`] 
      });
    },
  });
}
