"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { Plus, X } from "lucide-react";

import CustomButton from "../Common/CustomButton";
import CustomRichTextEditor from "../Common/CustomRichTextEditor";
import CustomTab, { CustomTabItem } from "../Common/CustomTab";
import CustomCheckbox from "../FormFields/CustomCheckbox";
import CustomDatePicker from "../FormFields/CustomDatePicker";
import CustomInput from "../FormFields/CustomInput";
import CustomSelect from "../FormFields/CustomSelect";
import CustomTextArea from "../FormFields/CustomTextArea";

const categoriesList = [
  "Electronics",
  "Clothing",
  "Home",
  "Beauty",
  "Sports",
  "Books",
  "Accessories",
  "Outdoor",
  "Wellness",
];

const tagList = [
  "New Arrival",
  "Best Seller",
  "Limited Edition",
  "Eco Friendly",
  "Gift Item",
  "Personalized",
  "Trending",
  "Studio Pick",
  "Preorder",
  "Clearance",
];

const brandOptions = [
  { label: "Arwa Signature", value: "arwa-signature" },
  { label: "Aurora Studio", value: "aurora-studio" },
  { label: "Lumen Works", value: "lumen-works" },
  { label: "Cedar & Silk", value: "cedar-silk" },
];

const discountOptions = [
  { label: "None", value: "none" },
  { label: "Flat Discount", value: "flat" },
  { label: "Percentage", value: "percent" },
];

const stockStatusOptions = [
  { label: "In Stock", value: "in-stock" },
  { label: "Backordered", value: "backorder" },
  { label: "Out of Stock", value: "out-of-stock" },
];

const productStatusOptions = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
  { label: "Draft", value: "draft" },
];

const shippingClassOptions = [
  { label: "Standard", value: "standard" },
  { label: "Express", value: "express" },
  { label: "International", value: "international" },
];

type AttributeRecord = {
  name: string;
  pairs: { value: string; price: string }[];
};

type FormValues = {
  discountType: string;
  brand: string;
  stockStatus: string;
  productStatus: string;
  shippingClass: string;
};

type UploadedImage = {
  id: string;
  name: string;
  url: string;
};

