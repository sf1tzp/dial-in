import { openDB, type IDBPDatabase } from 'idb';
import type { StorageAdapter, CoffeeBag, EspressoShot } from '$lib/storage/interfaces';

export class LocalStorageAdapter implements StorageAdapter {
    private db: Promise<IDBPDatabase>;

    constructor() {
        this.db = openDB('dial-in-storage', 1, {
            upgrade(db) {
                // Coffee bags store
                const bagStore = db.createObjectStore('coffeeBags', { keyPath: 'id' });
                bagStore.createIndex('dateOpened', 'dateOpened');
                bagStore.createIndex('roasterName', 'roasterName');

                // Espresso shots store
                const shotStore = db.createObjectStore('espressoShots', { keyPath: 'id' });
                shotStore.createIndex('coffeeBagId', 'coffeeBagId');
                shotStore.createIndex('createdAt', 'createdAt');

                // Images store (separate for better performance)
                db.createObjectStore('images', { keyPath: 'id' });
            },
        });
    }

    async createCoffeeBag(bagData: Omit<CoffeeBag, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoffeeBag> {
        const db = await this.db;
        const id = crypto.randomUUID();
        const now = new Date();

        const bag: CoffeeBag = {
            ...bagData,
            id,
            createdAt: now,
            updatedAt: now,
        };

        // Store image separately if provided
        if (bagData.picture instanceof Blob) {
            await db.put('images', { id: `bag-${id}`, blob: bagData.picture });
            bag.picture = `bag-${id}`; // Reference to image
        }

        await db.put('coffeeBags', bag);
        return bag;
    }

    async getCoffeeBag(id: string): Promise<CoffeeBag | null> {
        const db = await this.db;
        const bag = await db.get('coffeeBags', id);

        if (!bag) return null;

        // Load image if exists
        if (bag.picture && typeof bag.picture === 'string') {
            const imageData = await db.get('images', bag.picture);
            if (imageData) {
                bag.picture = imageData.blob;
            }
        }

        return bag;
    }

    // ...other CRUD methods

    isOnline(): boolean {
        return navigator.onLine;
    }
}