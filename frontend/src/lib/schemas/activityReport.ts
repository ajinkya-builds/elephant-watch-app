import { z } from "zod";

// Base fields that are common across all reports
const baseReportSchema = z.object({
  // Core fields
  id: z.string().uuid().optional(),
  user_id: z.string().uuid(),
  status: z.enum(['draft', 'submitted', 'synced', 'error']).default('draft'),
  created_at: z.date().or(z.string()).transform(val => val instanceof Date ? val : new Date(val)).optional(),
  updated_at: z.date().or(z.string()).transform(val => val instanceof Date ? val : new Date(val)).optional(),
  
  // Location and timing
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
  
  // Observation details
  observation_type: z.enum(['direct', 'indirect', 'loss']),
  compass_bearing: z.number().min(0).max(360).optional(),
  photo_url: z.string().url().optional(),
  
  // Sync and metadata
  is_offline: z.boolean().default(false),
  synced_at: z.date().or(z.string()).transform(val => val ? (val instanceof Date ? val : new Date(val)) : undefined).optional(),
  sync_error: z.string().optional()
});

// Step 1: Date/Time and Location Schema
export const dateTimeLocationSchema = baseReportSchema.pick({
  activity_date: true,
  activity_time: true,
  latitude: true,
  longitude: true
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

// Create a merged schema for the complete activity report
const mergedSchema = baseReportSchema.merge(z.object({
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
  ]).optional()
}));

// Add compass bearing and photo fields
const schemaWithCompassAndPhoto = mergedSchema.merge(compassBearingSchema).merge(photoSchema);

// Complete Activity Report Schema with validation
export const activityReportSchema = schemaWithCompassAndPhoto.refine(
  (data) => {
    if (data.observation_type === 'direct') {
      if (data.total_elephants === undefined) return false;
      const sum = (data.male_elephants || 0) + 
                  (data.female_elephants || 0) + 
                  (data.unknown_elephants || 0) + 
                  (data.calves || 0);
      return data.total_elephants === sum;
    }
    return true;
  },
  {
    message: 'Sum of individual elephants must match total elephants',
    path: ['total_elephants']
  }
);

export type ActivityReport = z.infer<typeof activityReportSchema>;

// Type for form data (all fields optional for progressive enhancement)
export type ActivityReportFormData = Partial<Omit<ActivityReport, 'id' | 'created_at' | 'updated_at' | 'status'>>; // Removed distance, distance_unit, description

// Export individual step schemas for component validation
export const stepSchemas = {
  dateTimeLocation: dateTimeLocationSchema,
  observationType: observationTypeSchema,
  compassBearing: compassBearingSchema,
  photo: photoSchema,
} as const;