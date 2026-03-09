"use client"

import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import CustomInput from "@/components/FormFields/CustomInput"
import Modal from "@/components/Common/Modal"
import CustomButton from "@/components/Common/CustomButton"
import CustomCheckbox from "@/components/FormFields/CustomCheckbox"
import { useAllZones } from '@/hooks/zone.api'

const schema = z.object({
  policyName: z.string().min(1, "Policy name is required"),
  deliveryTime: z.number().min(0, "Delivery time is required"),
  shippingCost: z.number().min(0, "Shipping cost is required"),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional()
  ,
  zoneIds: z.array(z.string()).optional()
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
    const payload = { ...data, zoneIds: selectedZones }
    if (onSubmit) await onSubmit(payload as any)
    reset({ policyName: "", deliveryTime: 0, shippingCost: 0, status: undefined })
    setSelectedZones([])
  }

  const { data: zones } = useAllZones()
  const [selectedZones, setSelectedZones] = React.useState<string[]>(defaultValues?.zoneIds ?? [])

  React.useEffect(() => {
    setSelectedZones(defaultValues?.zoneIds ?? [])
  }, [defaultValues])

  const toggleZone = (id: string) => {
    setSelectedZones((prev) => (prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]))
  }

  const form = (
    <form onSubmit={handleSubmit(submit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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

        <div>
          <label className="block text-sm font-medium mb-2">Zones</label>
          <div className="rounded-lg border border-slate-200 bg-white p-3 max-h-64 overflow-y-auto">
            <div className="flex flex-col gap-2">
              {zones && zones.length > 0 ? (
                zones.map((z) => (
                  <CustomCheckbox key={z.id} label={z.name} checked={selectedZones.includes(z.id)} onCheckedChange={() => toggleZone(z.id)} />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No zones available</p>
              )}
            </div>
          </div>
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