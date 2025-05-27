import { z } from "zod";

// Step 1: Date/Time and Location Schema
export const dateTimeLocationSchema = z.object({
  activity_date: z.union([z.date(), z.string()]).transform(val => 
    val instanceof Date ? val : new Date(val)
  ),
  activity_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:MM)"),
  latitude: z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -90 && num <= 90;
    }, "Invalid latitude (-90 to 90)"),
  longitude: z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= -180 && num <= 180;
    }, "Invalid longitude (-180 to 180)"),
});

// Step 2: Observation Type Schema
export const observationTypeSchema = z.object({
  observation_type: z.enum(['direct', 'indirect', 'loss']).optional(),
  // Direct sighting fields
  total_elephants: z.number().int().min(0).optional(),
  male_elephants: z.number().int().min(0).optional(),
  female_elephants: z.number().int().min(0).optional(),
  unknown_elephants: z.number().int().min(0).optional(),
  calves: z.number().int().min(0).optional(),
  // Indirect sighting fields
  indirect_sighting_type: z.enum([
    'Pugmark',
    'Dung',
    'Broken Branches',
    'Sound',
    'Eyewitness'
  ]).optional(),
  // Loss report fields
  loss_type: z.enum([
    'No loss',
    'crop',
    'livestock',
    'property',
    'fencing',
    'solar panels',
    'FD establishment',
    'Other'
  ]).optional(),
}).superRefine((data, ctx) => {
  if (!data.observation_type) return; // Skip validation if type not selected yet

  if (data.observation_type === 'direct') {
    if (data.total_elephants !== undefined) {
      const sum = (data.male_elephants || 0) + 
                  (data.female_elephants || 0) + 
                  (data.unknown_elephants || 0) + 
                  (data.calves || 0);
      if (data.total_elephants !== sum) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Sum of elephants must equal total elephants",
          path: ["total_elephants"],
        });
      }
    }
  }
});

// Step 3: Compass Bearing Schema
export const compassBearingSchema = z.object({
  compass_bearing: z.number().min(0).max(360),
});

// Step 4: Photo Schema
export const photoSchema = z.object({
  photo_url: z.string().url().optional(),
});

// Complete Activity Report Schema
export const activityReportSchema = z.object({
  ...dateTimeLocationSchema.shape,
  observation_type: z.enum(['direct', 'indirect', 'loss']),
  // Direct sighting fields
  total_elephants: z.number().int().min(0).optional(),
  male_elephants: z.number().int().min(0).optional(),
  female_elephants: z.number().int().min(0).optional(),
  unknown_elephants: z.number().int().min(0).optional(),
  calves: z.number().int().min(0).optional(),
  // Indirect sighting fields
  indirect_sighting_type: z.enum([
    'Pugmark',
    'Dung',
    'Broken Branches',
    'Sound',
    'Eyewitness'
  ]).optional(),
  // Loss report fields
  loss_type: z.enum([
    'No loss',
    'crop',
    'livestock',
    'property',
    'fencing',
    'solar panels',
    'FD establishment',
    'Other'
  ]).optional(),
  ...compassBearingSchema.shape,
  ...photoSchema.shape,
  user_id: z.string().uuid(),
}).refine(
  (data) => {
    if (data.observation_type === 'direct') {
      if (!data.total_elephants) return false;
      const sum = (data.male_elephants || 0) + 
                  (data.female_elephants || 0) + 
                  (data.unknown_elephants || 0) + 
                  (data.calves || 0);
      return data.total_elephants === sum;
    }
    if (data.observation_type === 'indirect') {
      return !!data.indirect_sighting_type;
    }
    if (data.observation_type === 'loss') {
      return !!data.loss_type;
    }
    return false;
  },
  {
    message: "Invalid data for the selected observation type",
  }
);

export type ActivityReport = z.infer<typeof activityReportSchema>;

// Export individual step schemas for component validation
export const stepSchemas = {
  dateTimeLocation: dateTimeLocationSchema,
  observationType: observationTypeSchema,
  compassBearing: compassBearingSchema,
  photo: photoSchema,
} as const; 