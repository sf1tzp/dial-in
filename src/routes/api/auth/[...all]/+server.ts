import { auth } from '$lib/server/auth';
import type { RequestHandler } from './$types';

const handleRequest: RequestHandler = async ({ request }) => {
    return auth.handler(request);
};

export const GET = handleRequest;
export const POST = handleRequest;
