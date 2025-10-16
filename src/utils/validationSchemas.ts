/**
 * Comprehensive validation schemas using Zod
 * Protects against XSS, injection, and data corruption
 */

import { z } from 'zod';

// Race time validation: MM:SS or HH:MM:SS format
const raceTimeRegex = /^\d{1,2}:\d{2}(:\d{2})?$/;

// Name validation: letters, spaces, hyphens, apostrophes only
const nameRegex = /^[a-zA-Z\s\-']+$/;

// Email validation with proper format
export const emailSchema = z.string()
  .trim()
  .email({ message: "Invalid email format" })
  .max(255, "Email must be less than 255 characters");

// Name fields validation
export const nameSchema = z.string()
  .trim()
  .min(1, "Name cannot be empty")
  .max(50, "Name must be less than 50 characters")
  .regex(nameRegex, "Name can only contain letters, spaces, hyphens, and apostrophes");

// Age validation
export const ageSchema = z.number()
  .int("Age must be a whole number")
  .min(13, "Must be at least 13 years old")
  .max(120, "Please enter a valid age");

// Height validation (cm)
export const heightSchema = z.number()
  .min(100, "Height must be at least 100 cm")
  .max(250, "Height must be less than 250 cm");

// Weight validation (kg)
export const weightSchema = z.number()
  .min(30, "Weight must be at least 30 kg")
  .max(300, "Weight must be less than 300 kg");

// Weekly mileage validation
export const weeklyMileageSchema = z.number()
  .min(0, "Mileage cannot be negative")
  .max(500, "Please enter a realistic weekly mileage");

// Training days validation
export const trainingDaysSchema = z.number()
  .int("Training days must be a whole number")
  .min(1, "Must train at least 1 day per week")
  .max(7, "Cannot train more than 7 days per week");

// Race time validation
export const raceTimeSchema = z.string()
  .trim()
  .regex(raceTimeRegex, "Race time must be in MM:SS or HH:MM:SS format")
  .refine((time) => {
    const parts = time.split(':');
    if (parts.length === 2) {
      const [min, sec] = parts.map(Number);
      return sec < 60 && min >= 0;
    } else if (parts.length === 3) {
      const [hr, min, sec] = parts.map(Number);
      return sec < 60 && min < 60 && hr >= 0;
    }
    return false;
  }, "Invalid time values");

// Injury history validation (textarea)
export const injuryHistorySchema = z.string()
  .max(2000, "Injury history must be less than 2000 characters")
  .optional();

// Complete runner profile schema
export const profileSchema = z.object({
  first_name: nameSchema,
  last_name: nameSchema,
  email: emailSchema,
  age: ageSchema,
  height_cm: heightSchema,
  weight_kg: weightSchema,
  weekly_mileage: weeklyMileageSchema.optional(),
  training_days: trainingDaysSchema.optional(),
  injury_history: injuryHistorySchema,
  recent_race_time: raceTimeSchema.optional(),
  gender: z.enum(['Male', 'Female', 'Other']).optional(),
  experience_level: z.enum(['Novice', 'Recreational', 'Competitive', 'Elite']).optional(),
  recent_race_distance: z.enum(['5K', '10K', 'Half Marathon', 'Marathon']).optional(),
  race_goal: z.enum(['5K', '10K', 'Half Marathon', 'Marathon']).optional(),
  preferred_unit: z.enum(['mi', 'km']),
  training_intensity_preference: z.enum(['Low', 'Moderate', 'High']).optional(),
  cross_training_preferences: z.array(z.string()).optional(),
  race_date: z.string().optional(),
  training_start_date: z.string().optional(),
});

// Partial profile update schema (all fields optional except email)
export const profileUpdateSchema = profileSchema.partial().extend({
  email: emailSchema,
});

// Lead capture schema
export const leadSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  goal_plan: z.string().trim().min(1, "Please select a goal plan").max(100),
  source: z.string().max(50).default('free-plan'),
});

// Paystack reference validation
export const paystackReferenceSchema = z.string()
  .trim()
  .min(15, "Invalid payment reference")
  .max(50, "Invalid payment reference")
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid payment reference format");

// Paystack plan validation
export const paystackPlanSchema = z.enum(['monthly', 'yearly'], {
  errorMap: () => ({ message: "Plan must be either 'monthly' or 'yearly'" })
});

// Helper to convert numeric strings to numbers for validation
export const parseNumericField = (value: string | undefined): number | undefined => {
  if (!value || value === '') return undefined;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? undefined : parsed;
};

// Helper to sanitize and validate form data
export const validateProfileData = (data: any) => {
  const validated = {
    ...data,
    age: parseNumericField(data.age),
    height_cm: parseNumericField(data.height_cm),
    weight_kg: parseNumericField(data.weight_kg),
    weekly_mileage: parseNumericField(data.weekly_mileage),
    training_days: parseNumericField(data.training_days),
  };

  return profileUpdateSchema.safeParse(validated);
};
