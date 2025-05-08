"use client";

import React from 'react'; // Explicitly import React
import { Control } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LocateFixed } from "lucide-react";

interface LocationDateTimeSectionProps {
  control: Control<any>;
  isFetching: boolean;
  handleFetchData: () => void;
}

export const LocationDateTimeSection: React.FC<LocationDateTimeSectionProps> = ({ control, isFetching, handleFetchData }) => {
  return (
    <>
      <div className="space-y-2 mb-4">
        <Button
          type="button"
          onClick={handleFetchData}
          disabled={isFetching}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <LocateFixed className="mr-2 h-4 w-4" />
          {isFetching
            ? "Fetching Data... / डेटा प्राप्त हो रहा है..."
            : "Get Current Location, Date & Time"}
        </Button>
        <FormDescription className="text-xs">
          Click to attempt auto-filling Location, Date, and Time. Requires location permission.
          स्थान, दिनांक और समय को स्वतः भरने का प्रयास करने के लिए क्लिक करें। स्थान अनुमति की आवश्यकता है।
        </FormDescription>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <FormField
          control={control}
          name="activityDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>11) Date ? दिनांक? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="activityTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>12) Time/ समय ? <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input type="time" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={control}
          name="latitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>13) Latitude अक्षांश डिग्री डेसीमल (23.6552) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., 23.4536" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="longitude"
          render={({ field }) => (
            <FormItem>
              <FormLabel>14) Longitude देशांतर डिग्री डेसीमल (80.5652) <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="e.g., 81.4763" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};