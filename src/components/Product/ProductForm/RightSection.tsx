"use client";

import * as React from "react";

import CustomCheckbox from "../../FormFields/CustomCheckbox";
import CustomFileUpload, {
  CustomFileUploadFile,
} from "../../FormFields/CustomFileUpload";
import type { Category } from "@/hooks/product-category.api";

export type UploadedImage = CustomFileUploadFile;

export type RightSectionData = {
  mainImage: UploadedImage | null;
  galleryImages: UploadedImage[];
  categories: string[];
  tags: string[];
};

interface RightSectionProps {
  categoriesList: Category[];
  tagList: string[];
  onChange?: (data: RightSectionData) => void;
}

const RightSection: React.FC<RightSectionProps> = ({
  categoriesList,
  tagList,
  onChange,
}) => {
  const [mainImage, setMainImage] = React.useState<UploadedImage | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<UploadedImage[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      const category = categoriesList.find((c) => c.id === categoryId);
      if (!category) {
        return isSelected ? prev.filter((item) => item !== categoryId) : [...prev, categoryId];
      }

      if (isSelected) {
        // Only remove the clicked category — do not affect parent/children
        return prev.filter((item) => item !== categoryId);
      }

      if (category.parentId) {
        return prev.includes(category.parentId) ? [...prev, categoryId] : [...prev, category.parentId, categoryId];
      }

      return [...prev, categoryId];
    });
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  const mapUploads = (items: CustomFileUploadFile[]) =>
    items.map((file) => ({ ...file }));

  const handleMainFilesChange = React.useCallback(
    (uploaded: CustomFileUploadFile[]) => {
      const [first] = uploaded;
      setMainImage(first ? { ...first } : null);
    },
    [],
  );

  const handleGalleryFilesChange = React.useCallback(
    (uploaded: CustomFileUploadFile[]) => {
      setGalleryImages(mapUploads(uploaded));
    },
    [],
  );

  React.useEffect(() => {
    if (onChange) {
      onChange({ mainImage, galleryImages, categories, tags });
    }
  }, [mainImage, galleryImages, categories, tags, onChange]);

  return (
    <div className="flex w-full flex-col gap-6">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-background px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Images</h2>
            <p className="text-sm text-slate-500">
              Upload one hero image plus up to 10 gallery shots.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">
              Product image
              <span className="ml-1 text-destructive">*</span>
            </label>
            <div className="mt-2">
              <CustomFileUpload
                label=""
                description="This hero image represents the product across listings."
                helperText="Formats: PNG, JPG, JPEG, WEBP. Maximum 5MB."
                maxFiles={1}
                onFilesChange={handleMainFilesChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Gallery images</label>
            <div className="mt-2">
              <CustomFileUpload
                label=""
                description="Supplement the hero shot with contextual photos."
                helperText="Up to 10 images. JPG, PNG, or WEBP."
                maxFiles={10}
                onFilesChange={handleGalleryFilesChange}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-background px-4 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Categories
          <span className="ml-1 text-destructive">*</span>
        </h3>
        <div className="mt-4 space-y-3 max-h-65 overflow-y-auto pr-2">
          {categoriesList
            .filter((c) => !c.parentId)
            .map((parent) => (
              <div key={parent.id}>
                <CustomCheckbox
                  key={parent.id}
                  label={parent.name}
                  checked={categories.includes(parent.id)}
                  onCheckedChange={() => toggleCategory(parent.id)}
                />
                <div className="ml-4 mt-2 space-y-2">
                  {categoriesList
                    .filter((c) => c.parentId === parent.id)
                    .map((child) => (
                      <CustomCheckbox
                        key={child.id}
                        label={child.name}
                        checked={categories.includes(child.id)}
                        onCheckedChange={() => toggleCategory(child.id)}
                      />
                    ))}
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-background px-4 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          Product Tags
          <span className="ml-1 text-destructive">*</span>
        </h3>
        <div className="mt-4 space-y-3 max-h-65 overflow-y-auto pr-2">
          {tagList.map((tag) => (
            <CustomCheckbox
              key={tag}
              label={tag}
              checked={tags.includes(tag)}
              onCheckedChange={() => toggleTag(tag)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightSection;