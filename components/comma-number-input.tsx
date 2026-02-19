"use client";

import { useState } from "react";
import { formatNumberString } from "@/lib/number";

type CommaNumberInputProps = {
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export default function CommaNumberInput({
  name,
  defaultValue,
  required,
  placeholder,
  className,
}: CommaNumberInputProps) {
  const [value, setValue] = useState(formatNumberString(String(defaultValue ?? "")));

  return (
    <input
      name={name}
      type="text"
      inputMode="numeric"
      pattern="[0-9,]*"
      required={required}
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={(e) => setValue(formatNumberString(e.target.value))}
    />
  );
}
