import React from "react";
import { OTPInput, type OTPInputProps, type RenderProps, REGEXP_ONLY_DIGITS } from "input-otp";
import clsx from "clsx";

interface OtpInputProps extends Omit<OTPInputProps, "render" | "children" | "maxLength"> {
  length?: number;
  label?: React.ReactNode;
  helperText?: React.ReactNode;
  helperClassName?: string;
  error?: React.ReactNode;
  errorClassName?: string;
  className?: string;
  inputWrapperClassName?: string;
  slotClassName?: string;
  slotActiveClassName?: string;
  placeholderChar?: string;
  allowedPattern?: string | RegExp;
}

const DEFAULT_LENGTH = 6;

const serializePattern = (pattern?: string | RegExp) => {
  if (!pattern) {
    return undefined;
  }
  return typeof pattern === "string" ? pattern : pattern.source;
};

const OtpInput = React.forwardRef<HTMLInputElement, OtpInputProps>((props, ref) => {
  const {
    length = DEFAULT_LENGTH,
    label,
    helperText,
    helperClassName,
    error,
    errorClassName,
    className,
    inputWrapperClassName,
    slotClassName,
    slotActiveClassName,
    placeholderChar = "•",
    allowedPattern = REGEXP_ONLY_DIGITS,
    value,
    onChange,
    ...rest
  } = props;

  const pattern = serializePattern(allowedPattern);
  const slotRenderer = React.useCallback((renderProps: RenderProps) => {
    const { slots, isFocused } = renderProps;
    return (
      <div className={clsx("flex w-full gap-2", inputWrapperClassName)}>
        {slots.map((slot, index) => (
          <span
            key={index}
            className={clsx(
              "flex h-12 w-12 items-center justify-center rounded-xl border text-lg font-semibold transition",
              slotClassName,
              slot.hasFakeCaret && isFocused ? slotActiveClassName ?? "border-indigo-500 shadow-[0_0_0_2px_rgba(79,70,229,0.4)]" : "border-slate-300"
            )}
          >
            {slot.char ?? slot.placeholderChar ?? placeholderChar}
          </span>
        ))}
      </div>
    );
  }, [inputWrapperClassName, slotClassName, slotActiveClassName, placeholderChar]);

  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      {label ? <span className="text-sm font-medium text-slate-700">{label}</span> : null}
      <OTPInput
        ref={ref}
        value={value}
        onChange={onChange}
        maxLength={length}
        render={slotRenderer}
        pattern={pattern}
        {...rest}
      />
      {error ? (
        <p className={clsx("text-xs text-rose-600", errorClassName)}>{error}</p>
      ) : helperText ? (
        <p className={clsx("text-xs text-slate-500", helperClassName)}>{helperText}</p>
      ) : null}
    </div>
  );
});

export default OtpInput;
