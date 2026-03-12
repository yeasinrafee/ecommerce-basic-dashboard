import React from "react";
import { Control } from "react-hook-form";

import CustomButton from "../../Common/CustomButton";
import CustomInput from "../../FormFields/CustomInput";
import CustomRichTextEditor from "../../Common/CustomRichTextEditor";
import CustomSelect from "../../FormFields/CustomSelect";
import CustomTextArea from "../../FormFields/CustomTextArea";

export interface BrandOption {
  label: string;
  value: string;
}

interface MainInformationProps {
  productName: string;
  setProductName: (value: string) => void;
  shortDescription: string;
  setShortDescription: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  brandOptions: BrandOption[];
  control: Control<any>;
  onCreateBrand?: (name: string) => void;
}

const MainInformation: React.FC<MainInformationProps> = ({
  productName,
  setProductName,
  shortDescription,
  setShortDescription,
  description,
  setDescription,
  brandOptions,
  control,
  onCreateBrand,
}) => {
  const [showCreate, setShowCreate] = React.useState(false);
  const [newBrandName, setNewBrandName] = React.useState("");
  return (
    <div className="rounded-2xl border border-slate-200 bg-background px-6 py-6 shadow-sm">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900">Create Product</h1>
        <p className="text-sm text-slate-500">
          Capture the primary details your team needs to launch the item.
        </p>
      </div>

      <div className="mt-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <CustomInput
            label="Product Name"
            value={productName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setProductName(event.target.value)}
            requiredMark
          />
          <div className="flex items-start gap-2">
            <div className="flex-1">
              <CustomSelect
                name="brand"
                control={control}
                label="Product Brand"
                requiredMark
                options={brandOptions}
              />
            </div>
            <div className="mt-6">
              <CustomButton type="button" variant="ghost" size="sm" onClick={() => setShowCreate((s) => !s)}>
                Add
              </CustomButton>
            </div>
          </div>

          {showCreate && (
            <div className="mt-2 flex gap-2">
              <CustomInput
                label=""
                placeholder="New brand name"
                value={newBrandName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewBrandName(e.target.value)}
              />
              <CustomButton
                type="button"
                onClick={() => {
                  if (!newBrandName.trim()) return;
                  onCreateBrand?.(newBrandName.trim());
                  setNewBrandName("");
                  setShowCreate(false);
                }}
              >
                Create
              </CustomButton>
              <CustomButton type="button" variant="ghost" onClick={() => { setShowCreate(false); setNewBrandName(""); }}>
                Cancel
              </CustomButton>
            </div>
          )}
        </div>

        <CustomTextArea
          label="Short Description"
          value={shortDescription}
          onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => setShortDescription(event.target.value)}
          className="min-h-35"
        />

        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-700">
            Description
            <span className="ml-1 text-destructive">*</span>
          </div>
          <CustomRichTextEditor value={description} onChange={setDescription} />
        </div>
      </div>
    </div>
  );
};

export default MainInformation;