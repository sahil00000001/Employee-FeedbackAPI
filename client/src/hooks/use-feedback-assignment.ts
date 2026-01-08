import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function useFeedbackAssignments(employeeId: string) {
  return useQuery({
    queryKey: ['/api/feedback-assignment', employeeId],
    queryFn: async () => {
      const res = await fetch(`/api/feedback-assignment/${employeeId}`);
      if (!res.ok) throw new Error("Failed to fetch assignments");
      return res.json();
    },
    enabled: !!employeeId,
  });
}

export function useAssignReviewer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { 
      employee_id: string; 
      name: string; 
      manager_id: string; 
      reviewer_id: string; 
      reviewer_name: string; 
    }) => {
      const res = await fetch('/api/feedback-assignment/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to assign reviewer");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback-assignment', variables.employee_id] });
    },
  });
}

export function useRemoveReviewer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { employee_id: string; reviewer_id: string }) => {
      const res = await fetch('/api/feedback-assignment/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to remove reviewer");
      return res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/feedback-assignment', variables.employee_id] });
    },
  });
}