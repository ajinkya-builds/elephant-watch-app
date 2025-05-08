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
import { z } from "zod";

// Define the schema part relevant to this section for type inference if needed
// This is illustrative; the main schema in ReportForm.tsx is the source of truth.
const reporterInfoSchema = z.object({
  email: z.string().email().min(1),
  reporterName: z.string().min(1),
  reporterMobile: z.string().min(1).regex(/^\d{10}$/),
});

type ReporterInfoFormValues = z.infer<typeof reporterInfoSchema>;

interface ReporterInfoSectionProps {
  control: Control<any>; // Use 'any' or a more specific form values type if preferred
}

export function ReporterInfoSection({ control }: ReporterInfoSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="email" placeholder="your.email@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

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