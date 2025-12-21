import {
    USE_GRINDER_UNIT,
    GRINDER_MAX,
    PRESSURE_MAX,
    USE_PRESSURE_UNIT,
} from '$lib/settings';
import { z } from 'zod';

export const coffeeBagSchema = z.object({
    id: z.string().optional(),
    dateRoasted: z.date().optional(),
    dateOpened: z.date().optional(),
    name: z.string().min(1, 'Coffee name is required'),
    roasterName: z.string().min(1, 'Roaster name is required'),
    style: z.string().optional(),
    notes: z.string().optional(),
    picture: z.union([z.instanceof(Blob), z.url()]).optional(),
});

export const coffeeBrewSchema = z.object({
    id: z.string().optional(),
    coffeeBagId: z.string().min(1, 'Coffee bag is required'),
    grindSetting: z
        .number()
        .min(0, 'Must be 0 or greater')
        .max(USE_GRINDER_UNIT ? GRINDER_MAX : 100),
    dryWeight: z.number().min(0, 'Must be 0 or greater'),
    brewTime: z.number().min(0, 'Must be 0 or greater'),
    pressureReading: z
        .number()
        .min(0, 'Must be 0 or greater')
        .max(USE_PRESSURE_UNIT ? PRESSURE_MAX : 100),
    notes: z.string().optional(),
    picture: z.union([z.instanceof(Blob), z.url()]).optional(),
});

export type CoffeeBagFormData = z.infer<typeof coffeeBagSchema>;
export type CoffeeBrewFormData = z.infer<typeof coffeeBrewSchema>;
