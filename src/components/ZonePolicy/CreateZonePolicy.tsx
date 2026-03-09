"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import CustomInput from "@/components/FormFields/CustomInput"
import Modal from "@/components/Common/Modal"
import CustomButton from "@/components/Common/CustomButton"

const schema = z.object({
  policyName: z.string().min(1, "Policy name is required"),
  deliveryTime: z.number().min(0, "Delivery time is required"),
  shippingCost: z.number().min(0, "Shipping cost is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
})

type FormSchema = z.infer<typeof schema>

interface Props {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  defaultValues?: Partial<FormSchema>
  onSubmit?: (data: FormSchema) => Promise<void> | void
  submitting?: boolean
  inline?: boolean
}

export default function CreateZonePolicy({ open = true, onOpenChange, defaultValues, onSubmit, submitting = false, inline = false }: Props) {
  const isEdit = Boolean(defaultValues && defaultValues.policyName)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      policyName: defaultValues?.policyName ?? "",
      deliveryTime: defaultValues?.deliveryTime ?? 0,
      shippingCost: defaultValues?.shippingCost ?? 0,
      status: defaultValues?.status
    }
  })

  React.useEffect(() => {
    reset({
      policyName: defaultValues?.policyName ?? "",
      deliveryTime: defaultValues?.deliveryTime ?? 0,
      shippingCost: defaultValues?.shippingCost ?? 0,
      status: defaultValues?.status
    })
  }, [defaultValues, reset])

  const submit = async (data: FormSchema) => {
    if (onSubmit) await onSubmit(data)
    reset({ policyName: "", deliveryTime: 0, shippingCost: 0, status: undefined })
  }

  const form = (
    <form onSubmit={handleSubmit(submit)}>
      <div className="space-y-4">
        <CustomInput label="Policy Name" {...register("policyName" as any)} error={(errors as any).policyName?.message} requiredMark />
        <CustomInput label="Delivery Time" {...register("deliveryTime" as any, { valueAsNumber: true })} error={(errors as any).deliveryTime?.message} requiredMark />
        <CustomInput label="Shipping Cost" {...register("shippingCost" as any, { valueAsNumber: true })} error={(errors as any).shippingCost?.message} requiredMark />

        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select {...register("status" as any)} className="w-full border rounded p-2">
            <option value="">Select status</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>
        </div>
      </div>
    </form>
  )

  if (inline) {
    return (
      <div className="p-4 max-w-2xl">
        <h2 className="mb-4 text-lg font-medium">{isEdit ? "Update Zone Policy" : "Create Zone Policy"}</h2>
        <p className="text-sm text-muted-foreground mb-4">{isEdit ? "Edit zone policy" : "Create a new zone policy"}</p>
        {form}
        <div className="mt-4 flex gap-2">
          <CustomButton loading={isSubmitting || submitting} type="button" onClick={handleSubmit(submit)}>
            {isEdit ? "Update" : "Create"}
          </CustomButton>
        </div>
      </div>
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={(v) => onOpenChange && onOpenChange(v)}
      title={isEdit ? "Update Zone Policy" : "Create Zone Policy"}
      description={isEdit ? "Edit zone policy" : "Create a new zone policy"}
      footer={
        <div className="flex gap-2">
          <CustomButton loading={isSubmitting || submitting} type="button" onClick={handleSubmit(submit)}>
            {isEdit ? "Update" : "Create"}
          </CustomButton>
        </div>
      }
    >
      {form}
    </Modal>
  )
}