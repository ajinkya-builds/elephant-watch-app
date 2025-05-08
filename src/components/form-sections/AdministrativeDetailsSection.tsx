"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface AdministrativeDetailsSectionProps {
  control: Control<any>;
}

const landTypes = [
  { id: "RF", label: "RF" },
  { id: "PF", label: "PF" },
  { id: "ORANGE", label: "ORANGE" },
  { id: "REVENUE", label: "REVENUE" },
  { id: "OTHER", label: "OTHER / अन्य" },
];

export function AdministrativeDetailsSection({ control }: AdministrativeDetailsSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="divisionName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>1. Division Name ? वनमण्डल का नाम ? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="e.g., North Raipur / उदा. उत्तर रायपुर" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="rangeName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>2. (a) Range Name ? परिक्षेत्र का नाम? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="e.g., Baloda Bazar / उदा. बलौदा बाजार" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="landType"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>3. Type of Land ? भूमि की स्थिति? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1 sm:flex-row sm:space-x-4 sm:space-y-0"
              >
                {landTypes.map((type) => (
                  <FormItem key={type.id} className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <RadioGroupItem value={type.id} />
                    </FormControl>
                    <FormLabel className="font-normal">{type.label}</FormLabel>
                  </FormItem>
                ))}
              </RadioGroup>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="beatName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>4. Write the BEAT name ? बीट का नाम लिखे? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="e.g., Kothari / उदा. कोठारी" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="compartmentNo"
        render={({ field }) => (
          <FormItem>
            <FormLabel>5. Write the COMPARTMENT No. ? कक्ष क्रमांक का नम्बर लिखे लिखे? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="e.g., C123 / उदा. सी123" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}