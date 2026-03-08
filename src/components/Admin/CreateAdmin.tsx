"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "@/components/Common/Modal";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomButton from "@/components/Common/CustomButton";
import { useCreateAdmin, useUpdateAdmin } from "@/hooks/admin.api";

const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("A valid email is required"),
  password: z.string().min(8, "Password must be at least 8 characters").optional()
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<FormSchema> & { id?: string };
}

export default function CreateAdmin({ open, onOpenChange, defaultValues }: Props) {
  const isEdit = Boolean(defaultValues?.id);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: { name: defaultValues?.name ?? "", email: defaultValues?.email ?? "", password: undefined }
  });

  React.useEffect(() => {
    reset({ name: defaultValues?.name ?? "", email: defaultValues?.email ?? "", password: undefined });
  }, [defaultValues, reset]);

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();

  const onSubmit = async (data: FormSchema) => {
    if (isEdit && defaultValues?.id) {
      await updateMutation.mutateAsync({ id: defaultValues.id, payload: { name: data.name, email: data.email } });
      onOpenChange(false);
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    if (data.password) formData.append("password", data.password);
    // image handling left to future: users can extend to append file under 'image'

    await createMutation.mutateAsync(formData);
    reset({ name: "", email: "", password: undefined });
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Update Admin" : "Create Admin"}
      description={isEdit ? "Edit admin details" : "Create a new admin"}
      footer={
        <div className="flex gap-2">
          <CustomButton loading={isSubmitting} type="button" onClick={handleSubmit(onSubmit)}>
            {isEdit ? "Update" : "Create"}
          </CustomButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <CustomInput label="Name" {...register("name")} error={errors.name?.message} requiredMark />
          <CustomInput label="Email" {...register("email")} error={errors.email?.message} requiredMark />
          {!isEdit && <CustomInput label="Password" type="password" {...register("password")} error={errors.password?.message} requiredMark />}
        </div>
      </form>
    </Modal>
  );
}