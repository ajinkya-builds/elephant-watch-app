"use client";

import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  CrossPlatformSelect
} from "@/components/ui/CrossPlatformSelect";

interface DamageAssessmentSectionProps {
  control: Control<any>;
}

export function DamageAssessmentSection({ control }: DamageAssessmentSectionProps) {
  return (
    <FormField
      control={control}
      name="damageDone"
      render={({ field }) => (
        <FormItem>
          <FormLabel>6a. Damage done by wild elephants? जंगली हाथियों द्वारा किया गया नुकसान?</FormLabel>
          <CrossPlatformSelect
            value={field.value}
            onChange={field.onChange}
            placeholder="Select damage type / नुकसान का प्रकार चुनें"
            options={[
              { value: "crop", label: "Crop / फसल" },
              { value: "property", label: "Property / संपत्ति" },
              { value: "human_injury", label: "Human Injury / मानव चोट" },
              { value: "human_death", label: "Human Death / मानव मृत्यु" },
              { value: "cattle_injury", label: "Cattle Injury / मवेशी चोट" },
              { value: "cattle_death", label: "Cattle Death / मवेशी मृत्यु" },
              { value: "other", label: "Other / अन्य" },
            ]}
          />
          <FormMessage />
        </FormItem>
      )}
    />
  );
}