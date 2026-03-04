"use client";

import * as React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface CustomSelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

interface CustomSelectProps
  extends Omit<React.ComponentProps<typeof Select>, "children"> {
  id?: string;
  label?: React.ReactNode;
  placeholder?: string;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  options?: CustomSelectOption[];
  children?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  triggerClassName?: string;
  contentClassName?: string;
  itemClassName?: string;
  helperTextClassName?: string;
  errorClassName?: string;
}

const CustomSelect = ({
  id,
  label,
  placeholder = "Select an option",
  helperText,
  error,
  options = [],
  children,
  containerClassName,
  labelClassName,
  triggerClassName,
  contentClassName,
  itemClassName,
  helperTextClassName,
  errorClassName,
  ...props
}: CustomSelectProps) => {
  const generatedId = React.useId();
  const selectId = id ?? generatedId;

  const helperId = helperText ? `${selectId}-helper` : undefined;
  const errorId = error ? `${selectId}-error` : undefined;
  const describedBy = [helperId, errorId].filter(Boolean).join(" ");

  return (
    <div className={cn("space-y-2", containerClassName)}>
      {label ? (
        <Label htmlFor={selectId} className={labelClassName}>
          {label}
        </Label>
      ) : null}

      <Select {...props}>
        <SelectTrigger
          id={selectId}
          className={triggerClassName}
          aria-describedby={describedBy || undefined}
          aria-invalid={Boolean(error) || undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent className={contentClassName}>
          {children
            ? children
            : options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                  className={cn(itemClassName, option.className)}
                >
                  {option.label}
                </SelectItem>
              ))}
        </SelectContent>
      </Select>

      {helperText ? (
        <p
          id={helperId}
          className={cn("text-xs text-muted-foreground", helperTextClassName)}
        >
          {helperText}
        </p>
      ) : null}

      {error ? (
        <p id={errorId} className={cn("text-xs text-destructive", errorClassName)}>
          {error}
        </p>
      ) : null}
    </div>
  );
};

export default CustomSelect;