export interface CoffeeBag {
  id: string;
  dateRoasted: Date;
  dateOpened: Date;
  name: string;
  roasterName: string;
  style: string;
  notes: string;
  picture?: Blob | string; // Blob for local, URL for remote
  createdAt: Date;
  updatedAt: Date;
}

export interface CoffeeBrew {
  id: string;
  coffeeBagId: string;
  grinderCoarseness: number;
  grinderTime: number;
  dryWeight: number;
  brewTime: number;
  pressureReading: number;
  notes?: string;
  picture?: Blob | string;
  createdAt: Date;
  updatedAt: Date;
}
