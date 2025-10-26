import { writable } from 'svelte/store';
import { LocalStorageAdapter } from '$lib/storage/local';
import { RemoteStorageAdapter } from '$lib/storage/remote';
import type { StorageAdapter, CoffeeBag, EspressoShot } from '$lib/storage/interfaces';

class StorageService {
    private adapter: StorageAdapter;
    private localAdapter: LocalStorageAdapter;
    private remoteAdapter?: RemoteStorageAdapter;

    // Reactive stores
    public coffeeBags = writable<CoffeeBag[]>([]);
    public espressoShots = writable<EspressoShot[]>([]);

    constructor() {
        this.localAdapter = new LocalStorageAdapter();
        this.adapter = this.localAdapter; // Start with local
        this.loadData();
    }

    // Switch to remote storage (when user creates account)
    async enableRemoteStorage(apiUrl: string, token: string) {
        this.remoteAdapter = new RemoteStorageAdapter(apiUrl, token);

        // Migrate local data to remote
        await this.migrateToRemote();

        this.adapter = this.remoteAdapter;
        await this.loadData();
    }

    // Switch back to local (offline mode)
    useLocalStorage() {
        this.adapter = this.localAdapter;
    }

    private async migrateToRemote() {
        if (!this.remoteAdapter) return;

        const localBags = await this.localAdapter.listCoffeeBags();
        const localShots = await this.localAdapter.listEspressoShots();

        // Upload all local data
        for (const bag of localBags) {
            await this.remoteAdapter.createCoffeeBag(bag);
        }

        for (const shot of localShots) {
            await this.remoteAdapter.createEspressoShot(shot);
        }
    }

    // Public API - delegates to current adapter
    async createCoffeeBag(bagData: Omit<CoffeeBag, 'id' | 'createdAt' | 'updatedAt'>) {
        const bag = await this.adapter.createCoffeeBag(bagData);

        // Update store
        this.coffeeBags.update(bags => [...bags, bag]);

        return bag;
    }

    // ...delegate other methods

    private async loadData() {
        const bags = await this.adapter.listCoffeeBags();
        const shots = await this.adapter.listEspressoShots();

        this.coffeeBags.set(bags);
        this.espressoShots.set(shots);
    }
}

export const storageService = new StorageService();