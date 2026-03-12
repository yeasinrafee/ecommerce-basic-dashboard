import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { ProductRoutes } from "@/routes/product.route";
import type { ApiResponse } from "@/types/auth";

export interface Product {
	id: string;
	name: string;
	slug: string;
	image?: string | null;
	createdAt: string;
	updatedAt: string;
}

export const productKeys = {
	all: ["products"] as const,
	paginated: (page: number, limit: number) => ["products", "paginated", page, limit] as const,
	byId: (id: string) => ["products", "byId", id] as const
};

const ensurePayload = <T>(response: ApiResponse<T>, fallbackMessage: string) => {
	if (!response.success || response.data == null) {
		throw new Error(response.message || fallbackMessage);
	}

	return response.data;
};

export const useCreateProduct = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async (payload: FormData) => {
			const response = await apiClient.post<ApiResponse<Product>>(ProductRoutes.create, payload);
			const data = ensurePayload(response.data, "Failed to create product");
			return { message: response.data.message, payload: data };
		},
		onSuccess: async (result: { message: string; payload: Product }) => {
			toast.success(result.message || "Product created successfully");
			await queryClient.invalidateQueries({ queryKey: productKeys.all });
		},
		onError: (err: any) => {
			const message = err?.response?.data?.message || err?.message || "Failed to create product";
			toast.error(message);
		}
	});
};

export const useGetProducts = (page = 1, limit = 20) => {
	return apiClient.get<ApiResponse<{ data: Product[]; meta: any }>>(
		ProductRoutes.getAllPaginated,
		{ params: { page, limit } }
	);
};

export const useGetAllProducts = () => {
	return apiClient.get<ApiResponse<Product[]>>(ProductRoutes.getAll);
};

export const useGetProduct = (id: string) => {
	return apiClient.get<ApiResponse<Product>>(ProductRoutes.getById(id));
};

export const useDeleteProduct = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: async (id: string) => {
			const response = await apiClient.delete<ApiResponse<null>>(ProductRoutes.delete(id));
			return ensurePayload(response.data, "Failed to delete product");
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: productKeys.all });
		}
	});
};