export default function CreateProductForm() {
  const { control, watch } = useForm<FormValues>({
    defaultValues: {
      discountType: "none",
      brand: brandOptions[0].value,
      stockStatus: stockStatusOptions[0].value,
      productStatus: productStatusOptions[0].value,
      shippingClass: shippingClassOptions[0].value,
    },
  });

  const selectedDiscountType = watch("discountType");

  const [productName, setProductName] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState<number | null>(null);
  const [costPrice, setCostPrice] = React.useState<number | null>(null);
  const [discountValue, setDiscountValue] = React.useState<number | null>(null);
  const [discountStart, setDiscountStart] = React.useState<Date | null>(null);
  const [discountEnd, setDiscountEnd] = React.useState<Date | null>(null);
  const [stockQuantity, setStockQuantity] = React.useState<number | null>(null);
  const [sku, setSku] = React.useState("");

  const [attributeName, setAttributeName] = React.useState("");
  const [attributeValue, setAttributeValue] = React.useState("");
  const [attributePrice, setAttributePrice] = React.useState("");
  const [attributes, setAttributes] = React.useState<AttributeRecord[]>([]);

  const [infoName, setInfoName] = React.useState("");
  const [infoValue, setInfoValue] = React.useState("");
  const [additionalInfo, setAdditionalInfo] = React.useState<
    { name: string; value: string }[]
  >([]);

  const [categories, setCategories] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);

  const [metaTitle, setMetaTitle] = React.useState("");
  const [metaDescription, setMetaDescription] = React.useState("");
  const [seoKeywords, setSeoKeywords] = React.useState<string[]>([]);
  const [keywordInput, setKeywordInput] = React.useState("");

  const [mainImage, setMainImage] = React.useState<UploadedImage | null>(null);
  const [galleryImages, setGalleryImages] = React.useState<UploadedImage[]>([]);

  const [shippingWeight, setShippingWeight] = React.useState<number | null>(null);
  const [shippingLength, setShippingLength] = React.useState<number | null>(null);
  const [shippingWidth, setShippingWidth] = React.useState<number | null>(null);
  const [shippingHeight, setShippingHeight] = React.useState<number | null>(null);

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

  const addKeyword = (value: string) => {
    const inputs = value
      .split(",")
      .map((keyword) => keyword.trim())
      .filter(Boolean);
    if (!inputs.length) return;
    setSeoKeywords((prev) => {
      const next = [...prev];
      inputs.forEach((keyword) => {
        if (!next.includes(keyword)) {
          next.push(keyword);
        }
      });
      return next;
    });
  };

  const handleKeywordKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addKeyword(keywordInput);
      setKeywordInput("");
    }
  };

  const handleKeywordBlur = () => {
    if (keywordInput) {
      addKeyword(keywordInput);
      setKeywordInput("");
    }
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

  const addAttribute = () => {
    const name = attributeName.trim();
    const value = attributeValue.trim();
    if (!name || !value) return;

    const price = attributePrice.trim();
    setAttributes((prev) => {
      const exists = prev.find((attr) => attr.name === name);
      if (exists) {
        return prev.map((attr) =>
          attr.name === name
            ? { ...attr, pairs: [...attr.pairs, { value, price }] }
            : attr,
        );
      }
      return [...prev, { name, pairs: [{ value, price }] }];
    });

    setAttributeValue("");
    setAttributePrice("");
  };

  const removeAttributePair = (attrName: string, pairIndex: number) => {
    setAttributes((prev) =>
      prev
        .map((attr) => {
          if (attr.name !== attrName) return attr;
          const remaining = attr.pairs.filter((_, index) => index !== pairIndex);
          return { ...attr, pairs: remaining };
        })
        .filter((attr) => attr.pairs.length > 0),
    );
  };

  const addAdditionalInfo = () => {
    if (!infoName.trim() || !infoValue.trim()) return;
    setAdditionalInfo((prev) => [
      ...prev,
      { name: infoName.trim(), value: infoValue.trim() },
    ]);
    setInfoName("");
    setInfoValue("");
  };

  const removeAdditionalInfo = (index: number) => {
    setAdditionalInfo((prev) => prev.filter((_, i) => i !== index));
  };

  const tabItems: CustomTabItem[] = [
    {
      id: "general",
      label: "General",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomInput
              label="Base Price"
              type="number"
              value={basePrice === null ? "" : basePrice}
              onValueChange={(value) => setBasePrice(value as number | null)}
              placeholder="0.00"
            />
            <CustomInput
              label="Cost Price (optional)"
              type="number"
              value={costPrice === null ? "" : costPrice}
              onValueChange={(value) => setCostPrice(value as number | null)}
              placeholder="0.00"
              min={0}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CustomSelect
              name="discountType"
              control={control}
              label="Discount Type"
              options={discountOptions}
              description="Choose how the discount should behave"
            />
            <CustomInput
              label="Discount Value"
              type="number"
              value={discountValue === null ? "" : discountValue}
              onValueChange={(value) => setDiscountValue(value as number | null)}
              placeholder="0"
              min={0}
              disabled={selectedDiscountType === "none"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CustomDatePicker
              label="Discount Start Date"
              value={discountStart}
              onChange={setDiscountStart}
              disabled={selectedDiscountType === "none"}
            />
            <CustomDatePicker
              label="Discount End Date"
              value={discountEnd}
              onChange={setDiscountEnd}
              disabled={selectedDiscountType === "none"}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CustomInput
              label="Stock Quantity"
              type="number"
              value={stockQuantity === null ? "" : stockQuantity}
              onValueChange={(value) => setStockQuantity(value as number | null)}
              placeholder="0"
              min={0}
            />
            <CustomInput
              label="SKU"
              value={sku}
              onChange={(event) => setSku(event.target.value)}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <CustomSelect
              name="stockStatus"
              control={control}
              label="Stock Status"
              options={stockStatusOptions}
            />
            <CustomSelect
              name="productStatus"
              control={control}
              label="Product Status"
              options={productStatusOptions}
            />
          </div>
        </div>
      ),
    },
    {
      id: "shipping",
      label: "Shipping",
      content: (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <CustomSelect
              name="shippingClass"
              control={control}
              label="Shipping Class"
              options={shippingClassOptions}
            />
            <CustomInput
              label="Weight (kg)"
              type="number"
              value={shippingWeight === null ? "" : shippingWeight}
              onValueChange={(value) => setShippingWeight(value as number | null)}
              placeholder="0.0"
              min={0}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <CustomInput
              label="Length (cm)"
              type="number"
              value={shippingLength === null ? "" : shippingLength}
              onValueChange={(value) => setShippingLength(value as number | null)}
              placeholder="0"
              min={0}
            />
            <CustomInput
              label="Width (cm)"
              type="number"
              value={shippingWidth === null ? "" : shippingWidth}
              onValueChange={(value) => setShippingWidth(value as number | null)}
              placeholder="0"
              min={0}
            />
            <CustomInput
              label="Height (cm)"
              type="number"
              value={shippingHeight === null ? "" : shippingHeight}
              onValueChange={(value) => setShippingHeight(value as number | null)}
              placeholder="0"
              min={0}
            />
          </div>

          <p className="text-sm text-slate-500">
            Dimensions help calculate shipping costs and packaging guidelines.
          </p>
        </div>
      ),
    },
    {
      id: "attributes",
      label: "Attributes",
      content: (
        <div className="space-y-6">
          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-700">
              Add Attribute
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <CustomInput
                label="Name"
                placeholder="e.g. Color"
                value={attributeName}
                onChange={(event) => setAttributeName(event.target.value)}
              />
              <CustomInput
                label="Value"
                placeholder="e.g. Red"
                value={attributeValue}
                onChange={(event) => setAttributeValue(event.target.value)}
              />
              <CustomInput
                label="Price (optional)"
                placeholder="Extra price"
                type="number"
                value={attributePrice}
                onChange={(event) => setAttributePrice(event.target.value)}
              />
            </div>
            <CustomButton
              type="button"
              className="w-full"
              leftIcon={<Plus size={16} />}
              onClick={addAttribute}
            >
              Add Attribute
            </CustomButton>
          </div>

          <div className="space-y-3">
            {attributes.map((attr) => (
              <div
                key={attr.name}
                className="rounded-2xl border border-slate-200 p-4 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-slate-700">
                    {attr.name}
                  </h3>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {attr.pairs.map((pair, index) => (
                    <div
                      key={`${attr.name}-${index}`}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm"
                    >
                      <span>
                        {pair.value}
                        {pair.price ? ` · ${pair.price}` : ""}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAttributePair(attr.name, index)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
            <div className="text-sm font-semibold text-slate-700">
              Additional Information
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <CustomInput
                label="Field Name"
                value={infoName}
                onChange={(event) => setInfoName(event.target.value)}
              />
              <CustomInput
                label="Field Value"
                value={infoValue}
                onChange={(event) => setInfoValue(event.target.value)}
              />
            </div>
            <CustomButton
              type="button"
              className="w-full"
              leftIcon={<Plus size={16} />}
              onClick={addAdditionalInfo}
            >
              Add Info
            </CustomButton>
            <div className="space-y-2">
              {additionalInfo.map((info, index) => (
                <div
                  key={`${info.name}-${index}`}
                  className="flex items-center justify-between rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <span>
                    <strong>{info.name}:</strong> {info.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAdditionalInfo(index)}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "seo",
      label: "SEO",
      content: (
        <div className="space-y-5">
          <CustomInput
            label="SEO Meta Title"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
          />
          <CustomTextArea
            label="SEO Meta Description"
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            className="min-h-[140px]"
          />
          <div className="space-y-2">
            <CustomInput
              label="Meta Keywords"
              placeholder="Add keywords, press Enter or comma"
              value={keywordInput}
              onChange={(event) => setKeywordInput(event.target.value)}
              onKeyDown={handleKeywordKeyDown}
              onBlur={handleKeywordBlur}
            />
            <div className="flex flex-wrap gap-2">
              {seoKeywords.map((keyword) => (
                <span
                  key={keyword}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm"
                >
                  {keyword}
                  <button
                    type="button"
                    onClick={() =>
                      setSeoKeywords((prev) => prev.filter((item) => item !== keyword))
                    }
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl font-semibold text-slate-900">
                Create Product
              </h1>
              <p className="text-sm text-slate-500">
                Capture the primary details your team needs to launch the item.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <CustomInput
                  label="Product Name"
                  value={productName}
                  onChange={(event) => setProductName(event.target.value)}
                />
                <CustomSelect
                  name="brand"
                  control={control}
                  label="Product Brand"
                  options={brandOptions}
                />
              </div>

              <CustomTextArea
                label="Short Description"
                value={shortDescription}
                onChange={(event) => setShortDescription(event.target.value)}
                className="min-h-[140px]"
              />

              <div className="space-y-3">
                <div className="text-sm font-semibold text-slate-700">
                  Description
                </div>
                <CustomRichTextEditor
                  value={description}
                  onChange={setDescription}
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Images
                </h2>
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

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <CustomTab
              tabs={tabItems}
              className="space-y-4"
              tabListClassName="justify-start"
            />
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm">
            <CustomButton className="w-full" onClick={() => console.log("Submit", { productName })}>
              Save Product
            </CustomButton>
          </div>
        </div>

        <div className="flex w-full flex-col gap-6 lg:w-[320px]">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">Categories</h3>
            <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-2">
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
            <div className="mt-4 space-y-3 max-h-[260px] overflow-y-auto pr-2">
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
      </div>
    </div>
  );
}