"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomTextArea from "@/components/FormFields/CustomTextArea";
import CustomFileUpload from "@/components/FormFields/CustomFileUpload";
import Modal from "@/components/Common/Modal";
import CustomButton from "@/components/Common/CustomButton";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  designation: z.string().min(1, "Designation is required"),
  rating: z.string()
    .min(1, "Rating is required")
    .refine((val) => !isNaN(parseFloat(val)), "Rating must be a number")
    .transform((val) => parseFloat(val)),
  comment: z.string().min(1, "Comment is required"),
  image: z.any().optional(),
});

type FormSchema = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: any;
  onSubmit?: (data: any) => Promise<void> | void;
  submitting?: boolean;
}

export default function CreateTestimonial({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
  submitting = false,
}: Props) {
  const isEdit = Boolean(defaultValues && defaultValues.id);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      designation: defaultValues?.designation ?? "",
      rating: defaultValues?.rating?.toString() ?? "",
      comment: defaultValues?.comment ?? "",
      image: defaultValues?.image ?? null,
    },
  });

  React.useEffect(() => {
    if (open) {
      reset({
        name: defaultValues?.name ?? "",
        designation: defaultValues?.designation ?? "",
        rating: defaultValues?.rating?.toString() ?? "",
        comment: defaultValues?.comment ?? "",
        image: defaultValues?.image ?? null,
      });
    }
  }, [defaultValues, reset, open]);

  const submit = async (data: any) => {
    if (onSubmit) {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("designation", data.designation);
      formData.append("rating", data.rating.toString());
      formData.append("comment", data.comment);
      
      if (data.image instanceof File) {
        formData.append("image", data.image);
      } else if (typeof data.image === 'string') {
        formData.append("image", data.image);
      }

      await onSubmit(formData);
    }
  };

  const imageValue = watch("image");

  return (
    <Modal
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
      title={isEdit ? "Update Testimonial" : "Add Testimonial"}
      description={isEdit ? "Edit testimonial details" : "Add a new customer testimonial"}
      footer={
        <div className="flex gap-2 w-full justify-center">
          <CustomButton
            loading={isSubmitting || submitting}
            type="button"
            onClick={handleSubmit(submit)}
          >
            {isEdit ? "Update Testimonial" : "Create Testimonial"}
          </CustomButton>
        </div>
      }
    >
      <form onSubmit={handleSubmit(submit)}>
        <div className="space-y-4">
          <CustomFileUpload
            label="Image"
            onFileSelect={(file) => setValue("image", file)}
            value={imageValue}
            error={errors.image?.message as string}
            requiredMark
          />
          <CustomInput
            label="Name"
            placeholder="e.g. John Doe"
            {...register("name")}
            error={errors.name?.message as string}
            requiredMark
          />
          <CustomInput
            label="Designation"
            placeholder="e.g. CEO, Tech Corp"
            {...register("designation")}
            error={errors.designation?.message as string}
            requiredMark
          />
          <CustomInput
            label="Rating"
            type="number"
            step="0.1"
            placeholder="e.g. 4.5"
            {...register("rating")}
            error={errors.rating?.message as string}
            requiredMark
          />
          <CustomTextArea
            label="Comment"
            placeholder="What did they say?"
            {...register("comment")}
            error={errors.comment?.message as string}
            requiredMark
            className="min-h-[100px]"
          />
        </div>
      </form>
    </Modal>
  );
}
