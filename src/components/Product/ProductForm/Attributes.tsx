import React from "react";
import { Plus, X } from "lucide-react";
import { AiOutlineCheck } from "react-icons/ai";
import { useForm } from "react-hook-form";

import CustomButton from "../../Common/CustomButton";
import CustomInput from "../../FormFields/CustomInput";
import CustomSelect from "../../FormFields/CustomSelect";

export type AttributeRecord = {
  name: string;
  pairs: { value: string; price: string; imageId?: string | null }[];
};

export type AdditionalInfo = { name: string; value: string };

export interface AttributesData {
  attributes: AttributeRecord[];
  additionalInfo: AdditionalInfo[];
}

interface AttributesProps {
  onChange?: (data: AttributesData) => void;
  galleryImages?: { id: string; name: string; url: string }[];
}

const Attributes: React.FC<AttributesProps> = ({ onChange, galleryImages = [] }) => {
  const [attributeName, setAttributeName] = React.useState("");
  const [attributeValue, setAttributeValue] = React.useState("");
  const [attributePrice, setAttributePrice] = React.useState("");
  const [attributes, setAttributes] = React.useState<AttributeRecord[]>([]);
  const [selectedGalleryImageId, setSelectedGalleryImageId] = React.useState<string | null>(null);

  const { control } = useForm<{ attributeName: string }>({
    defaultValues: { attributeName: "" },
  });

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
            ? {
                ...attr,
                pairs: [
                  ...attr.pairs,
                  { value, price, imageId: selectedGalleryImageId ?? null },
                ],
              }
            : attr,
        );
      }
      return [
        ...prev,
        {
          name,
          pairs: [{ value, price, imageId: selectedGalleryImageId ?? null }],
        },
      ];
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

  React.useEffect(() => {
    if (onChange) {
      onChange({ attributes, additionalInfo: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attributes]);

  const selectedGalleryImage = galleryImages.find((img) => img.id === selectedGalleryImageId);

  return (
    <div className="space-y-6">
      {galleryImages && galleryImages.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Gallery images</p>
            {/* <p className="text-xs text-slate-500">
              {selectedGalleryImage
                ? `Selected: ${selectedGalleryImage.name}`
                : "Choose an image before adding an attribute."}
            </p> */}
          </div>
          <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((img) => {
              const isSelected = selectedGalleryImageId === img.id;
              return (
                <button
                  key={img.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() =>
                    setSelectedGalleryImageId((prev) =>
                      prev === img.id ? null : img.id,
                    )
                  }
                  className={`relative h-12 w-12 flex-shrink-0 overflow-hidden rounded transition border border-slate-200 hover:brightness-95`}
                >
                  <img
                    src={img.url}
                    alt={img.name}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 shadow-md">
                        <AiOutlineCheck className="h-3 w-3 text-white" aria-hidden />
                      </span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          {selectedGalleryImage && (
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
              <span>Image for next value:</span>
              <span className="truncate font-semibold text-slate-700">
                {selectedGalleryImage.name}
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <div className="text-sm font-semibold text-slate-700">Attribute</div>
        <div className="grid gap-3 md:grid-cols-3">
          <CustomSelect
            name="attributeName"
            control={control}
            label="Name"
            placeholder="Select attribute"
            options={[
              { label: "Color", value: "Color" },
              { label: "Size", value: "Size" },
              { label: "Material", value: "Material" },
              { label: "Style", value: "Style" },
              { label: "Capacity", value: "Capacity" },
            ]}
            onChangeCallback={(v: string) => setAttributeName(v)}
            className="w-full"
            triggerClassName="w-full"
          />
          <CustomInput
            label="Value"
            placeholder="e.g. Red"
            value={attributeValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAttributeValue(event.target.value)}
          />
          <CustomInput
            label="Price (optional)"
            placeholder="Extra price"
            type="number"
            value={attributePrice}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAttributePrice(event.target.value)}
          />
        </div>
        <CustomButton
          type="button"
          className=""
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">
                  {attr.name}
                </h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {attr.pairs.map((pair, index) => {
                  const pairImage = galleryImages.find((img) => img.id === pair.imageId);
                  return (
                    <div
                      key={`${attr.name}-${index}`}
                      className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm"
                    >
                      {pairImage && (
                        <img
                          src={pairImage.url}
                          alt={pairImage.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      )}
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
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Attributes;
