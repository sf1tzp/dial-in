import type { StorageAdapter, CoffeeBag, EspressoShot } from '$lib/storage/interfaces';

export class RemoteStorageAdapter implements StorageAdapter {
    private baseUrl: string;
    private token?: string;

    constructor(baseUrl: string, token?: string) {
        this.baseUrl = baseUrl;
        this.token = token;
    }

    async createCoffeeBag(bagData: Omit<CoffeeBag, 'id' | 'createdAt' | 'updatedAt'>): Promise<CoffeeBag> {
        // Handle image upload separately
        let pictureUrl: string | undefined;
        if (bagData.picture instanceof Blob) {
            pictureUrl = await this.uploadImage(bagData.picture);
        }

        const response = await fetch(`${this.baseUrl}/api/coffee-bags`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(this.token && { 'Authorization': `Bearer ${this.token}` })
            },
            body: JSON.stringify({
                ...bagData,
                picture: pictureUrl
            })
        });

        return response.json();
    }

    async getCoffeeBag(id: string): Promise<CoffeeBag | null> {
        console.log("unimplemented!")
        return null
    }

    private async uploadImage(blob: Blob): Promise<string> {
        console.log("unimplemented!")
        return ""
    }

    isOnline(): boolean {
        return navigator.onLine;
    }

    // ...other methods
}