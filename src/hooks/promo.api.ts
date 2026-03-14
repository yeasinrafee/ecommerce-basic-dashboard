import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PromoRoutes } from "@/routes/promo.route";
import type { ApiResponse } from "@/types/auth";
import { toast } from "react-hot-toast";
import { Product } from "./product.api";

export interface PromoProduct {
  id: string;
  promoId: string;
  productId: string;
  product?: Product; // Usually loaded relation
  createdAt: string;
  updatedAt: string;
}

export interface Promo {
  id: string;
  code: string;
  discountType: "PERCENTAGE_DISCOUNT" | "FLAT_DISCOUNT" | "NONE";
  discountValue: number;
  numberOfUses: number;
  startDate: string;
  endDate: string;
  createdAt: string;
  updatedAt: string;
  promoProducts?: PromoProduct[];
}

export interface PromoListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PagedResult<T> {
  data: T[];
  meta: PromoListMeta;
}

type MetaRecord = Record<string, unknown>;

const toNumber = (value: unknown, fallback: number) => {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
};

const normalizeMeta = (meta: MetaRecord, page: number, limit: number, fallbackTotal: number): PromoListMeta => {
  return {
    page: toNumber(meta?.page, page),
    limit: toNumber(meta?.limit, limit),
    total: toNumber(meta?.total, fallbackTotal),
    totalPages: toNumber(meta?.totalPages, 1),
  };
};

const ensurePayload = <T>(response: ApiResponse<T>, fallbackMessage: string) => {
  if (!response.success || response.data == null) {
    throw new Error(response.message || fallbackMessage);
  }
  return response.data;
};

const fetchPaginatedPromos = async (
  page: number,
  limit: number,
  searchTerm?: string
): Promise<PagedResult<Promo>> => {
  const response = await apiClient.get<ApiResponse<Promo[]>>(PromoRoutes.getAllPaginated, {
    params: { page, limit, searchTerm },
  });

  const items = ensurePayload(response.data, "Failed to load promos");
  // @ts-ignore
  const meta = normalizeMeta(response.data.meta || {}, page, limit, items.length);

  return {
    data: items,
    meta,
  };
};

const fetchAllPromos = async (): Promise<Promo[]> => {
  const response = await apiClient.get<ApiResponse<Promo[]>>(PromoRoutes.getAll);
  return ensurePayload(response.data, "Failed to load promos");
};

export const promoKeys = {
  all: ["promos"] as const,
  paginated: (page: number, limit: number, searchTerm?: string) =>
    [...promoKeys.all, "paginated", page, limit, searchTerm] as const,
  list: () => [...promoKeys.all, "list"] as const,
};

export const usePaginatedPromos = (page: number, limit = 10, searchTerm?: string) => {
  return useQuery<PagedResult<Promo>>({
    queryKey: promoKeys.paginated(page, limit, searchTerm),
    queryFn: () => fetchPaginatedPromos(page, limit, searchTerm),
    placeholderData: keepPreviousData,
  });
};

export const useAllPromos = () => {
  return useQuery<Promo[]>({
    queryKey: promoKeys.list(),
    queryFn: fetchAllPromos,
  });
};

export const useCreatePromo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { code: string; discountType: string; discountValue: number; numberOfUses: number; startDate: string; endDate: string; productIds: string[] }) => {
      const response = await apiClient.post<ApiResponse<Promo>>(PromoRoutes.create, payload);
      const data = ensurePayload(response.data, "Failed to create promo");
      return { message: response.data.message, payload: data };
    },
    onSuccess: async (result: { message: string; payload: Promo }) => {
      toast.success(result.message || "Promo created");
      await queryClient.invalidateQueries({ queryKey: promoKeys.all });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || "Failed to create promo";
      toast.error(message);
    }
  });
};

export const useUpdatePromo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: any }) => {
      const response = await apiClient.patch<ApiResponse<Promo>>(PromoRoutes.update(id), payload);
      const data = ensurePayload(response.data, "Failed to update promo");
      return { message: response.data.message, payload: data };
    },
    onSuccess: async (result: { message: string; payload: Promo }) => {
      toast.success(result.message || "Promo updated");
      await queryClient.invalidateQueries({ queryKey: promoKeys.all });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || "Failed to update promo";
      toast.error(message);
    }
  });
};

export const useDeletePromo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<null>>(PromoRoutes.delete(id));
      const message = response.data.message;
      return { message, id };
    },
    onSuccess: async (result: { message?: string; id: string }) => {
      toast.success(result.message || "Promo deleted");
      await queryClient.invalidateQueries({ queryKey: promoKeys.all });
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || err?.message || "Failed to delete promo";
      toast.error(message);
    }
  });
};
