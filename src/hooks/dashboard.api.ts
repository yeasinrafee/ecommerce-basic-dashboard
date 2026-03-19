import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/api";

type DashboardQuery = {
  startDate?: string;
  endDate?: string;
  month?: string;
  year?: string;
};

export const dashboardApis = {
  useGetAnalytics: (query: DashboardQuery) => {
    return useQuery({
      queryKey: ["dashboard-analytics", query],
      queryFn: async () => {
        const response = await API.get("/dashboard/analytics", { params: query });
        return response.data;
      },
    });
  },
};
