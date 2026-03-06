import React from "react";
import { Control } from "react-hook-form";

import CustomInput from "../../FormFields/CustomInput";
import CustomSelect from "../../FormFields/CustomSelect";
import CustomDatePicker from "../../FormFields/CustomDatePicker";

interface Option {
  label: string;
  value: string;
}

interface GeneralInformationProps {
  basePrice: number | null;
  setBasePrice: (value: number | null) => void;
  selectedDiscountType: string;
  discountValue: number | null;
  setDiscountValue: (value: number | null) => void;
  discountStart: Date | null;
  setDiscountStart: (value: Date | null) => void;
  discountEnd: Date | null;
  setDiscountEnd: (value: Date | null) => void;
  stockQuantity: number | null;
  setStockQuantity: (value: number | null) => void;
  sku: string;
  setSku: (value: string) => void;
  control: Control<any>;
  discountOptions: Option[];
  stockStatusOptions: Option[];
  productStatusOptions: Option[];
}

const GeneralInformation: React.FC<GeneralInformationProps> = ({
  basePrice,
  setBasePrice,
  selectedDiscountType,
  discountValue,
  setDiscountValue,
  discountStart,
  setDiscountStart,
  discountEnd,
  setDiscountEnd,
  stockQuantity,
  setStockQuantity,
  sku,
  setSku,
  control,
  discountOptions,
  stockStatusOptions,
  productStatusOptions,
}) => {
  const finalPrice = React.useMemo(() => {
    if (basePrice == null) return "";
    const disc = discountValue ?? 0;
    switch (selectedDiscountType) {
      case "flat":
        return Math.max(0, basePrice - disc);
      case "percent":
        return Math.max(0, basePrice - basePrice * (disc / 100));
      default:
        return basePrice;
    }
  }, [basePrice, selectedDiscountType, discountValue]);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <CustomInput
          label="Base Price"
          type="number"
          value={basePrice === null ? "" : basePrice}
          onValueChange={(value) => setBasePrice(value as number | null)}
          placeholder="0.00"
        />
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Final Price
          </label>
          <CustomInput
            type="number"
            value={finalPrice === "" ? "" : finalPrice}
            disabled
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CustomSelect
          name="discountType"
          control={control}
          label="Discount Type"
          options={discountOptions}
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
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setSku(event.target.value)}
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
  );
};

export default GeneralInformation;