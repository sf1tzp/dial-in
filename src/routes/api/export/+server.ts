import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getFullSyncData } from '$lib/server/db/store';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const userId = locals.user.id;

	try {
		const data = await getFullSyncData(userId);

		// Index brews by bagId for nesting
		const brewsByBag = new Map<string, typeof data.coffeeBrews>();
		for (const brew of data.coffeeBrews) {
			const list = brewsByBag.get(brew.coffeeBagId) ?? [];
			list.push(brew);
			brewsByBag.set(brew.coffeeBagId, list);
		}

		const exported = {
			exportedAt: new Date().toISOString(),
			coffeeBags: data.coffeeBags.map((bag) => ({
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

		return new Response(JSON.stringify(exported, null, 2), {
			headers: {
				'Content-Type': 'application/json',
				'Content-Disposition': 'attachment; filename="dial-in-export.json"',
			},
		});
	} catch (err) {
		console.error('Export error:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to export data');
	}
};
