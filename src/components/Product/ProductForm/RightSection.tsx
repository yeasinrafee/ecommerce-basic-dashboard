import React from "react";
import { Plus, X } from "lucide-react";

import CustomButton from "../../Common/CustomButton";
import CustomCheckbox from "../../FormFields/CustomCheckbox";

export type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

export type RightSectionData = {
  mainImage: UploadedImage | null;
  galleryImages: UploadedImage[];
  categories: string[];
  tags: string[];
};

interface RightSectionProps {
  categoriesList: string[];
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

  const mainImageInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);
  const latestMainImageRef = React.useRef<UploadedImage | null>(null);
  const latestGalleryImagesRef = React.useRef<UploadedImage[]>([]);

  React.useEffect(() => {
    latestMainImageRef.current = mainImage;
  }, [mainImage]);

  React.useEffect(() => {
    latestGalleryImagesRef.current = galleryImages;
  }, [galleryImages]);

  React.useEffect(() => {
    return () => {
      if (latestMainImageRef.current) {
        URL.revokeObjectURL(latestMainImageRef.current.url);
      }
      latestGalleryImagesRef.current.forEach((item) =>
        URL.revokeObjectURL(item.url),
      );
    };
  }, []);

  const createImageId = (fileName: string) => {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
    return `${fileName}-${Date.now()}`;
  };

  const handleMainImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setMainImage((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
      }
      return {
        id: createImageId(file.name),
        name: file.name,
        url: URL.createObjectURL(file),
      };
    });
    event.target.value = "";
  };

  const handleGalleryImagesChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files?.length) return;

    setGalleryImages((prev) => {
      const available = Math.max(0, 10 - prev.length);
      const toAdd = Array.from(files).slice(0, available);
      const additions = toAdd.map((file) => ({
        id: createImageId(file.name),
        name: file.name,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...additions];
    });
    event.target.value = "";
  };

  const handleRemoveMainImage = () => {
    setMainImage((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev.url);
      }
      return null;
    });
  };

  const handleRemoveGalleryImage = (id: string) => {
    setGalleryImages((prev) => {
      const removed = prev.find((image) => image.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return prev.filter((image) => image.id !== id);
    });
  };

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((item) => item !== category)
        : [...prev, category],
    );
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    );
  };

  React.useEffect(() => {
    if (onChange) {
      onChange({ mainImage, galleryImages, categories, tags });
    }
  }, [mainImage, galleryImages, categories, tags, onChange]);

  return (
    <div className="flex w-full flex-col gap-6 lg:w-[320px]">
      {/* Images block at top */}
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Images</h2>
            <p className="text-sm text-slate-500">
              Upload one main image and up to 10 gallery shots.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Main Image
                </p>
                <p className="text-xs text-slate-500">
                  This hero image represents the product across listings.
                </p>
              </div>
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => mainImageInputRef.current?.click()}
              >
                Upload Main Image
              </CustomButton>
            </div>
            <div className="mt-4">
              {mainImage ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center">
                    <div className="h-28 w-28 overflow-hidden rounded-2xl border border-slate-200">
                      <img
                        src={mainImage.url}
                        alt={mainImage.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col gap-2 text-sm">
                      <span className="font-medium text-slate-700">
                        {mainImage.name}
                      </span>
                      <button
                        type="button"
                        onClick={handleRemoveMainImage}
                        className="inline-flex items-center gap-1 text-xs text-destructive"
                      >
                        <X size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 px-3 py-8 text-center text-sm text-slate-500">
                  Click upload to select a main image.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Gallery Images ({galleryImages.length}/10)
                </p>
                <p className="text-xs text-slate-500">
                  Supplement the main shot with contextual photos.
                </p>
              </div>
              <CustomButton
                type="button"
                variant="outline"
                onClick={() => galleryInputRef.current?.click()}
              >
                Add Gallery Photos
              </CustomButton>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              JPG or PNG. Max 10 images.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white"
                >
                  <img
                    src={image.url}
                    alt={image.name}
                    className="h-32 w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveGalleryImage(image.id)}
                    className="absolute top-2 right-2 inline-flex items-center justify-center rounded-full bg-white/80 p-1 text-slate-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* hidden file inputs */}
        <input
          type="file"
          accept="image/*"
          ref={mainImageInputRef}
          className="hidden"
          onChange={handleMainImageChange}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          ref={galleryInputRef}
          className="hidden"
          onChange={handleGalleryImagesChange}
        />
      </div>

      {/* categories and tags below images */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
        <div className="mt-4 space-y-3 max-h-65 overflow-y-auto pr-2">
          {categoriesList.map((category) => (
            <CustomCheckbox
              key={category}
              label={category}
              checked={categories.includes(category)}
              onCheckedChange={() => toggleCategory(category)}
            />
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Product Tags</h3>
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