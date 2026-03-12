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
import { useAllBrands, useCreateBrand, Brand } from "@/hooks/brand.api";

const discountOptions = [
  { label: "None", value: "NONE" },
  { label: "Flat Discount", value: "FLAT_DISCOUNT" },
  { label: "Percentage Discount", value: "PERCENTAGE_DISCOUNT" },
];

const stockStatusOptions = [
  { label: "In Stock", value: "IN_STOCK" },
  { label: "Low Stock", value: "LOW_STOCK" },
  { label: "Out of Stock", value: "OUT_OF_STOCK" },
];

const productStatusOptions = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
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
  const { control, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      discountType: discountOptions[0].value,
      brand: "",
      stockStatus: stockStatusOptions[0].value,
      productStatus: productStatusOptions[0].value,
    },
  });

  const selectedDiscountType = watch("discountType");

  // fetch categories and tags from backend
  const { data: productCategories } = useAllCategories();
  const { data: productTags } = useAllTags();
  const { data: allBrands } = useAllBrands();
  const createBrandMutation = useCreateBrand();

  const brandOptions = React.useMemo(() => {
    return (allBrands ?? []).map((b: Brand) => ({ label: b.name, value: b.id }));
  }, [allBrands]);

  // set default brand when brands load
  const currentBrand = watch("brand");
  React.useEffect(() => {
    if (!currentBrand && brandOptions.length > 0) {
      setValue("brand", brandOptions[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandOptions]);

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
  const [weight, setWeight] = React.useState<number | null>(null);
  const [lengthCm, setLengthCm] = React.useState<number | null>(null);
  const [widthCm, setWidthCm] = React.useState<number | null>(null);
  const [heightCm, setHeightCm] = React.useState<number | null>(null);

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

  const brandValue = watch("brand");
  const stockStatusValue = watch("stockStatus");
  const productStatusValue = watch("productStatus");

  const isFormValid = React.useMemo(() => {
    const hasProductName = productName.trim() !== "";
    const hasDescription = description.trim() !== "";
    const hasBasePrice = basePrice !== null && !Number.isNaN(Number(basePrice));
    const hasStockQuantity = stockQuantity !== null && !Number.isNaN(Number(stockQuantity));
    const hasWeight = weight !== null && !Number.isNaN(Number(weight));
    const hasLength = lengthCm !== null && !Number.isNaN(Number(lengthCm));
    const hasWidth = widthCm !== null && !Number.isNaN(Number(widthCm));
    const hasHeight = heightCm !== null && !Number.isNaN(Number(heightCm));
    const hasDimensions = hasLength && hasWidth && hasHeight;
    const hasWeightOrDimensions = hasWeight || hasDimensions;
    const hasBrand = Boolean(brandValue);
    const hasStockStatus = Boolean(stockStatusValue);
    const hasProductStatus = Boolean(productStatusValue);
    const hasMainImage = rightData.mainImage !== null;
    const hasCategories = rightData.categories && rightData.categories.length > 0;
    const hasTags = rightData.tags && rightData.tags.length > 0;

    return (
      hasProductName &&
      hasDescription &&
      hasBasePrice &&
      hasStockQuantity &&
      hasWeightOrDimensions &&
      hasBrand &&
      hasStockStatus &&
      hasProductStatus &&
      hasMainImage &&
      hasCategories &&
      hasTags
    );
  }, [
    productName,
    description,
    basePrice,
    stockQuantity,
    weight,
    lengthCm,
    widthCm,
    heightCm,
    brandValue,
    stockStatusValue,
    productStatusValue,
    rightData,
  ]);

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
          weight={weight}
          setWeight={setWeight}
          lengthCm={lengthCm}
          setLengthCm={setLengthCm}
          widthCm={widthCm}
          setWidthCm={setWidthCm}
          heightCm={heightCm}
          setHeightCm={setHeightCm}
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
            onCreateBrand={(name: string) =>
              createBrandMutation.mutate(name, {
                onSuccess: (res) => {
                  try {
                    // set newly created brand as selected
                    setValue("brand", res.payload.id);
                  } catch (e) {}
                },
              })
            }
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
          disabled={!isFormValid}
        >
          Save Product
        </CustomButton>
      </div>
    </div>
  );
}
