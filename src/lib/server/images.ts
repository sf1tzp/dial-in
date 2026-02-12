/**
 * Image processing utilities using Sharp
 * Handles WebP conversion, resizing, and S3 upload
 *
 * Sizing methodology: display CSS px * target DPR = physical px needed
 *   thumbnail: timeline card icon is 72x72 CSS px (size-18). At 3x DPR = 216px.
 *              300px covers 3x with headroom. Cover fit for square crop.
 *   full:      detail view is ~336px wide (mobile) in aspect-video container.
 *              At 3x DPR = ~1008px. 1200px covers 3x comfortably.
 *              Inside fit preserves full image without cropping.
 */

import sharp from 'sharp';
import { uploadBuffer } from '$lib/server/s3';

const IMAGE_SIZES = {
	thumbnail: { width: 300, height: 300, fit: 'cover' as const },
	full: { width: 1200, height: 1200, fit: 'inside' as const }
} as const;

export type ImageSize = keyof typeof IMAGE_SIZES;

export interface ProcessedImageResult {
	size: string;
	key: string;
	url: string;
	width: number;
	height: number;
}

export interface ImageUploadResult {
	success: boolean;
	images?: Record<string, ProcessedImageResult>;
	error?: string;
}

/**
 * Process an image buffer into WebP format at specified dimensions
 */
async function processImage(
	inputBuffer: Buffer,
	maxWidth: number,
	maxHeight: number,
	fit: 'inside' | 'cover' = 'inside'
): Promise<{ buffer: Buffer; width: number; height: number }> {
	const processed = await sharp(inputBuffer)
		.resize(maxWidth, maxHeight, {
			fit,
			position: 'centre',
			withoutEnlargement: true
		})
		.webp({ quality: 90 })
		.toBuffer({ resolveWithObject: true });

	return {
		buffer: processed.data,
		width: processed.info.width,
		height: processed.info.height
	};
}

/**
 * Process and upload an image file to S3 in all sizes
 * @param file - The uploaded file
 * @param keyPrefix - S3 key prefix (e.g. "{userId}/{entityType}/{entityId}")
 */
export async function processAndUploadImage(
	file: File,
	keyPrefix: string
): Promise<ImageUploadResult> {
	try {
		const arrayBuffer = await file.arrayBuffer();
		const inputBuffer = Buffer.from(arrayBuffer);

		// Process all sizes in parallel
		const sizes = Object.entries(IMAGE_SIZES) as [
			string,
			{ width: number; height: number; fit: 'inside' | 'cover' }
		][];

		const processedImages = await Promise.all(
			sizes.map(async ([size, dimensions]) => {
				const { buffer, width, height } = await processImage(
					inputBuffer,
					dimensions.width,
					dimensions.height,
					dimensions.fit
				);
				return { size, buffer, width, height };
			})
		);

		// Upload all processed images to S3 in parallel
		const uploadResults = await Promise.all(
			processedImages.map(async ({ size, buffer, width, height }) => {
				const key = `${keyPrefix}/${size}.webp`;
				const result = await uploadBuffer(buffer, `${size}.webp`, {
					customKey: key,
					contentType: 'image/webp'
				});

				if (!result.success) {
					throw new Error(`Failed to upload ${size}: ${result.error}`);
				}

				return {
					size,
					key: result.key!,
					url: result.url!,
					width,
					height
				};
			})
		);

		const images = uploadResults.reduce(
			(acc, result) => {
				acc[result.size] = result;
				return acc;
			},
			{} as Record<string, ProcessedImageResult>
		);

		return { success: true, images };
	} catch (error) {
		console.error('Image processing error:', error);
		return {
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error processing image'
		};
	}
}

/**
 * Validate that a file is an allowed image type
 */
export function isValidImageType(file: File): boolean {
	const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
	return allowedTypes.includes(file.type);
}

/**
 * Validate that a file is within size limits
 */
export function isValidImageSize(file: File, maxSizeMB = 20): boolean {
	const maxSize = maxSizeMB * 1024 * 1024;
	return file.size <= maxSize;
}
