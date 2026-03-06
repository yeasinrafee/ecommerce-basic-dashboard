import React from "react";
import { Plus, X } from "lucide-react";

import CustomButton from "../../Common/CustomButton";
import CustomInput from "../../FormFields/CustomInput";

export type AttributeRecord = {
  name: string;
  pairs: { value: string; price: string }[];
};

export type AdditionalInfo = { name: string; value: string };

export interface AttributesData {
  attributes: AttributeRecord[];
  additionalInfo: AdditionalInfo[];
}

interface AttributesProps {
  onChange?: (attributes: AttributeRecord[]) => void;
}

const Attributes: React.FC<AttributesProps> = ({ onChange }) => {
  const [attributeName, setAttributeName] = React.useState("");
  const [attributeValue, setAttributeValue] = React.useState("");
  const [attributePrice, setAttributePrice] = React.useState("");
  const [attributes, setAttributes] = React.useState<AttributeRecord[]>([]);

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
                pairs: [...attr.pairs, { value, price }],
              }
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

  React.useEffect(() => {
    if (onChange) {
      onChange(attributes);
    }
  }, [attributes]);

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-700">Add Attribute</div>
        <div className="grid gap-3 md:grid-cols-3">
          <CustomInput
            label="Name"
            placeholder="e.g. Color"
            value={attributeName}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setAttributeName(event.target.value)}
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
    </div>
  );
};

export default Attributes;