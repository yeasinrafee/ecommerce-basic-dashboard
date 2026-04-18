"use client";

import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import CustomButton from "@/components/Common/CustomButton";
import CustomDatePicker from "@/components/FormFields/CustomDatePicker";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomSelect from "@/components/FormFields/CustomSelect";
import { Input } from "@/components/ui/input";
import type { Product } from "@/hooks/product.api";
import { useCreateOffer, useGetOffer, useOfferProductSearch, useUpdateOffer } from "@/hooks/offer.api";
import { Search, X } from "lucide-react";

const nullableNumberSchema = z.preprocess((value) => {
	if (value === "" || value === null || value === undefined) return null;
	return Number(value);
}, z.number().nullable());

const nullableDateSchema = z.preprocess((value) => {
	if (value === "" || value === null || value === undefined) return null;
	if (value instanceof Date) return value;
	return new Date(String(value));
}, z.date().nullable());

const getDateKey = (value: Date | null | undefined) => value ? value.toISOString().slice(0, 10) : null;

const formSchema = z.object({
	discountType: z.union([z.enum(["PERCENTAGE_DISCOUNT", "FLAT_DISCOUNT"]), z.literal("")]),
	discountValue: nullableNumberSchema,
	discountStartDate: nullableDateSchema,
	discountEndDate: nullableDateSchema,
	status: z.enum(["ACTIVE", "INACTIVE"]),
	productIds: z.array(z.string().trim().min(1)).min(1, "Please choose at least one product")
}).superRefine((data, ctx) => {
	if (!data.discountType) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["discountType"],
			message: "Please choose a discount type."
		});
	}

	if (data.discountType && (data.discountValue == null || Number.isNaN(data.discountValue))) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["discountValue"],
			message: "Please enter a discount value."
		});
	} else if (data.discountType && data.discountValue != null) {
		if (data.discountValue <= 0) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["discountValue"],
				message: "Discount value must be greater than 0."
			});
		}

		if (data.discountType === "PERCENTAGE_DISCOUNT" && data.discountValue > 100) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				path: ["discountValue"],
				message: "Percentage discount cannot be greater than 100."
			});
		}
	}

	if (data.discountStartDate == null) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["discountStartDate"],
			message: "Please choose a start date."
		});
	}

	if (data.discountEndDate == null) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["discountEndDate"],
			message: "Please choose an end date."
		});
	}

	const startDateKey = getDateKey(data.discountStartDate);
	const endDateKey = getDateKey(data.discountEndDate);

	if (startDateKey && endDateKey && endDateKey < startDateKey) {
		ctx.addIssue({
			code: z.ZodIssueCode.custom,
			path: ["discountEndDate"],
			message: "Please make sure the end date is the same as or later than the start date."
		});
	}
});

type FormValues = z.infer<typeof formSchema>;

type OfferFormProps = {
	offerId?: string;
	title?: string;
	description?: string;
	onSuccess?: () => void;
};

const discountTypeOptions = [
	{ label: "Percentage Discount", value: "PERCENTAGE_DISCOUNT" },
	{ label: "Flat Discount", value: "FLAT_DISCOUNT" }
];

const statusOptions = [
	{ label: "Active", value: "ACTIVE" },
	{ label: "Inactive", value: "INACTIVE" }
];

const money = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

const getProductBasePrice = (product: Product) => {
	const basePrice = (product as any).Baseprice ?? product.basePrice ?? product.finalPrice ?? 0;
	return typeof basePrice === "number" && Number.isFinite(basePrice) ? basePrice : 0;
};

const calculateOfferPrice = (basePrice: number, discountType: FormValues["discountType"], discountValue: number | null) => {
	if (discountType === "FLAT_DISCOUNT") {
		return Math.max(0, basePrice - (discountValue ?? 0));
	}

	if (discountType === "PERCENTAGE_DISCOUNT") {
		return Math.max(0, basePrice - basePrice * ((discountValue ?? 0) / 100));
	}

	return basePrice;
};

