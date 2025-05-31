import React from "react";
import { isAndroid } from "@/lib/isAndroidWebView";
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
  if (isAndroid()) {
    return (
      <select
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={className}
        style={{
          width: "100%",
          minHeight: 48,
          fontSize: 16,
          border: "2px solid #1976d2",
          borderRadius: 6,
          background: "#fff",
          color: "#222",
          margin: "8px 0",
          padding: "8px 12px",
          appearance: "auto",
          WebkitAppearance: "auto",
          MozAppearance: "auto",
          // Add a strong box shadow for visibility
          boxShadow: "0 0 0 2px #1976d2 inset",
        }}
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