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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useState } from "react";

const reportFormSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  divisionName: z.string().min(1, "Division Name is required / वनमण्डल का नाम आवश्यक है"),
  rangeName: z.string().min(1, "Range Name is required / परिक्षेत्र का नाम आवश्यक है"),
  landType: z.enum(["RF", "PF", "ORANGE", "REVENUE", "OTHER"], {
    required_error: "Type of Land is required / भूमि की स्थिति आवश्यक है",
  }),
  beatName: z.string().min(1, "Beat Name is required / बीट का नाम आवश्यक है"),
  compartmentNo: z.string().min(1, "Compartment Number is required / कक्ष क्रमांक आवश्यक है"),
  damageDone: z.string().min(1, "Damage information is required / हानि की जानकारी आवश्यक है"),
  damageDescription: z.string().optional(),
  totalElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"})
    .min(0, "Total elephants cannot be negative / हाथियों की कुल संख्या नकारात्मक नहीं हो सकती")
    .int("Must be a whole number / पूर्णांक होना चाहिए"),
  maleElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"}).min(0).int().optional().nullable(),
  femaleElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"}).min(0).int().optional().nullable(),
  unknownElephants: z.coerce.number({invalid_type_error: "Must be a number / संख्या होनी चाहिए"}).min(0).int().optional().nullable(),
  activityDate: z.string().min(1, "Date is required / दिनांक आवश्यक है"),
  activityTime: z.string().min(1, "Time is required / समय आवश्यक है"),
  latitude: z.string()
    .min(1, "Latitude is required / अक्षांश आवश्यक है")
    .regex(/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?)$/, "Invalid latitude (e.g., 23.4536) / अमान्य अक्षांश (उदा. 23.4536)"),
  longitude: z.string()
    .min(1, "Longitude is required / देशांतर आवश्यक है")
    .regex(/^[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/, "Invalid longitude (e.g., 81.4763) / अमान्य देशांतर (उदा. 81.4763)"),
  headingTowards: z.string().optional(),
  localName: z.string().optional(),
  identificationMarks: z.string().optional(),
  reporterName: z.string().min(1, "Your name is required / आपका नाम आवश्यक है"),
  reporterMobile: z.string()
    .min(1, "Mobile number is required / मोबाइल नंबर आवश्यक है")
    .regex(/^\d{10}$/, "Invalid mobile (10 digits) / अमान्य मोबाइल (10 अंक)"),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

const landTypes = [
  { id: "RF", label: "RF" },
  { id: "PF", label: "PF" },
  { id: "ORANGE", label: "ORANGE" },
  { id: "REVENUE", label: "REVENUE" },
  { id: "OTHER", label: "OTHER / अन्य" },
];

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

export function ReportForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      email: "",
      divisionName: "",
      rangeName: "",
      beatName: "",
      compartmentNo: "",
      damageDescription: "",
      totalElephants: 0,
      maleElephants: null,
      femaleElephants: null,
      unknownElephants: null,
      activityDate: new Date().toISOString().split('T')[0],
      activityTime: new Date().toTimeString().split(' ')[0].substring(0,5),
      latitude: "",
      longitude: "",
      headingTowards: "",
      localName: "",
      identificationMarks: "",
      reporterName: "",
      reporterMobile: "",
    },
  });

  async function onSubmit(data: ReportFormValues) {
    setIsSubmitting(true);
    toast.info("Submitting report... / रिपोर्ट सबमिट हो रही है...");
    console.log("Form data:", data);

    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call

    toast.success("Report submitted successfully! (Simulated) / रिपोर्ट सफलतापूर्वक सबमिट की गई! (सिम्युलेटेड)");
    form.reset();
    setIsSubmitting(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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

        <FormField
          control={form.control}
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
          control={form.control}
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

        <FormField
          control={form.control}
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
            control={form.control}
            name="maleElephants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>8) नर हाथी की संख्या?</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1 / उदा. 1" {...field} 
                    onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                    value={field.value === null ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="femaleElephants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>9) मादा हाथी की संख्या?</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 3 / उदा. 3" {...field} 
                    onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                    value={field.value === null ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unknownElephants"
            render={({ field }) => (
              <FormItem>
                <FormLabel>10) अज्ञात हाथी की संख्या?</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1 / उदा. 1" {...field} 
                    onChange={event => field.onChange(event.target.value === '' ? null : +event.target.value)}
                    value={field.value === null ? '' : field.value}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
            control={form.control}
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
        
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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

        <FormField
          control={form.control}
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
          control={form.control}
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
        
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Submitting... / सबमिट हो रहा है..." : "Submit Report / रिपोर्ट सबमिट करें"}
        </Button>
      </form>
    </Form>
  );
}