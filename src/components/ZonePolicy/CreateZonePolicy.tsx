"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import CustomInput from "@/components/FormFields/CustomInput"
import CustomButton from "@/components/Common/CustomButton"
import { useAllZonePolicies, useCreateZonePolicy, useUpdateZonePolicy } from "@/hooks/zone-policy.api"

const schema = z.object({
  policyName: z.string().min(1, "Policy name is required"),
  deliveryTime: z.number().min(0, "Delivery time is required"),
  shippingCost: z.number().min(0, "Shipping cost is required")
})

type FormSchema = z.infer<typeof schema>

export default function CreateZonePolicy() {
  const { data: all } = useAllZonePolicies()
  const existing = (all && all.length > 0) ? all[0] : null

  const createMutation = useCreateZonePolicy()
  const updateMutation = useUpdateZonePolicy()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: existing ? { policyName: existing.policyName, deliveryTime: existing.deliveryTime, shippingCost: existing.shippingCost } : undefined
  })

  React.useEffect(() => {
    if (existing) {
      reset({ policyName: existing.policyName, deliveryTime: existing.deliveryTime, shippingCost: existing.shippingCost })
    }
  }, [existing, reset])

  const onSubmit = async (values: FormSchema) => {
    if (existing) {
      await updateMutation.mutateAsync({ id: existing.id, payload: values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  return (
    <div className="p-4">
      <h2 className="mb-4 text-lg font-medium">Zone Policy</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="max-w-md">
        <div className="space-y-4">
          <CustomInput label="Policy Name" {...register("policyName" as any)} error={(errors as any).policyName?.message} requiredMark />
          <CustomInput label="Delivery Time" {...register("deliveryTime" as any, { valueAsNumber: true })} error={(errors as any).deliveryTime?.message} requiredMark />
          <CustomInput label="Shipping Cost" {...register("shippingCost" as any, { valueAsNumber: true })} error={(errors as any).shippingCost?.message} requiredMark />
        </div>

        <div className="mt-4">
          <CustomButton loading={isSubmitting || createMutation.isPending || updateMutation.isPending} type="button" onClick={handleSubmit(onSubmit)}>
            {existing ? "Update" : "Save"}
          </CustomButton>
        </div>
      </form>
    </div>
  )
}