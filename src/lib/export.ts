import type { CoffeeBag, CoffeeBrew } from '$lib/storage/interfaces';

export function exportDataLocally(
    bags: CoffeeBag[],
    brews: CoffeeBrew[]
): void {
    const brewsByBag = new Map<string, CoffeeBrew[]>();
    for (const brew of brews) {
        const list = brewsByBag.get(brew.coffeeBagId) ?? [];
        list.push(brew);
        brewsByBag.set(brew.coffeeBagId, list);
    }

    const exported = {
        exportedAt: new Date().toISOString(),
        coffeeBags: bags.map((bag) => ({
            id: bag.id,
            name: bag.name,
            roasterName: bag.roasterName,
            style: bag.style,
            notes: bag.notes,
            dateRoasted: bag.dateRoasted?.toISOString() ?? null,
            dateOpened: bag.dateOpened?.toISOString() ?? null,
            createdAt: bag.createdAt.toISOString(),
            updatedAt: bag.updatedAt.toISOString(),
            brews: (brewsByBag.get(bag.id) ?? []).map((brew) => ({
                id: brew.id,
                grindSetting: brew.grindSetting,
                dryWeight: brew.dryWeight,
                brewTime: brew.brewTime,
                pressureReading: brew.pressureReading,
                notes: brew.notes,
                createdAt: brew.createdAt.toISOString(),
                updatedAt: brew.updatedAt.toISOString(),
            })),
        })),
    };

    const blob = new Blob([JSON.stringify(exported, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dial-in-export.json';
    a.click();
    URL.revokeObjectURL(url);
}
