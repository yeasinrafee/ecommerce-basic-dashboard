"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomFileUpload, { type CustomFileUploadFile } from "@/components/FormFields/CustomFileUpload";
import CustomButton from "@/components/Common/CustomButton";
import { useAdminProfile, useUpdateAdminProfile } from "@/hooks/admin.api";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
});

type FormSchema = z.infer<typeof schema>;

const ProfilePage = () => {
  const { data: profile, isLoading } = useAdminProfile();
  const updateMutation = useUpdateAdminProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<FormSchema>({
    resolver: zodResolver(schema),
  });

  const [uploadedFiles, setUploadedFiles] = React.useState<CustomFileUploadFile[]>([]);

  React.useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        email: profile.user?.email || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: FormSchema) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    if (uploadedFiles.length > 0) {
      formData.append("image", uploadedFiles[0].file);
    }

    try {
      await updateMutation.mutateAsync(formData);
      setUploadedFiles([]);
    } catch (error) {
    }
  };

  if (isLoading) return <div className="p-6 text-center">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 bg-white rounded-xl border">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-slate-500 text-sm">Update your account information</p>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium">Avatar</label>
          <div className="space-y-4">
            {uploadedFiles.length === 0 && profile?.image && (
              <div className="mb-2">
                <div className="h-32 w-32 rounded-md border bg-slate-50 overflow-hidden">
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Existing avatar. Upload a new file below to replace.
                </p>
              </div>
            )}

            <div className="flex-1">
              <CustomFileUpload
                label="Upload new avatar"
                maxFiles={1}
                onFilesChange={setUploadedFiles}
              />
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <CustomInput
            label="Full Name"
            {...register("name")}
            error={errors.name?.message}
            placeholder="Your name"
          />
          <CustomInput
            label="Email Address"
            {...register("email")}
            error={errors.email?.message}
            placeholder="your@email.com"
          />

          <div className="pt-4 flex justify-center">
            <CustomButton
              type="submit"
              loading={updateMutation.isPending}
              disabled={!isDirty && uploadedFiles.length === 0}
            >
              Save Changes
            </CustomButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;