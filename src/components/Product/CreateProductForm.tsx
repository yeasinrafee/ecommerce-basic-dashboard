"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import CustomRichTextEditor from "../Common/CustomRichTextEditor";
import CustomCheckbox from "../FormFields/CustomCheckbox";
import CustomInput from "../FormFields/CustomInput";
import CustomSelect from "../FormFields/CustomSelect";

const categoriesList = [
  "Electronics",
  "Clothing",
  "Home",
  "Beauty",
  "Sports",
  "Books",
];

export default function CreateProductForm() {
  const [categories, setCategories] = useState<string[]>([]);
  const [attributes, setAttributes] = useState<
    { name: string; value: string; price: string }[]
  >([]);
  const [additionalInfo, setAdditionalInfo] = useState<{ name: string; value: string }[]>([]);
  const [description, setDescription] = useState(""); //
  
  const [attributeName, setAttributeName] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [attributePrice, setAttributePrice] = useState("");
  const [infoName, setInfoName] = useState("");
  const [infoValue, setInfoValue] = useState("");

  // Discount fields
  const [discountValue, setDiscountValue] = useState<number | null>(null);

  const { control, watch } = useForm<{ discountType: string }>({
    defaultValues: { discountType: "none" },
  });

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const addAttribute = () => {
    if (!attributeName.trim() || !attributeValue.trim()) return;
    setAttributes([
      ...attributes,
      { name: attributeName.trim(), value: attributeValue.trim(), price: attributePrice.trim() },
    ]);
    setAttributeName("");
    setAttributeValue("");
    setAttributePrice("");
  };

  const removeAttribute = (index: number) => {
    setAttributes(attributes.filter((_, i) => i !== index));
  };

  const addAdditionalInfo = () => {
    if (!infoName.trim() || !infoValue.trim()) return;
    setAdditionalInfo([
      ...additionalInfo,
      { name: infoName.trim(), value: infoValue.trim() },
    ]);
    setInfoName("");
    setInfoValue("");
  };

  const removeAdditionalInfo = (index: number) => {
    setAdditionalInfo(additionalInfo.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <Card className="rounded-2xl shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl">Create Product</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">General Information</h2>
            <CustomInput label="Product Name" placeholder="Enter product name" />

            {/* Discount Type & Value */}
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomSelect
                  control={control}
                  name="discountType"
                  label="Discount Type"
                  options={[
                    { value: "none", label: "None" },
                    { value: "flat", label: "Flat Discount" },
                    { value: "percent", label: "Percentage Discount" },
                  ]}
                  placeholder="Select type"
                />
              </div>
              <div className="flex-1">
                <CustomInput
                  label="Discount Value"
                  type="number"
                  value={discountValue === null ? "" : discountValue}
                  onValueChange={(val) => setDiscountValue(val as number | null)}
                  placeholder="Enter value"
                  min={0}
                  disabled={watch("discountType") === "none"}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Categories</Label>
              <div className="grid grid-cols-2 gap-3">
                {categoriesList.map((cat) => (
                  <CustomCheckbox
                    key={cat}
                    checked={categories.includes(cat)}
                    onCheckedChange={() => toggleCategory(cat)}
                    label={cat}
                    containerClassName="items-center gap-2"
                    labelClassName="text-sm font-normal"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Attributes Section */}
          <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Attributes</h2>
            <div className="grid grid-cols-3 gap-3">
              <CustomInput
                label="Name"
                placeholder="Name (e.g. Color)"
                value={attributeName}
                onChange={(e) => setAttributeName(e.target.value)}
              />
              <CustomInput
                label="Value"
                placeholder="Value (e.g. Red)"
                value={attributeValue}
                onChange={(e) => setAttributeValue(e.target.value)}
              />
              <CustomInput
                label="Price"
                placeholder="Price"
                type="number"
                value={attributePrice}
                onChange={(e) => setAttributePrice(e.target.value)}
              />
            </div>
            <div>
              <Button type="button" className="w-full" onClick={addAttribute}>
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr, index) => (
                <Badge key={`${attr.name}-${attr.value}-${index}`} className="flex items-center gap-2">
                  <span>
                    <strong>{attr.name}:</strong> {attr.value} {attr.price ? `- ${attr.price}` : ""}
                  </span>
                  <X size={14} className="cursor-pointer" onClick={() => removeAttribute(index)} />
                </Badge>
              ))}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Additional Information</h2>
            <div className="grid grid-cols-1 gap-3">
              <CustomInput
                placeholder="Field Name"
                value={infoName}
                onChange={(e) => setInfoName(e.target.value)}
              />
              <CustomInput
                placeholder="Field Value"
                value={infoValue}
                onChange={(e) => setInfoValue(e.target.value)}
              />
              <Button type="button" onClick={addAdditionalInfo}>Add Info</Button>
            </div>
            <div className="space-y-2">
              {additionalInfo.map((info, index) => (
                <div key={index} className="flex items-center justify-between border rounded-xl px-3 py-2">
                  <span className="text-sm"><strong>{info.name}:</strong> {info.value}</span>
                  <X size={16} className="cursor-pointer" onClick={() => removeAdditionalInfo(index)} />
                </div>
              ))}
            </div>
          </div>

          {/* Description Section with Rich Text Editor */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Description</h2>
            <CustomRichTextEditor 
              value={description} 
              onChange={setDescription} 
            />
          </div>

          <Button 
            className="w-full rounded-2xl text-base py-6"
            onClick={() => console.log("Final HTML Output:", description)}
          >
            Save Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}