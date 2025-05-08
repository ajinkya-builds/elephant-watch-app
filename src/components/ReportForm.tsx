"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

const reportFormSchema = z.object({
  location: z.string().min(1, "Location is required"),
  numberOfElephants: z.coerce.number().min(1, "At least one elephant must be reported"),
  description: z.string().min(10, "Description must be at least 10 characters long"),
  activityDate: z.string().min(1, "Activity date is required"), // Using string for datetime-local input
  country: z.string().min(1, "Country is required"),
  image: z.instanceof(FileList).optional(), // For file input
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

// Placeholder countries - we can expand this later or fetch from a DB
const countries = [
  { id: "kenya", name: "Kenya" },
  { id: "tanzania", name: "Tanzania" },
  { id: "south_africa", name: "South Africa" },
  { id: "botswana", name: "Botswana" },
  { id: "india", name: "India" },
];

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      location: "",
      numberOfElephants: 1,
      description: "",
      activityDate: new Date().toISOString().substring(0, 16), // Default to current date and time
      country: "",
      image: undefined,
    },
  });

  const imageRef = form.register("image");

  async function onSubmit(data: ReportFormValues) {
    setIsSubmitting(true);
    toast.info("Submitting report...");
    console.log("Form data:", data);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    // In a real app, you would send data to Supabase here
    // For example:
    // const { data: report, error } = await supabase
    //   .from('activity_reports')
    //   .insert([
    //     { 
    //       location: data.location,
    //       elephant_count: data.numberOfElephants,
    //       description: data.description,
    //       activity_timestamp: data.activityDate,
    //       country_id: data.country, // Assuming country stores an ID
    //       // image_url: uploadedImageUrl (handle image upload separately)
    //     }
    //   ]);
    // if (error) {
    //   toast.error(`Submission failed: ${error.message}`);
    // } else {
    //   toast.success("Report submitted successfully!");
    //   form.reset();
    // }

    toast.success("Report submitted successfully! (Simulated)");
    console.log("Image file:", data.image?.[0]);
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Near the river, Tsavo East" {...field} />
              </FormControl>
              <FormDescription>
                Describe where the activity was observed. GPS autofill coming soon!
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="numberOfElephants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Elephants</FormLabel>
              <FormControl>
                <Input type="number" placeholder="e.g., 5" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description of Activity</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe what the elephants were doing, their condition, etc."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="activityDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date and Time of Activity</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                We'll add more levels (Region, Park) soon.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="image"
          render={({ field }) => ( // field is not directly used here due to how file inputs work with react-hook-form
            <FormItem>
              <FormLabel>Upload Image (Optional)</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" {...imageRef} />
              </FormControl>
              <FormDescription>
                You can upload one image of the activity.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
      </form>
    </Form>
  );
}