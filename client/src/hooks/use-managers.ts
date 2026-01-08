import { useQuery } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useManagers() {
  return useQuery({
    queryKey: [api.managers.list.path],
    queryFn: async () => {
      const res = await fetch(api.managers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch managers");
      return api.managers.list.responses[200].parse(await res.json());
    },
  });
}

export function useManagerTeam(managerId: string) {
  return useQuery({
    queryKey: [api.managers.getTeam.path, managerId],
    queryFn: async () => {
      const url = buildUrl(api.managers.getTeam.path, { managerId });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch manager team");
      return api.managers.getTeam.responses[200].parse(await res.json());
    },
    enabled: !!managerId,
  });
}
