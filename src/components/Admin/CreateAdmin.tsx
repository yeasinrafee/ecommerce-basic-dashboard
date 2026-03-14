"use client"

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Modal from "@/components/Common/Modal";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomButton from "@/components/Common/CustomButton";
import { useCreateAdmin, useUpdateAdmin } from "@/hooks/admin.api";
import CustomFileUpload, { type CustomFileUploadFile } from "@/components/FormFields/CustomFileUpload";
import OtpInput from "../FormFields/OtpInput"; 
import { useVerifyOtp } from "@/hooks/auth.api";

const createSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("A valid email is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords must match",
    path: ["confirmPassword"]
  });

const editSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("A valid email is required")
});

type CreateFormSchema = z.infer<typeof createSchema>;
type EditFormSchema = z.infer<typeof editSchema>;
type FormSchema = CreateFormSchema | EditFormSchema;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultValues?: Partial<FormSchema> & { id?: string; image?: string | null };
}

export default function CreateAdmin({ open, onOpenChange, defaultValues }: Props) {
  const isEdit = Boolean(defaultValues?.id);
  const activeSchema = isEdit ? editSchema : createSchema;
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormSchema>({
    resolver: zodResolver(activeSchema),
    defaultValues: isEdit
      ? { name: defaultValues?.name ?? "", email: defaultValues?.email ?? "" }
      : { name: "", email: "", password: "", confirmPassword: "" }
  });

  React.useEffect(() => {
    reset({ name: defaultValues?.name ?? "", email: defaultValues?.email ?? "", password: undefined });
  }, [defaultValues, reset]);

  const createMutation = useCreateAdmin();
  const updateMutation = useUpdateAdmin();
  const verifyOtpMutation = useVerifyOtp();
  const [uploadedFiles, setUploadedFiles] = React.useState<CustomFileUploadFile[]>([]);
  const [pendingVerificationUser, setPendingVerificationUser] = React.useState<{ id: string; email: string } | null>(null);
  const [otpCode, setOtpCode] = React.useState("");
  const [otpMessage, setOtpMessage] = React.useState<string | null>(null);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const OTP_LENGTH = 6;

  React.useEffect(() => {
    if (!open) {
      setPendingVerificationUser(null);
      setOtpCode("");
      setOtpMessage(null);
      setOtpError(null);
      setUploadedFiles([]);
    }
  }, [open]);

  React.useEffect(() => {
    if (isEdit) {
      setPendingVerificationUser(null);
      setOtpCode("");
      setOtpMessage(null);
      setOtpError(null);
    }
  }, [isEdit]);

  const existingImage = defaultValues?.image;
  const showExistingImage = isEdit && existingImage && uploadedFiles.length === 0;

  const handleOtpChange = (value: string) => {
    setOtpError(null);
    setOtpCode(value);
  };

  const onSubmit = async (data: FormSchema) => {
    if (isEdit && defaultValues?.id) {
      const editData = data as EditFormSchema;
      if (uploadedFiles && uploadedFiles.length > 0) {
        const formData = new FormData();
        formData.append("name", editData.name);
        formData.append("email", editData.email);
        formData.append("image", uploadedFiles[0].file);
        await updateMutation.mutateAsync({ id: defaultValues.id, payload: formData });
      } else {
        await updateMutation.mutateAsync({ id: defaultValues.id, payload: { name: editData.name, email: editData.email } });
      }
      onOpenChange(false);
      return;
    }

    if (pendingVerificationUser) {
      return;
    }

    const createData = data as CreateFormSchema;
    const formData = new FormData();
    formData.append("name", createData.name);
    formData.append("email", createData.email);
    if (createData.password) formData.append("password", createData.password);
    if (uploadedFiles && uploadedFiles.length > 0) {
      formData.append("image", uploadedFiles[0].file);
    }

    const result = await createMutation.mutateAsync(formData);
    const email = result.payload.email ?? "";
    setPendingVerificationUser({ id: result.payload.id, email });
    setOtpMessage(email ? `OTP sent to ${email}` : "OTP sent, check the inbox");
    setOtpError(null);
    setOtpCode("");
  };

  const handleVerifyOtp = async () => {
    if (!pendingVerificationUser || otpCode.length < OTP_LENGTH) {
      return;
    }

    try {
      await verifyOtpMutation.mutateAsync({ userId: pendingVerificationUser.id, code: otpCode });
      setPendingVerificationUser(null);
      setOtpCode("");
      setOtpMessage(null);
      setOtpError(null);
      setUploadedFiles([]);
      reset({ name: "", email: "", password: undefined });
      onOpenChange(false);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Invalid OTP code";
      setOtpError(message);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Update Admin" : "Create Admin"}
      description={isEdit ? "Edit admin details" : "Create a new admin"}
      footer={
        <div className="flex gap-2 w-full justify-center">
          {pendingVerificationUser ? (
            <CustomButton
              loading={verifyOtpMutation.isPending}
              disabled={otpCode.length < OTP_LENGTH}
              type="button"
              onClick={handleVerifyOtp}
            >
              Verify OTP
            </CustomButton>
          ) : (
            <CustomButton loading={isSubmitting} type="button" onClick={handleSubmit(onSubmit)}>
              {isEdit ? "Update Admin" : "Create Admin"}
            </CustomButton>
          )}
        </div>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <CustomInput label="Name" {...register("name" as any)} error={(errors as any).name?.message} requiredMark />
          <CustomInput label="Email" {...register("email" as any)} error={(errors as any).email?.message} requiredMark />
          {!isEdit && (
            <>
              <CustomInput label="Password" type="password" {...register("password" as any)} error={(errors as any).password?.message} requiredMark />
              <CustomInput label="Confirm Password" type="password" {...register("confirmPassword" as any)} error={(errors as any).confirmPassword?.message} requiredMark />
            </>
          )}
          {!isEdit && pendingVerificationUser && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-slate-900">OTP verification</span>
                <span className="text-xs text-slate-500">{otpMessage ?? `Code sent to ${pendingVerificationUser.email}`}</span>
              </div>
              <OtpInput
                length={OTP_LENGTH}
                value={otpCode}
                onChange={handleOtpChange}
                allowedPattern="^\\d+$"
                placeholderChar="●"
              />
              {otpError ? (
                <p className="text-xs text-rose-600">{otpError}</p>
              ) : (
                <p className="text-xs text-slate-500">The code expires in approximately 15 minutes.</p>
              )}
            </div>
          )}
          <div>
            <label className="block mb-2 text-sm font-medium">Profile Image</label>
            {showExistingImage ? (
              <div className="mb-2">
                <img src={existingImage} alt="Existing" className="h-32 w-32 object-cover rounded-md" />
                <p className="text-xs text-slate-500 mt-1">Existing image. Upload a new file below to replace.</p>
              </div>
            ) : null}
            <CustomFileUpload maxFiles={1} onFilesChange={setUploadedFiles} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
