import React from "react";
import Select, { Props as ReactSelectProps } from "react-select";

export interface OptionType {
  value: string;
  label: string;
}

interface StepperSelectProps extends Omit<ReactSelectProps<OptionType, false>, "options" | "onChange" | "value"> {
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
  ...rest
}) => {
  const selectedOption = options.find(opt => opt.value === value) || null;

  return (
    <Select
      options={options}
      value={selectedOption}
      onChange={opt => onChange(opt ? opt.value : "")}
      placeholder={placeholder || "Select an option"}
      className={className}
      classNamePrefix="stepper-select"
      isSearchable={false}
      {...rest}
    />
  );
}; 