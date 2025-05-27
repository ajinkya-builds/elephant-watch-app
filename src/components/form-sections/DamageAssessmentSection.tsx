"use client";

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface DamageAssessmentSectionProps {
  control: Control<any>;
}

const damageOptions = [
  "No Loss / कोई हानि नहीं",
  "Loss of Cattle / मवेशियों की हानि",
  "Loss of Crop / फसल की हानि",
  "Loss of Solar Pump / सोलर पंप की हानि",
  "Loss of Solar Plate / सोलर प्लेट की हानि",
  "Loss of Pipeline / पाइपलाइन की हानि",
  "Loss of Checking Barrier / चेकिंग बैरियर की हानि",
  "Loss of Sign Board / साइन बोर्ड की हानि",
  "Loss of Camp/Watchtower/any human made structure/Fencing / कैंप/वॉचटावर/किसी भी मानव निर्मित संरचना/फेंसिंग की हानि",
  "Loss of Human Life / मानव जीवन की हानि",
  "Human Injury / मानव चोट",
  "Loss of House / घर की हानि",
  "Vehicles / वाहन",
  "Other / अन्य",
];

export function DamageAssessmentSection({ control }: DamageAssessmentSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="damageDone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>6a. Damage Done by Wild Elephants ? जंगली हाथियों द्वारा की गई हानि ? <span className="text-red-500">*</span></FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select damage type / हानि का प्रकार चुनें" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {damageOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="damageDescription"
        render={({ field }) => (
          <FormItem>
            <FormLabel>6b. Write the damage caused by wild elephants? जंगली हाथियों द्वारा की गई हानि को लिखियें?</FormLabel>
            <FormControl>
              <Textarea
                placeholder="Describe the damage / हानि का विवरण दें"
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