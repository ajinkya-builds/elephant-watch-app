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

interface ElephantSightingSectionProps {
  control: Control<any>;
}

export function ElephantSightingSection({ control }: ElephantSightingSectionProps) {
  return (
    <>
      <FormField
        control={control}
        name="totalElephants"
        render={({ field }) => (
          <FormItem>
            <FormLabel>7) Total Number of Wild Elephant ? झुण्ड में हाथियों की कुल संख्या ? <span className="text-red-500">*</span></FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 5 / उदा. 5" {...field} 
                onChange={event => field.onChange(+event.target.value)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="maleElephants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>8) नर हाथी की संख्या?</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1 / उदा. 1" {...field} 
                  onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                  value={field.value === null ? '' : String(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="femaleElephants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>9) मादा हाथी की संख्या?</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 3 / उदा. 3" {...field} 
                  onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                  value={field.value === null ? '' : String(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="unknownElephants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>10) अज्ञात हाथी की संख्या?</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 1 / उदा. 1" {...field} 
                  onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                  value={field.value === null ? '' : String(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
}