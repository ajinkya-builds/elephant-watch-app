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

interface ReporterDetailsSectionProps {
  control: Control<any>; 
}

export function ReporterDetailsSection({ control }: ReporterDetailsSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="reporterName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>18) Your Good Name ? आप का नाम ? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input placeholder="Your Name / आपका नाम" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="reporterMobile"
        render={({ field }) => (
          <FormItem>
            <FormLabel>19) Your Mobile No. <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="tel" placeholder="e.g., 9876543210 / उदा. ९८७६५४३२१०" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}