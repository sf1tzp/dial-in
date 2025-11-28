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

export interface EspressoShot {
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

export interface StorageAdapter {
    // Coffee Bags
    createCoffeeBag(bag: Omit<CoffeeBag, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoffeeBag>;
    getCoffeeBag(id: string): Promise<CoffeeBag | null>;
    // updateCoffeeBag(id: string, updates: Partial<CoffeeBag>): Promise<CoffeeBag>;
    // deleteCoffeeBag(id: string): Promise<void>;
    // listCoffeeBags(): Promise<CoffeeBag[]>;
    //
    // // Espresso Shots
    // createEspressoShot(shot: Omit<EspressoShot, 'id' | 'createdAt' | 'updatedAt'>): Promise<EspressoShot>;
    // getEspressoShot(id: string): Promise<EspressoShot | null>;
    // updateEspressoShot(id: string, updates: Partial<EspressoShot>): Promise<EspressoShot>;
    // deleteEspressoShot(id: string): Promise<void>;
    // listEspressoShots(coffeeBagId?: string): Promise<EspressoShot[]>;
    //
    // // Sync capabilities
    // isOnline(): boolean;
    // sync?(): Promise<void>;
}