import type { CoffeeBag } from './storage/interfaces';

/**
 * Returns a disambiguating suffix when multiple bags share the same name and roaster.
 * Empty string if no disambiguation needed.
 */
export function getBagDisambiguator(bag: CoffeeBag, allBags: CoffeeBag[]): string {
	const duplicates = allBags.filter(
		(b) => b.name === bag.name && b.roasterName === bag.roasterName
	);

	if (duplicates.length <= 1) return '';

	if (bag.dateOpened) {
		const formatted = bag.dateOpened.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric'
		});
		return ` (opened ${formatted})`;
	}

	// Fall back to sequence number based on createdAt
	const sorted = [...duplicates].sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
	const index = sorted.findIndex((b) => b.id === bag.id);
	return ` #${index + 1}`;
}

/**
 * Full label: "name - roaster" with optional disambiguation.
 */
export function formatBagLabel(bag: CoffeeBag, allBags: CoffeeBag[]): string {
	return `${bag.name} - ${bag.roasterName}${getBagDisambiguator(bag, allBags)}`;
}
