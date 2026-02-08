// Sync metadata shared by all syncable entities
export interface SyncMetadata {
    deviceId: string;
    syncedAt: Date | null;
    deletedAt: Date | null;
    isDirty: boolean; // True if modified since last sync
}

export interface CoffeeBag extends SyncMetadata {
    id: string;
    dateRoasted: Date | undefined;
    dateOpened: Date | undefined;
    name: string;
    roasterName: string;
    style: string;
    notes: string;
    picture?: Blob | string; // Blob for local, URL for remote
    archivedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}

export interface CoffeeBrew extends SyncMetadata {
    id: string;
    coffeeBagId: string;
    grindSetting: number;
    dryWeight: number;
    brewTime: number;
    pressureReading: number;
    notes?: string;
    picture?: Blob | string;
    createdAt: Date;
    updatedAt: Date;
}
