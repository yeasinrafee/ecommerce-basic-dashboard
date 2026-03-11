"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import CustomButton from "../Common/CustomButton";
import CustomTab, { CustomTabItem } from "../Common/CustomTab";
import MainInformation from "./ProductForm/MainInformation";
import GeneralInformation from "./ProductForm/GeneralInformation";
import Attributes, { AttributesData, AdditionalInfo as AdditionalInfoType } from "./ProductForm/Attributes";
import AdditionalInfo from "./ProductForm/AdditionalInfo";
import Seo, { SeoData } from "./ProductForm/Seo";
import RightSection, { RightSectionData } from "./ProductForm/RightSection";
import { useAllCategories } from "@/hooks/product-category.api";
import { useAllTags } from "@/hooks/product-tag.api";

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
type FormValues = {
  discountType: string;
  brand: string;
  stockStatus: string;
  productStatus: string;
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
    },
  });

  const selectedDiscountType = watch("discountType");

  // fetch categories and tags from backend
  const { data: productCategories } = useAllCategories();
  const { data: productTags } = useAllTags();

  const categoriesList = React.useMemo(() => productCategories ?? [], [productCategories]);
  const tagList = React.useMemo(() => productTags?.map((t) => t.name) ?? [], [productTags]);

  const [productName, setProductName] = React.useState("");
  const [shortDescription, setShortDescription] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [basePrice, setBasePrice] = React.useState<number | null>(null);

  const [discountValue, setDiscountValue] = React.useState<number | null>(null);
  const [discountStart, setDiscountStart] = React.useState<Date | null>(null);
  const [discountEnd, setDiscountEnd] = React.useState<Date | null>(null);
  const [stockQuantity, setStockQuantity] = React.useState<number | null>(null);
  const [sku, setSku] = React.useState("");

  const [rightData, setRightData] = React.useState<RightSectionData>({
    mainImage: null,
    galleryImages: [],
    categories: [],
    tags: [],
  });
  const [attributesData, setAttributesData] = React.useState<AttributesData>({
    attributes: [],
    additionalInfo: [],
  });
  const [seoData, setSeoData] = React.useState<SeoData>({
    metaTitle: "",
    metaDescription: "",
    seoKeywords: [],
  });

  const tabItems: CustomTabItem[] = [
    {
      id: "general",
      label: "General",
      content: (
        <GeneralInformation
          basePrice={basePrice}
          setBasePrice={setBasePrice}
          selectedDiscountType={selectedDiscountType}
          discountValue={discountValue}
          setDiscountValue={setDiscountValue}
          discountStart={discountStart}
          setDiscountStart={setDiscountStart}
          discountEnd={discountEnd}
          setDiscountEnd={setDiscountEnd}
          stockQuantity={stockQuantity}
          setStockQuantity={setStockQuantity}
          sku={sku}
          setSku={setSku}
          control={control}
          discountOptions={discountOptions}
          stockStatusOptions={stockStatusOptions}
          productStatusOptions={productStatusOptions}
        />
      ),
    },
    {
      id: "attributes",
      label: "Attributes",
      content: (
        <Attributes
          galleryImages={rightData.galleryImages}
          onChange={React.useCallback(
            (data: AttributesData) =>
              setAttributesData((prev) => ({
                ...prev,
                attributes: data.attributes,
              })),
            [],
          )}
        />
      ),
    },
    {
      id: "additional",
      label: "Additional Info",
      content: (
        <AdditionalInfo
          onChange={React.useCallback(
            (info: AdditionalInfoType[]) =>
              setAttributesData((prev) => ({ ...prev, additionalInfo: info })),
            [],
          )}
        />
      ),
    },
    {
      id: "seo",
      label: "SEO",
      content: <Seo onChange={setSeoData} />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-full px-4 grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="left-section space-y-6 col-span-7">
          <MainInformation
            productName={productName}
            setProductName={setProductName}
            shortDescription={shortDescription}
            setShortDescription={setShortDescription}
            description={description}
            setDescription={setDescription}
            brandOptions={brandOptions}
            control={control}
          />

          <div className="rounded-2xl border border-slate-200 bg-background px-6 py-6 shadow-sm">
            <CustomTab
              tabs={tabItems}
              className="space-y-4"
              tabListClassName="justify-start"
            />
          </div>
        </div>

        {/* right column: moved into dedicated component */}
        <div className="col-span-5">
          <RightSection
            categoriesList={categoriesList}
            tagList={tagList}
            onChange={setRightData}
          />
        </div>
      </div>
      <div className="w-full flex justify-center py-10">
        <CustomButton
          className="px-4"
          onClick={() => console.log("Submit", { productName })}
        >
          Save Product
        </CustomButton>
      </div>
    </div>
  );
}
