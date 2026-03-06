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
  onChange?: (data: AttributesData) => void;
}

const Attributes: React.FC<AttributesProps> = ({ onChange }) => {
  const [attributeName, setAttributeName] = React.useState("");
  const [attributeValue, setAttributeValue] = React.useState("");
  const [attributePrice, setAttributePrice] = React.useState("");
  const [attributes, setAttributes] = React.useState<AttributeRecord[]>([]);

  const [infoName, setInfoName] = React.useState("");
  const [infoValue, setInfoValue] = React.useState("");
  const [additionalInfo, setAdditionalInfo] = React.useState<
    AdditionalInfo[]
  >([]);

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

  React.useEffect(() => {
    if (onChange) {
      onChange({ attributes, additionalInfo });
    }
  }, [attributes, additionalInfo, onChange]);

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
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInfoName(event.target.value)}
          />
          <CustomInput
            label="Field Value"
            value={infoValue}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setInfoValue(event.target.value)}
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
  );
};

export default Attributes;