import { NextResponse } from 'next/server';
import { deleteCloudinaryAsset, deleteMultipleCloudinaryAssets } from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, urls, public_id, resource_type } = body;

    // 1. If an array of URLs / IDs is passed:
    if (Array.isArray(urls) && urls.length > 0) {
      const results = await deleteMultipleCloudinaryAssets(urls);
      return NextResponse.json({
        success: true,
        results,
      });
    }

    // 2. If a single URL or public_id is passed:
    const target = url || public_id;
    if (!target || typeof target !== 'string') {
      return NextResponse.json(
        { error: 'Missing required parameter: url, urls, or public_id' },
        { status: 400 }
      );
    }

    const result = await deleteCloudinaryAsset(target, resource_type);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error in /api/admin/cloudinary/delete:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
