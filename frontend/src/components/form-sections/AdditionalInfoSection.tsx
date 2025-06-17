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
import { Textarea } from "@/components/ui/textarea";

interface AdditionalInfoSectionProps {
  control: Control<any>;
}

export function AdditionalInfoSection({ control }: AdditionalInfoSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="headingTowards"
        render={({ field }) => (
          <FormItem>
            <FormLabel>15) Heading towards हाथियों के आगे बढ़ने की दिशा /स्थान?</FormLabel>
            <FormControl>
              <Input placeholder="e.g., North towards village / उदा. उत्तर गांव की ओर" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="localName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>16) Local Name ? हाथियों की वर्त्तमान स्थिति का स्थानीय नाम?</FormLabel>
            <FormControl>
              <Input placeholder="e.g., Near riverbed / उदा. नदी के किनारे" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="identificationMarks"
        render={({ field }) => (
          <FormItem>
            <FormLabel>17. Write the identification marks/information about elephants, if any? हाथियों के पहचान के निशान/जानकारी यदि हो तो लिखें ?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="e.g., One elephant has a torn ear / उदा. एक हाथी का कान फटा हुआ है"
                className="resize-none"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}