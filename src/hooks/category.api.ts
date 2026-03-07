import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { CategoryRoutes } from "@/routes/category.route";
import type { ApiResponse } from "@/types/auth";
import { toast } from "react-hot-toast";

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  data: T[];
  meta: CategoryListMeta;
}

type MetaRecord = Record<string, unknown>;

const toNumber = (value: unknown, fallback: number) => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const normalizeMeta = (meta: MetaRecord, page: number, limit: number, fallbackTotal: number): CategoryListMeta => {
  return {
    page: toNumber(meta.page, page),
    limit: toNumber(meta.limit, limit),
    total: toNumber(meta.total, fallbackTotal),
    totalPages: toNumber(meta.totalPages, 1)
  };
};

const ensurePayload = <T>(response: ApiResponse<T>, fallbackMessage: string) => {
  if (!response.success || response.data == null) {
    throw new Error(response.message || fallbackMessage);
  }

  return response.data;
};

const fetchPaginatedCategories = async (page: number, limit: number): Promise<PagedResult<Category>> => {
  const response = await apiClient.get<ApiResponse<Category[]>>(CategoryRoutes.getAllPaginated, {
    params: { page, limit }
  });

  const categories = ensurePayload(response.data, "Failed to load categories");
  const meta = normalizeMeta(response.data.meta, page, limit, categories.length);

  return {
    data: categories,
    meta
  };
};

const fetchAllCategories = async (): Promise<Category[]> => {
  const response = await apiClient.get<ApiResponse<Category[]>>(CategoryRoutes.getAll);
  return ensurePayload(response.data, "Failed to load categories");
};

export const categoryKeys = {
  all: ["categories"] as const,
  paginated: (page: number, limit: number) => [...categoryKeys.all, "paginated", page, limit] as const,
  list: () => [...categoryKeys.all, "list"] as const
};

export const usePaginatedCategories = (page: number, limit = 10) => {
  return useQuery<PagedResult<Category>>({
    queryKey: categoryKeys.paginated(page, limit),
    queryFn: () => fetchPaginatedCategories(page, limit),
    placeholderData: keepPreviousData
  });
};

export const useAllCategories = () => {
  return useQuery<Category[]>({
    queryKey: categoryKeys.list(),
    queryFn: fetchAllCategories
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const response = await apiClient.post<ApiResponse<Category>>(CategoryRoutes.create, { name });
      return ensurePayload(response.data, "Failed to create category");
    },
    onSuccess: async () => {
      toast.success("Category created successfully");
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to create category");
    }
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name }: { id: string; name: string }) => {
      const response = await apiClient.patch<ApiResponse<Category>>(CategoryRoutes.update(id), { name });
      return ensurePayload(response.data, "Failed to update category");
    },
    onSuccess: async () => {
      toast.success("Category updated successfully");
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update category");
    }
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(CategoryRoutes.delete(id));
      return id;
    },
    onSuccess: async () => {
      toast.success("Category deleted");
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete category");
    }
  });
};
