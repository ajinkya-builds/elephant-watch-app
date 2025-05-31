import React from "react";
import { isAndroid } from "@/lib/isAndroidWebView";
import { CrossPlatformSelect } from "./CrossPlatformSelect";

// Simple native select for Android WebView
function SimpleSelect({ value, onChange, options, placeholder, className }: any) {
  return (
    <select
      value={value || ""}
      onChange={e => onChange(e.target.value)}
      className={className || "w-full h-12 text-base border rounded"}
      style={{
        width: "100%",
        minHeight: 48,
        fontSize: 16,
        border: "1px solid #ccc",
        borderRadius: 6,
        background: "#fff",
        color: "#222",
        margin: "8px 0",
        padding: "8px 12px",
      }}
    >
      <option value="">{placeholder || "Select an option"}</option>
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export interface OptionType {
  value: string;
  label: string;
}

interface StepperSelectProps {
  options: OptionType[];
  value: string | undefined;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const StepperSelect: React.FC<StepperSelectProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className,
}) => {
  if (isAndroid()) {
    return (
      <SimpleSelect
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={className}
      />
    );
  }
  return (
    <CrossPlatformSelect
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
    />
  );
}; 