import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
    processAndUploadImage,
    isValidImageType,
    isValidImageSize,
} from '$lib/server/images';
import { getSubscription } from '$lib/server/stripe';

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const sub = await getSubscription(locals.user.id);
    if (sub?.status !== 'active') {
        throw error(403, 'Active subscription required');
    }

    const userId = locals.user.id;
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entityType = formData.get('entityType') as string | null;
    const entityId = formData.get('entityId') as string | null;

    if (!file) throw error(400, 'No file provided');
    if (!entityType || !['bags', 'brews'].includes(entityType)) {
        throw error(400, 'Invalid entityType (must be "bags" or "brews")');
    }
    if (!entityId) throw error(400, 'No entityId provided');

    if (!isValidImageType(file)) throw error(400, 'Invalid file type');
    if (!isValidImageSize(file)) throw error(400, 'File too large (max 20MB)');

    const keyPrefix = `${userId}/${entityType}/${entityId}`;
    const result = await processAndUploadImage(file, keyPrefix);

    if (!result.success) {
        throw error(500, `Upload failed: ${result.error}`);
    }

    const thumbnailUrl = result.images!.thumbnail.url;
    const fullUrl = result.images!.full.url;

    return json({ success: true, thumbnailUrl, fullUrl });
};
