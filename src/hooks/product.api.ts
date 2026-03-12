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
	all: ["products"] as const
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
