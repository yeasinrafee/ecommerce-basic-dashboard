"use client";

import * as React from "react";
import { useForm } from "react-hook-form";

import CustomButton from "../Common/CustomButton";
import CustomTab, { CustomTabItem } from "../Common/CustomTab";

import CustomDatePicker from "../FormFields/CustomDatePicker";
import CustomInput from "../FormFields/CustomInput";
import CustomSelect from "../FormFields/CustomSelect";
import CustomTextArea from "../FormFields/CustomTextArea";

import MainInformation from "./ProductForm/MainInformation";
import GeneralInformation from "./ProductForm/GeneralInformation";
import Attributes, { AttributesData } from "./ProductForm/Attributes";
import Seo, { SeoData } from "./ProductForm/Seo";
import RightSection, { RightSectionData } from "./ProductForm/RightSection";

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


type AttributeRecord = {
  name: string;
  pairs: { value: string; price: string }[];
};

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


  // callbacks for child data
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
          costPrice={costPrice}
          setCostPrice={setCostPrice}
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
      content: <Attributes onChange={setAttributesData} />,  
    },
    {
      id: "seo",
      label: "SEO",
      content: <Seo onChange={setSeoData} />,  
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 lg:flex-row">
        <div className="flex-1 space-y-6">
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

        {/* right column: moved into dedicated component */}
        <RightSection
          categoriesList={categoriesList}
          tagList={tagList}
          onChange={setRightData}
        />
      </div>
    </div>
  );
}