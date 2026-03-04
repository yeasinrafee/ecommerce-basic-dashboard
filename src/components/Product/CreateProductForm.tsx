"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import CustomRichTextEditor from "../Common/CustomRichTextEditor";
import CustomCheckbox from "../FormFields/CustomCheckbox";
import CustomInput from "../FormFields/CustomInput";

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
  const [attributes, setAttributes] = useState<string[]>([]);
  const [additionalInfo, setAdditionalInfo] = useState<{ name: string; value: string }[]>([]);
  const [description, setDescription] = useState(""); //

  const [attributeInput, setAttributeInput] = useState("");
  const [infoName, setInfoName] = useState("");
  const [infoValue, setInfoValue] = useState("");

  const toggleCategory = (category: string) => {
    setCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const addAttribute = () => {
    if (!attributeInput.trim()) return;
    setAttributes([...attributes, attributeInput.trim()]);
    setAttributeInput("");
  };

  const removeAttribute = (attr: string) => {
    setAttributes(attributes.filter((a) => a !== attr));
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
            <div className="flex gap-3">
              <CustomInput
                placeholder="e.g. Color, Size"
                value={attributeInput}
                onChange={(e) => setAttributeInput(e.target.value)}
                containerClassName="w-full"
              />
              <Button type="button" onClick={addAttribute}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {attributes.map((attr) => (
                <Badge key={attr} className="flex items-center gap-1">
                  {attr}
                  <X size={14} className="cursor-pointer" onClick={() => removeAttribute(attr)} />
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