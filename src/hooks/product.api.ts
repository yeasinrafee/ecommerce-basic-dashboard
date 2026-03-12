import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { apiClient } from "@/lib/api";
import { ProductRoutes } from "@/routes/product.route";
import type { ApiResponse } from "@/types/auth";

export interface Product {
	id: string;
	name: string;
	slug: string;
	image?: string | null;
	brand?: any;
	categories?: any[];
	tags?: any[];
	stock?: number;
	status?: string;
	stockStatus?: string;
	basePrice?: number;
	finalPrice?: number;
	createdAt: string;
	updatedAt: string;
}

export interface PagedResult<T> {
	data: T[];
	meta: {
		page: number;
		limit: number;
		total: number;
		totalPages: number;
	};
}

export const productKeys = {
	all: ["products"] as const,
	paginated: (page: number, limit: number) => [...productKeys.all, "paginated", page, limit] as const,
	list: () => [...productKeys.all, "list"] as const,
	detail: (id: string) => [...productKeys.all, "detail", id] as const
};

const ensurePayload = <T>(response: ApiResponse<T>, fallbackMessage: string) => {
	if (!response.success || response.data == null) {
		throw new Error(response.message || fallbackMessage);
	}

	return response.data;
};

const toNumber = (value: unknown, fallback: number) => {
	return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
};

const normalizeMeta = (meta: Record<string, unknown>, page: number, limit: number, fallbackTotal: number) => {
	return {
		page: toNumber(meta.page, page),
		limit: toNumber(meta.limit, limit),
		total: toNumber(meta.total, fallbackTotal),
		totalPages: toNumber(meta.totalPages, 1)
	};
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

const fetchPaginatedProducts = async (page: number, limit: number) => {
	const response = await apiClient.get<ApiResponse<Product[]>>(ProductRoutes.getAllPaginated, { params: { page, limit } });
	const products = ensurePayload(response.data, 'Failed to load products');
	const meta = normalizeMeta(response.data.meta as Record<string, unknown>, page, limit, products.length);
	return { data: products, meta } as PagedResult<Product>;
};

const fetchAllProducts = async (): Promise<Product[]> => {
	const response = await apiClient.get<ApiResponse<Product[]>>(ProductRoutes.getAll);
	return ensurePayload(response.data, 'Failed to load products');
};

const fetchProductById = async (id: string): Promise<Product> => {
	const response = await apiClient.get<ApiResponse<Product>>(ProductRoutes.getById(id));
	return ensurePayload(response.data, 'Failed to load product');
};

const deleteProductReq = async (id: string) => {
	const response = await apiClient.delete<ApiResponse<null>>(ProductRoutes.delete(id));
	return ensurePayload(response.data, 'Failed to delete product');
};

export const usePaginatedProducts = (page: number, limit = 20) => {
	return useQuery<PagedResult<Product>>({
		queryKey: productKeys.paginated(page, limit),
		queryFn: () => fetchPaginatedProducts(page, limit),
		placeholderData: keepPreviousData
	});
};

export const useAllProducts = () => {
	return useQuery<Product[]>({
		queryKey: productKeys.list(),
		queryFn: fetchAllProducts
	});
};

export const useGetProduct = (id: string) => {
	return useQuery<Product | null>({
		queryKey: productKeys.detail(id),
		queryFn: () => fetchProductById(id),
		enabled: !!id
	});
};

export const useDeleteProduct = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: deleteProductReq,
		onSuccess: async () => {
			await queryClient.invalidateQueries({ queryKey: productKeys.all });
		}
	});
};

