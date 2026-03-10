"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomButton from "@/components/Common/CustomButton";
import DeleteModal from "@/components/Common/DeleteModal";
import * as api from "@/hooks/shipping.api";

const schema = z.object({
  minimumFreeShippingAmount: z.coerce
    .number()
    .min(0, "Minimum free shipping amount is required"),
  tax: z.coerce.number().min(0, "Tax is required"),
  defaultShippingCharge: z.coerce
    .number()
    .min(0, "Default shipping charge is required"),
  // weight in grams
  maximumWeight: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  // dimensions in cm (length, width, height). Backend will multiply and store as volume.
  length: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  width: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  height: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  chargePerWeight: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  chargePerVolume: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  weightUnit: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
  volumeUnit: z.preprocess(
    (v) => (v === "" || v === null ? undefined : v),
    z.coerce.number().optional(),
  ),
});

type FormSchema = z.infer<typeof schema>;

const EMPTY_FORM_VALUES = {
  minimumFreeShippingAmount: "",
  tax: "",
  defaultShippingCharge: "",
  maximumWeight: "",
  length: "",
  width: "",
  height: "",
  chargePerWeight: "",
  chargePerVolume: "",
  weightUnit: "",
  volumeUnit: "",
};

const getFormValues = (shipping: api.Shipping | null | undefined) => {
  if (!shipping) {
    return EMPTY_FORM_VALUES;
  }

  return {
    minimumFreeShippingAmount: shipping.minimumFreeShippingAmount ?? "",
    tax: shipping.tax ?? "",
    defaultShippingCharge: shipping.defaultShippingCharge ?? "",
    maximumWeight: shipping.maximumWeight ?? "",
    length: shipping.length ?? "",
    width: shipping.width ?? "",
    height: shipping.height ?? "",
    chargePerWeight: shipping.chargePerWeight ?? "",
    chargePerVolume: shipping.chargePerVolume ?? "",
    weightUnit: shipping.weightUnit ?? "",
    volumeUnit: shipping.volumeUnit ?? "",
  };
};

export default function ManageShipping() {
  const { data: shipping, isLoading } = api.useGetShipping();
  const createMutation = api.useCreateShipping();
  const updateMutation = api.useUpdateShipping();
  const resetMutation = api.useResetShipping();
  const [openDeleteModal, setOpenDeleteModal] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema) as any,
    defaultValues: getFormValues(shipping) as any,
  });

  React.useEffect(() => {
    reset(getFormValues(shipping) as any);
  }, [shipping, reset]);

  const onSubmit = async (data: FormSchema) => {
    const payload = { ...data } as any;
    if (shipping && (shipping as any).id) {
      await updateMutation.mutateAsync({ id: (shipping as any).id, payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
  };

  return (
    <div className="p-4 max-w-3xl bg-white border border-slate-200 rounded-md p-6">
      <h2 className="mb-2 text-lg font-medium">Shipping Settings</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Create or update shipping configuration. Only one record is allowed.
      </p>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomInput
              label="Minimum free shipping amount"
              helperText="Amount threshold for free shipping"
              type="float"
              {...register("minimumFreeShippingAmount" as any, {
                valueAsNumber: true,
              })}
              error={(errors as any).minimumFreeShippingAmount?.message}
              requiredMark
            />
            <CustomInput
              label="Tax"
              helperText="Tax percentage or amount"
              type="float"
              {...register("tax" as any, { valueAsNumber: true })}
              error={(errors as any).tax?.message}
              requiredMark
            />

            <CustomInput
              label="Default shipping charge"
              helperText="Default charge applied to orders"
              type="float"
              {...register("defaultShippingCharge" as any, {
                valueAsNumber: true,
              })}
              error={(errors as any).defaultShippingCharge?.message}
              requiredMark
              containerClassName="md:col-span-2"
            />

            {/* Weight fields grouped side-by-side (grams) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <CustomInput
                label="Maximum weight (grams)"
                helperText="Optional maximum weight in grams"
                type="float"
                {...register("maximumWeight" as any, { valueAsNumber: true })}
                error={(errors as any).maximumWeight?.message}
              />
              <CustomInput
                label="Weight unit"
                helperText="Optional float value for weight unit"
                type="float"
                {...register("weightUnit" as any, { valueAsNumber: true })}
                error={(errors as any).weightUnit?.message}
              />
              <CustomInput
                label="Extra Charge"
                helperText="Optional charge per unit weight"
                type="float"
                {...register("chargePerWeight" as any, { valueAsNumber: true })}
                error={(errors as any).chargePerWeight?.message}
              />
            </div>

            {/* Dimensions (cm): length, width, height - backend multiplies them to compute volume */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Maximum dimensions (cm)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <CustomInput
                  label="Length (cm)"
                  helperText="Enter length in cm"
                  type="float"
                  {...register("length" as any, { valueAsNumber: true })}
                  error={(errors as any).length?.message}
                />
                <CustomInput
                  label="Width (cm)"
                  helperText="Enter width in cm"
                  type="float"
                  {...register("width" as any, { valueAsNumber: true })}
                  error={(errors as any).width?.message}
                />
                <CustomInput
                  label="Height (cm)"
                  helperText="Enter height in cm"
                  type="float"
                  {...register("height" as any, { valueAsNumber: true })}
                  error={(errors as any).height?.message}
                />
              </div>
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <CustomInput
                label="Volume unit"
                helperText="Optional float value for volume unit"
                type="float"
                {...register("volumeUnit" as any, { valueAsNumber: true })}
                error={(errors as any).volumeUnit?.message}
              />
              <CustomInput
                label="Extra Charge"
                helperText="Optional charge per unit volume (per cm³)"
                type="float"
                {...register("chargePerVolume" as any, { valueAsNumber: true })}
                error={(errors as any).chargePerVolume?.message}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-x-4">
            <CustomButton
              variant="primary"
              size="md"
              className="bg-red-500 text-white"
              loading={resetMutation.isPending}
              type="button"
              onClick={() => setOpenDeleteModal(true)}
            >
              Reset all
            </CustomButton>

            <CustomButton
              loading={
                isSubmitting ||
                createMutation.isPending ||
                updateMutation.isPending
              }
              type="button"
              onClick={handleSubmit(onSubmit)}
            >
              {shipping ? "Update shipping" : "Create shipping"}
            </CustomButton>
          </div>
          <DeleteModal
            open={openDeleteModal}
            onOpenChange={setOpenDeleteModal}
            title="Reset shipping settings"
            description={
              "This will permanently delete the shipping record from the database and reset all form values."
            }
            onConfirm={async () => {
              try {
                await resetMutation.mutateAsync();
                reset(EMPTY_FORM_VALUES as any);
                setOpenDeleteModal(false);
              } catch (e) {
                // onError in hook shows toast; keep modal open for retry or user cancel
              }
            }}
            loading={resetMutation.isPending}
            confirmLabel="Reset"
          />
        </form>
      )}
    </div>
  );
}
