"use client";

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

interface GpsLocationSectionProps {
  control: Control<any>;
  isFetchingLocation: boolean;
  handleFetchLocation: () => void;
}

export function GpsLocationSection({ control, isFetchingLocation, handleFetchLocation }: GpsLocationSectionProps) {
  return (
    <>
      <div className="space-y-2 mb-4">
        <Button 
          type="button" 
          onClick={handleFetchLocation} 
          disabled={isFetchingLocation}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <LocateFixed className="mr-2 h-4 w-4" />
          {isFetchingLocation 
            ? "Fetching Location... / स्थान प्राप्त हो रहा है..." 
            : "Get Current Location / वर्तमान स्थान प्राप्त करें"}
        </Button>
        <FormDescription className="text-xs">
          Click to attempt auto-filling Latitude and Longitude. Requires location permission.
          अक्षांश और देशांतर को स्वतः भरने का प्रयास करने के लिए क्लिक करें। स्थान अनुमति की आवश्यकता है।
        </FormDescription>
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
}