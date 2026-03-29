/**
 * S3 client configuration and utilities for object storage
 */

import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
    type PutObjectCommandInput,
} from '@aws-sdk/client-s3';

import { env } from '$env/dynamic/private';

const OBJECT_STORAGE_URL = env.OBJECT_STORAGE_BUCKET_URL!;
const OBJECT_STORAGE_ACCESS_KEY = env.OBJECT_STORAGE_ACCESS_KEY!;
const OBJECT_STORAGE_SECRET_KEY = env.OBJECT_STORAGE_SECRET_KEY!;
const BUCKET_NAME = env.S3_BUCKET_NAME!;

const S3_ENDPOINT = `https://${OBJECT_STORAGE_URL}/`;

const s3Client = new S3Client({
    endpoint: S3_ENDPOINT,
    region: 'auto',
    credentials: {
        accessKeyId: OBJECT_STORAGE_ACCESS_KEY,
        secretAccessKey: OBJECT_STORAGE_SECRET_KEY,
    },
    forcePathStyle: true,
});

export interface UploadResult {
    success: boolean;
    key?: string;
    url?: string;
    error?: string;
}

/**
 * Generate a unique key for uploaded files
 */
function generateFileKey(filename: string, prefix = 'images'): string {
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().slice(0, 8);
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `${prefix}/${timestamp}-${randomId}-${sanitizedFilename}`;
}

/**
 * Get the content type based on file extension
 */
function getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    const contentTypes: Record<string, string> = {
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        png: 'image/png',
        gif: 'image/gif',
        webp: 'image/webp',
        svg: 'image/svg+xml',
        avif: 'image/avif',
    };
    return contentTypes[ext || ''] || 'application/octet-stream';
}

/**
 * Upload a file to S3
 */
export async function uploadFile(
    file: File,
    options: { prefix?: string; customKey?: string } = {}
): Promise<UploadResult> {
    try {
        const key =
            options.customKey || generateFileKey(file.name, options.prefix);
        const contentType = getContentType(file.name);

        const arrayBuffer = await file.arrayBuffer();
        const buffer = new Uint8Array(arrayBuffer);

        const params: PutObjectCommandInput = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
        };

        await s3Client.send(new PutObjectCommand(params));

        const url = `https://${BUCKET_NAME}.${OBJECT_STORAGE_URL}/${key}`;

        return { success: true, key, url };
    } catch (error) {
        console.error('S3 upload error:', error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Unknown upload error',
        };
    }
}

/**
 * Upload a buffer directly to S3
 */
export async function uploadBuffer(
    buffer: Buffer | Uint8Array,
    filename: string,
    options: { prefix?: string; customKey?: string; contentType?: string } = {}
): Promise<UploadResult> {
    try {
        const key =
            options.customKey || generateFileKey(filename, options.prefix);
        const contentType = options.contentType || getContentType(filename);

        const params: PutObjectCommandInput = {
            Bucket: BUCKET_NAME,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ACL: 'public-read',
        };

        await s3Client.send(new PutObjectCommand(params));

        const url = `https://${BUCKET_NAME}.${OBJECT_STORAGE_URL}/${key}`;

        return { success: true, key, url };
    } catch (error) {
        console.error('S3 upload error:', error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Unknown upload error',
        };
    }
}

/**
 * Delete a file from S3
 */
export async function deleteFile(
    key: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })
        );

        return { success: true };
    } catch (error) {
        console.error('S3 delete error:', error);
        return {
            success: false,
            error:
                error instanceof Error ? error.message : 'Unknown delete error',
        };
    }
}

/**
 * Get a file from S3 (for server-side processing)
 */
export async function getFile(
    key: string
): Promise<{ success: boolean; data?: Uint8Array; error?: string }> {
    try {
        const response = await s3Client.send(
            new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: key,
            })
        );

        const data = await response.Body?.transformToByteArray();
        if (!data) {
            return { success: false, error: 'No data received' };
        }

        return { success: true, data };
    } catch (error) {
        console.error('S3 get error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown get error',
        };
    }
}

export { s3Client, BUCKET_NAME, OBJECT_STORAGE_URL };
