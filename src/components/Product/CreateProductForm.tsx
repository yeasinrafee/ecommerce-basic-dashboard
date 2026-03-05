"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import CustomButton from "../Common/CustomButton";
import { X } from "lucide-react";
import CustomRichTextEditor from "../Common/CustomRichTextEditor";
import CustomCheckbox from "../FormFields/CustomCheckbox";
import CustomInput from "../FormFields/CustomInput";
import CustomSelect from "../FormFields/CustomSelect";
import CustomDatePicker from "../FormFields/CustomDatePicker";

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
    { name: string; pairs: { value: string; price: string }[] }[]
  >([]);
  const [additionalInfo, setAdditionalInfo] = useState<
    { name: string; value: string }[]
  >([]);
  const [description, setDescription] = useState(""); 

  const [attributeName, setAttributeName] = useState("");
  const [attributeValue, setAttributeValue] = useState("");
  const [attributePrice, setAttributePrice] = useState("");
  const [infoName, setInfoName] = useState("");
  const [infoValue, setInfoValue] = useState("");

  // Discount fields
  const [discountValue, setDiscountValue] = useState<number | null>(null);
  const [discountStart, setDiscountStart] = useState<Date | null>(null);
  const [discountEnd, setDiscountEnd] = useState<Date | null>(null);

  const { control, watch } = useForm<{ discountType: string }>({
    defaultValues: { discountType: "none" },
  });

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const addAttribute = () => {
    const name = attributeName.trim();
    const val = attributeValue.trim();
    if (!name || !val) return;
    const price = attributePrice.trim();

    setAttributes((prev) => {
      const existing = prev.find((a) => a.name === name);
      if (existing) {
        return prev.map((a) =>
          a.name === name
            ? { ...a, pairs: [...a.pairs, { value: val, price }] }
            : a,
        );
      }
      return [...prev, { name, pairs: [{ value: val, price }] }];
    });

    setAttributeValue("");
    setAttributePrice("");
  };

  const removeAttributePair = (attrName: string, pairIndex: number) => {
    setAttributes((prev) =>
      prev
        .map((a) => {
          if (a.name !== attrName) return a;
          const newPairs = a.pairs.filter((_, i) => i !== pairIndex);
          return { name: a.name, pairs: newPairs };
        })
        .filter((a) => a.pairs.length > 0),
    );
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
          <CardTitle className="text-2xl text-center bg-neutral-200 text-black px-4 py-6 rounded-sm">Create Product Form</CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
          <div className="space-y-6">
            {/* <h2 className="text-lg font-semibold">General Information</h2> */}
            <CustomInput
              label="Product Name"
              placeholder="Enter product name"
            />

            {/* Discount Type, Start/End Dates, & Value */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <CustomSelect
                    control={control}
                    name="discountType"
                    label="Discount Type"
                    labelClassName="mb-2"
                    triggerClassName="w-full"
                    options={[
                      { value: "none", label: "None" },
                      { value: "flat", label: "Flat Discount" },
                      { value: "percent", label: "Percentage Discount" },
                    ]}
                    placeholder="Select type"
                  />
                </div>

                <div>
                  <CustomInput
                    label="Discount Value"
                    type="number"
                    value={discountValue === null ? "" : discountValue}
                    onValueChange={(val) =>
                      setDiscountValue(val as number | null)
                    }
                    placeholder="Enter value"
                    min={0}
                    disabled={watch("discountType") === "none"}
                  />
                </div>

                <div>
                  <CustomDatePicker
                    label="Discount Start Date"
                    value={discountStart}
                    onChange={setDiscountStart}
                    disabled={watch("discountType") === "none"}
                  />
                </div>

                <div>
                  <CustomDatePicker
                    label="Discount End Date"
                    value={discountEnd}
                    onChange={setDiscountEnd}
                    disabled={watch("discountType") === "none"}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Categories</Label>
              <div className="grid grid-cols-3 gap-3">
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
                label="Price (optional)"
                placeholder="Price (optional)"
                type="number"
                value={attributePrice}
                onChange={(e) => setAttributePrice(e.target.value)}
              />
            </div>
            <div>
              <CustomButton type="button" className="w-full" onClick={addAttribute}>
                Add
              </CustomButton>
            </div>
            <div className="space-y-2">
              {attributes.map((attr, ai) => (
                <div key={attr.name} className="border rounded-xl p-2">
                  <div className="font-semibold mb-1">{attr.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {attr.pairs.map((p, pi) => (
                      <div
                        key={`${attr.name}-${pi}`}
                        className="flex items-center justify-between border rounded-xl px-3 py-1"
                      >
                        <span className="text-sm">
                          {p.value}
                          {p.price ? ` - ${p.price}` : ""}
                        </span>
                        <X
                          size={14}
                          className="cursor-pointer ml-2"
                          onClick={() => removeAttributePair(attr.name, pi)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-semibold">Additional Information</h2>
            <div className="grid grid-cols-1 gap-3">
              <CustomInput
                label="Name"
                placeholder="Field Name"
                value={infoName}
                onChange={(e) => setInfoName(e.target.value)}
              />
              <CustomInput
                label="Value"
                placeholder="Field Value"
                value={infoValue}
                onChange={(e) => setInfoValue(e.target.value)}
              />
              <CustomButton type="button" onClick={addAdditionalInfo}>
                Add Info
              </CustomButton>
            </div>
            <div className="space-y-2">
              {additionalInfo.map((info, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border rounded-xl px-3 py-2"
                >
                  <span className="text-sm">
                    <strong>{info.name}:</strong> {info.value}
                  </span>
                  <X
                    size={16}
                    className="cursor-pointer"
                    onClick={() => removeAdditionalInfo(index)}
                  />
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

          <CustomButton
            className="w-full rounded-2xl text-base py-6"
            onClick={() => console.log("Final HTML Output:", description)}
          >
            Save Product
          </CustomButton>
        </CardContent>
      </Card>
    </div>
  );
}
