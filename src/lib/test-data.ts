import type { CoffeeBag, CoffeeBrew } from "./storage/interfaces";

export const testCoffeeBags: CoffeeBag[] = [
  {
    id: "test-bag-1",
    name: "Ethiopian Yirgacheffe",
    roasterName: "Counter Culture",
    style: "Single Origin",
    dateRoasted: new Date("2025-11-20"),
    dateOpened: new Date("2025-11-25"),
    notes: "Bright and fruity with blueberry notes",
    createdAt: new Date("2025-11-25T10:30:00"),
    updatedAt: new Date("2025-11-25T10:30:00"),
  },
  {
    id: "test-bag-2",
    name: "Colombian Supremo",
    roasterName: "Onyx Coffee Lab",
    style: "Single Origin",
    dateRoasted: new Date("2025-11-22"),
    dateOpened: new Date("2025-11-27"),
    notes: "Chocolatey and nutty with caramel sweetness",
    createdAt: new Date("2025-11-27T09:00:00"),
    updatedAt: new Date("2025-11-27T09:00:00"),
  },
];

// Simulating the "dialing in" process over 5 brews
// Starting with a coarser grind and adjusting based on extraction results
export const testCoffeeBrews: CoffeeBrew[] = [
  {
    // Brew 1: Initial attempt - too coarse, fast extraction, sour/under-extracted
    id: "test-brew-1",
    coffeeBagId: "test-bag-1",
    grindSetting: 5,
    dryWeight: 18,
    brewTime: 22,
    pressureReading: 45,
    notes: "Way too fast, sour and thin. Need to go much finer.",
    createdAt: new Date("2025-11-25T11:00:00"),
    updatedAt: new Date("2025-11-25T11:00:00"),
  },
  {
    // Brew 2: Adjusted finer - still a bit fast, slightly better
    id: "test-brew-2",
    coffeeBagId: "test-bag-1",
    grindSetting: 3.5,
    dryWeight: 18,
    brewTime: 28,
    pressureReading: 60,
    notes: "Slightly under-extracted, some sourness remains. Try finer grind.",
    createdAt: new Date("2025-11-26T08:15:00"),
    updatedAt: new Date("2025-11-26T08:15:00"),
  },
  {
    // Brew 3: Went finer - now a bit slow, touching bitter territory
    id: "test-brew-3",
    coffeeBagId: "test-bag-1",
    grindSetting: 2.5,
    dryWeight: 18,
    brewTime: 38,
    pressureReading: 75,
    notes: "Too slow, starting to taste bitter and ashy. Back off a bit.",
    createdAt: new Date("2025-11-26T14:30:00"),
    updatedAt: new Date("2025-11-26T14:30:00"),
  },
  {
    // Brew 4: Split the difference - getting closer
    id: "test-brew-4",
    coffeeBagId: "test-bag-1",
    grindSetting: 3.1,
    dryWeight: 18,
    brewTime: 32,
    pressureReading: 63,
    notes:
      "Much better balance! Slight hint of sourness, could go just a touch finer.",
    createdAt: new Date("2025-11-27T07:45:00"),
    updatedAt: new Date("2025-11-27T07:45:00"),
  },
  {
    // Brew 5: Dialed in! Perfect extraction
    id: "test-brew-5",
    coffeeBagId: "test-bag-1",
    grindSetting: 3.1,
    dryWeight: 18,
    brewTime: 30,
    pressureReading: 60,
    notes:
      "Perfect! Sweet, balanced, blueberry notes coming through. This is the recipe.",
    createdAt: new Date("2025-11-28T08:00:00"),
    updatedAt: new Date("2025-11-28T08:00:00"),
  },
  // Bag 2 brews - Colombian Supremo
  {
    // Brew 1: Initial attempt - a bit coarse
    id: "test-brew-6",
    coffeeBagId: "test-bag-2",
    grindSetting: 4,
    dryWeight: 18,
    brewTime: 25,
    pressureReading: 53,
    notes: "Running fast, under-extracted. Tastes a bit sour and thin.",
    createdAt: new Date("2025-11-27T09:30:00"),
    updatedAt: new Date("2025-11-27T09:30:00"),
  },
  {
    // Brew 2: Adjusted finer
    id: "test-brew-7",
    coffeeBagId: "test-bag-2",
    grindSetting: 3.1,
    dryWeight: 18,
    brewTime: 31,
    pressureReading: 60,
    notes:
      "Better extraction, chocolate notes coming through. Slightly bitter finish.",
    createdAt: new Date("2025-11-27T15:00:00"),
    updatedAt: new Date("2025-11-27T15:00:00"),
  },
  {
    // Brew 3: Dialed in
    id: "test-brew-8",
    coffeeBagId: "test-bag-2",
    grindSetting: 2.9,
    dryWeight: 18,
    brewTime: 28,
    pressureReading: 60,
    notes: "Sweet and balanced! Caramel and chocolate notes, smooth finish.",
    createdAt: new Date("2025-11-28T07:30:00"),
    updatedAt: new Date("2025-11-28T07:30:00"),
  },
];
