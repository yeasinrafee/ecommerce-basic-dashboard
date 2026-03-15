"use client";

import React, { useState, useEffect, useMemo } from "react";
import CustomInput from "@/components/FormFields/CustomInput";
import CustomButton from "@/components/Common/CustomButton";
import { Plus, Trash, X } from "lucide-react";
import {
  useAllSocialMedia,
  useCreateSocialMedia,
  useUpdateSocialMedia,
  useDeleteSocialMedia,
  SocialMedia,
} from "@/hooks/web.api";

interface SocialMediaRow {
  id?: string;
  name: string;
  link: string;
}

const SocialMediaLinkForm = () => {
  const { data: existingLinks, isLoading } = useAllSocialMedia();
  const createMutation = useCreateSocialMedia();
  const updateMutation = useUpdateSocialMedia();
  const deleteMutation = useDeleteSocialMedia();

  const [rows, setRows] = useState<SocialMediaRow[]>([{ name: "", link: "" }]);

  useEffect(() => {
    if (existingLinks && existingLinks.length > 0) {
      setRows(
        existingLinks.map((link) => ({
          id: link.id,
          name: link.name,
          link: link.link,
        })),
      );
    }
  }, [existingLinks]);

  const addRow = () => {
    setRows([...rows, { name: "", link: "" }]);
  };

  const removeRow = async (index: number) => {
    const rowToRemove = rows[index];
    if (rowToRemove.id) {
      await deleteMutation.mutateAsync(rowToRemove.id);
    }
    const newRows = rows.filter((_, i) => i !== index);
    if (newRows.length === 0) {
      setRows([{ name: "", link: "" }]);
    } else {
      setRows(newRows);
    }
  };

  const handleInputChange = (
    index: number,
    field: keyof SocialMediaRow,
    value: string,
  ) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], [field]: value };
    setRows(newRows);
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const allMandatoryFieldsFilled = rows.every(
    (row) => row.name.trim() !== "" && row.link.trim() !== "",
  );

  const hasChanges = useMemo(() => {
    if (!existingLinks)
      return rows.some((row) => row.name !== "" || row.link !== "");

    if (rows.length !== existingLinks.length) return true;

    return rows.some((row, index) => {
      const existing = existingLinks[index];
      return row.name !== existing.name || row.link !== existing.link;
    });
  }, [rows, existingLinks]);

  const handleSave = async () => {
    const toCreate = rows.filter((row) => !row.id);
    const toUpdate = rows.filter((row) => row.id);

    try {
      if (toCreate.length > 0) {
        await createMutation.mutateAsync(toCreate);
      }
      if (toUpdate.length > 0) {
        await updateMutation.mutateAsync({ payload: toUpdate });
      }
    } catch (error) {

    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">Loading social media links...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 bg-background rounded-xl shadow-sm border border-slate-200">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-slate-900">
            Social Media Links
          </h2>
          <p className="text-sm text-slate-500">
            Manage your company's social media presence.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {rows.map((row, index) => (
          <div
            key={index}
            className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end bg-slate-50/50 p-4 rounded-lg border border-slate-100"
          >
            <div className="md:col-span-5">
              <CustomInput
                label={
                  <span>
                    Platform Name <span className="text-destructive">*</span>
                  </span>
                }
                placeholder="e.g. Facebook"
                value={row.name}
                onValueChange={(v) =>
                  handleInputChange(index, "name", v as string)
                }
              />
            </div>
            <div className="md:col-span-6">
              <CustomInput
                label={
                  <span>
                    Link <span className="text-destructive">*</span>
                  </span>
                }
                placeholder="e.g. https://facebook.com/company"
                value={row.link}
                onValueChange={(v) =>
                  handleInputChange(index, "link", v as string)
                }
              />
            </div>
            <div className="md:col-span-1 flex justify-center pb-2">
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="p-2 text-slate-400 hover:text-destructive transition-colors rounded-lg hover:bg-destructive/5"
                title="Remove link"
              >
                <Trash size={20} />
              </button>
            </div>
          </div>
        ))}

        <div className="flex w-full justify-end">
          <button
            type="button"
            onClick={addRow}
            className="flex bg-brand-primary text-white items-center cursor-pointer gap-2 text-sm font-medium px-4 py-2 rounded-md"
          >
            <Plus size={16} className="text-white" />
            Add Platform
          </button>
        </div>
      </div>

      <div className="flex justify-center pt-6 border-t border-slate-100">
        <CustomButton
          onClick={handleSave}
          loading={isSaving}
          disabled={isSaving || !allMandatoryFieldsFilled || !hasChanges}
          className="w-full md:max-w-[300px] px-8"
        >
          {existingLinks && existingLinks.length > 0
            ? "Update Links"
            : "Save Links"}
        </CustomButton>
      </div>
    </div>
  );
};

export default SocialMediaLinkForm;
