import { z } from "zod";

export const coffeeBagSchema = z.object({
  id: z.string().optional(),
  dateRoasted: z.date({ message: "Roast date is required" }),
  dateOpened: z.date({ message: "Open date is required" }),
  name: z.string().min(1, "Coffee name is required"),
  roasterName: z.string().min(1, "Roaster name is required"),
  style: z.string().min(1, "Style is required"),
  notes: z.string().default(""),
  picture: z.union([z.instanceof(Blob), z.string().url()]).optional(),
});

export const coffeeBrewSchema = z.object({
  id: z.string().optional(),
  coffeeBagId: z.string().min(1, "Coffee bag is required"),
  grinderCoarseness: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(100, "Must be 100 or less"),
  grinderTime: z.number().min(0, "Must be 0 or greater"),
  dryWeight: z.number().min(0, "Must be 0 or greater"),
  brewTime: z.number().min(0, "Must be 0 or greater"),
  pressureReading: z
    .number()
    .min(0, "Must be 0 or greater")
    .max(15, "Must be 15 bar or less"),
  notes: z.string().optional(),
  picture: z.union([z.instanceof(Blob), z.string().url()]).optional(),
});

export type CoffeeBagFormData = z.infer<typeof coffeeBagSchema>;
export type CoffeeBrewFormData = z.infer<typeof coffeeBrewSchema>;
