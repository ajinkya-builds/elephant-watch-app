import React from "react";
import { isAndroidWebView } from "@/lib/isAndroidWebView";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "./select";

interface Option {
  value: string;
  label: string;
}

interface Props {
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function CrossPlatformSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
}: Props) {
  if (isAndroidWebView()) {
    return (
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={className || "w-full h-12 text-base border rounded"}
      >
        <option value="">{placeholder || "Select an option"}</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || "w-full h-12 text-base"}>
        <SelectValue placeholder={placeholder || "Select an option"} />
      </SelectTrigger>
      <SelectContent>
        {options.map(opt => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 