const OfferForm = ({ offerId, title, description, onSuccess }: OfferFormProps) => {
	const router = useRouter();
	const isEdit = Boolean(offerId);
	const offerQuery = useGetOffer(offerId ?? "");
	const createMutation = useCreateOffer();
	const updateMutation = useUpdateOffer();

	const [searchInput, setSearchInput] = React.useState("");
	const [debouncedSearch, setDebouncedSearch] = React.useState("");
	const [searchOpen, setSearchOpen] = React.useState(false);
	const [selectedProducts, setSelectedProducts] = React.useState<Product[]>([]);
	const searchRef = React.useRef<HTMLDivElement | null>(null);

	const {
		register,
		control,
		handleSubmit,
		reset,
		setValue,
		formState: { errors, isSubmitting }
	} = useForm<FormValues>({
		mode: "onChange",
		resolver: zodResolver(formSchema) as any,
		defaultValues: {
			discountType: "",
			discountValue: null,
			discountStartDate: null,
			discountEndDate: null,
			status: "ACTIVE",
			productIds: []
		}
	});

	const discountType = useWatch({ control, name: "discountType" });
	const discountValue = useWatch({ control, name: "discountValue" });
	const discountStartDate = useWatch({ control, name: "discountStartDate" });
	const discountEndDate = useWatch({ control, name: "discountEndDate" });
	const status = useWatch({ control, name: "status" });

	React.useEffect(() => {
		const handle = window.setTimeout(() => {
			setDebouncedSearch(searchInput.trim());
		}, 500);

		return () => window.clearTimeout(handle);
	}, [searchInput]);

	const { data: productQuery } = useOfferProductSearch(debouncedSearch || undefined, 1, 8);
	const availableProducts = React.useMemo(() => {
		const products = productQuery?.data ?? [];
		const selectedIds = new Set(selectedProducts.map((item) => item.id));
		return products.filter((product) => !selectedIds.has(product.id));
	}, [productQuery, selectedProducts]);

	React.useEffect(() => {
		function handleDocClick(event: MouseEvent) {
			if (!searchRef.current) return;
			if (!searchRef.current.contains(event.target as Node)) {
				setSearchOpen(false);
			}
		}

		document.addEventListener("mousedown", handleDocClick);
		return () => document.removeEventListener("mousedown", handleDocClick);
	}, []);

	React.useEffect(() => {
		if (!offerQuery.data) return;

		const offer = offerQuery.data;
		const products = offer.offerProducts?.map((relation) => relation.product) ?? [];

		reset({
			discountType: offer.discountType === "PERCENTAGE_DISCOUNT" || offer.discountType === "FLAT_DISCOUNT" ? offer.discountType : "",
			discountValue: offer.discountValue,
			discountStartDate: offer.discountStartDate ? new Date(offer.discountStartDate) : null,
			discountEndDate: offer.discountEndDate ? new Date(offer.discountEndDate) : null,
			status: offer.status,
			productIds: products.map((product) => product.id)
		});

		setSelectedProducts(products);
	}, [offerQuery.data, reset]);

	React.useEffect(() => {
		setValue("productIds", selectedProducts.map((product) => product.id), { shouldValidate: true });
	}, [selectedProducts, setValue]);

	const addProduct = (product: Product) => {
		setSelectedProducts((current) => (current.some((item) => item.id === product.id) ? current : [...current, product]));
		setSearchInput("");
		setDebouncedSearch("");
		setSearchOpen(false);
	};

	const removeProduct = (id: string) => {
		setSelectedProducts((current) => current.filter((product) => product.id !== id));
	};

	const onSubmit = async (data: FormValues) => {
		if (!data.discountType) {
			return;
		}

		const payload = {
			discountType: data.discountType,
			discountValue: data.discountValue,
			discountStartDate: data.discountStartDate ? data.discountStartDate.toISOString() : null,
			discountEndDate: data.discountEndDate ? data.discountEndDate.toISOString() : null,
			status: data.status,
			productIds: selectedProducts.map((product) => product.id)
		};

		if (isEdit && offerId) {
			await updateMutation.mutateAsync({ id: offerId, payload });
		} else {
			await createMutation.mutateAsync(payload);
		}

		reset({
			discountType: "",
			discountValue: null,
			discountStartDate: null,
			discountEndDate: null,
			status: "ACTIVE",
			productIds: []
		});
		setSelectedProducts([]);
		setSearchInput("");
		setDebouncedSearch("");
		setSearchOpen(false);

		onSuccess?.();
		router.push("/dashboard/offers/manage");
	};

	const pending = isSubmitting || createMutation.isPending || updateMutation.isPending || offerQuery.isLoading;
	const currentOfferPrice = React.useCallback((product: Product) => {
		const base = getProductBasePrice(product);
		return calculateOfferPrice(base, discountType, discountValue ?? null);
	}, [discountType, discountValue]);

	return (
		<div className="space-y-6">
			{offerQuery.isLoading ? (
				<div className="rounded-2xl border bg-white p-6 text-sm text-slate-500">Loading offer details...</div>
			) : null}

			<Card className="border-slate-200 shadow-sm">
				<CardHeader className="border-b border-slate-100">
					<CardTitle>{isEdit ? "Update Offer" : "Create Offer"}</CardTitle>
					<CardDescription>Choose the discount settings and add one or more products.</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
							<CustomSelect
								name="status"
								control={control}
								label="Status"
								requiredMark
								options={statusOptions}
								triggerClassName="bg-white"
							/>
							<CustomSelect
								name="discountType"
								control={control}
								label="Discount Type"
								requiredMark
								options={discountTypeOptions}
								triggerClassName="bg-white"
							/>
							<CustomInput
								label="Discount Value"
								type="float"
								disabled={!discountType}
								requiredMark
								{...register("discountValue")}
								error={errors.discountValue?.message}
								helperText={!discountType ? "Choose a discount type first." : discountType === "PERCENTAGE_DISCOUNT" ? "Enter a percentage between 0 and 100." : "Enter a flat amount to subtract from the base price."}
							/>
							<Controller
								name="discountStartDate"
								control={control}
								render={({ field, fieldState }) => (
									<div className="space-y-2">
										<CustomDatePicker
											label="Start Date"
											value={field.value ?? null}
											onChange={field.onChange}
											placeholder="Select start date"
											requiredMark
										/>
										{fieldState.error?.message ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
									</div>
								)}
							/>
							<Controller
								name="discountEndDate"
								control={control}
								render={({ field, fieldState }) => (
									<div className="space-y-2">
										<CustomDatePicker
											label="End Date"
											value={field.value ?? null}
											onChange={field.onChange}
											placeholder="Select end date"
											requiredMark
										/>
										{fieldState.error?.message ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
									</div>
								)}
							/>
						</div>

						<div ref={searchRef} className="relative space-y-2">
							<label className="block text-sm font-medium text-slate-700">Add Products</label>
							<div className="relative">
								<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
								<Input
									value={searchInput}
									onChange={(event) => setSearchInput(event.target.value)}
									onFocus={() => setSearchOpen(true)}
									placeholder="Search by product name, SKU, or code"
									className="h-11 bg-white pl-10 pr-10"
								/>
								{searchInput ? (
									<button type="button" onClick={() => { setSearchInput(""); setDebouncedSearch(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
										<X className="h-4 w-4" />
									</button>
								) : null}
							</div>

							{searchOpen ? (
								<div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-white shadow-2xl">
									<div className="border-b px-4 py-3 text-xs uppercase tracking-[0.2em] text-slate-400">Search results</div>
									<div className="max-h-80 overflow-auto">
										{availableProducts.length > 0 ? availableProducts.map((product) => {
											const basePrice = getProductBasePrice(product);
											return (
												<button key={product.id} type="button" onClick={() => addProduct(product)} className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition hover:bg-slate-50">
													<div className="h-12 w-12 overflow-hidden rounded-lg border bg-slate-100">
														{product.image ? (
															<Image src={product.image} alt={product.name} width={48} height={48} className="h-12 w-12 object-cover" />
														) : null}
													</div>
													<div className="min-w-0 flex-1">
														<div className="flex items-center justify-between gap-3">
															<div className="min-w-0">
																<p className="truncate text-sm font-medium text-slate-900 flex items-center gap-1">{product.name} <span className="text-sm font-semibold text-slate-900">- ${money.format(basePrice)}</span></p>
																<p className="truncate text-xs text-slate-500">SKU: {(product as Product & { sku?: string | null }).sku || "-"}</p>
															</div>
														</div>
														<div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
															<Badge variant="outline" className="rounded-full bg-slate-50">Add to offer</Badge>
															<span>Click to include this product</span>
														</div>
													</div>
												</button>
											);
										}) : (
													<div className="px-4 py-8 text-center text-sm text-slate-500">No products found for this search.</div>
										)}
									</div>
								</div>
							) : null}
										<p className="text-xs text-slate-500">Search results are filtered by the backend; products already in other offers can still appear here.</p>
						</div>

						<div className="space-y-4">
							<div className="flex items-center justify-between">
								<div>
									<h3 className="text-sm font-semibold text-slate-900">Selected Products</h3>
									<p className="text-xs text-slate-500">{selectedProducts.length} product(s) attached to this offer.</p>
								</div>
								<Badge variant="outline" className="rounded-full px-3 py-1">{status}</Badge>
							</div>

							{errors.productIds?.message ? (
								<p className="text-sm text-red-600">{errors.productIds.message}</p>
							) : null}

							{selectedProducts.length > 0 ? (
								<div className="grid gap-3">
									{selectedProducts.map((product) => {
										const basePrice = getProductBasePrice(product);
										const offerPrice = currentOfferPrice(product);
										return (
											<div key={product.id} className="flex flex-col gap-3 rounded-2xl border bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
												<div className="flex items-center gap-3">
													<div className="h-14 w-14 overflow-hidden rounded-xl border bg-white">
														{product.image ? (
															<Image src={product.image} alt={product.name} width={56} height={56} className="h-14 w-14 object-cover" />
														) : null}
													</div>
													<div>
														<p className="font-medium text-slate-900">{product.name}</p>
														<p className="text-xs text-slate-500">SKU: {(product as Product & { sku?: string | null }).sku || "-"}</p>
														<div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
															<span>Base: ${money.format(basePrice)}</span>
															<span>Offer: ${money.format(offerPrice)}</span>
															{discountType ? <Badge variant="secondary" className="rounded-full">{discountType.replace(/_/g, " ")}</Badge> : null}
														</div>
													</div>
												</div>
												<Button type="button" variant="ghost" size="sm" onClick={() => removeProduct(product.id)} className="self-end md:self-auto">
													<X className="mr-2 h-4 w-4" />
													Remove
												</Button>
											</div>
										);
									})}
								</div>
							) : (
								<div className="rounded-2xl border border-dashed bg-white p-6 text-sm text-slate-500">Search for products above and click one to add it to this offer.</div>
							)}
						</div>

						<div className="flex justify-center border-t pt-6">
							<CustomButton type="submit" loading={pending}>
								{isEdit ? "Update Offer" : "Create Offer"}
							</CustomButton>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
};

export default OfferForm;
