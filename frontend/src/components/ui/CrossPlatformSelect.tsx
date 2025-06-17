import React, { forwardRef } from "react";
import { isAndroid } from "@/lib/isAndroidWebView";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from '@/lib/utils';

interface Option {
  value: string;
  label: string;
}

interface CrossPlatformSelectProps {
  value: string | undefined;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

const CrossPlatformSelect = forwardRef<HTMLSelectElement, CrossPlatformSelectProps>(
  ({ value, onChange, options, placeholder, className }, ref) => {
    if (isAndroid()) {
      return (
        <select
          value={value || ""}
          onChange={e => onChange(e.target.value)}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          style={{
            WebkitAppearance: 'none',
            MozAppearance: 'none',
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
            boxShadow: "0 0 0 2px #1976d2 inset"
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
);

CrossPlatformSelect.displayName = 'CrossPlatformSelect';

export { CrossPlatformSelect }; 