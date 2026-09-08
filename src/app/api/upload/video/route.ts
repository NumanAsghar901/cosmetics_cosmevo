import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/videos directory exists
    const uploadDir = path.join(process.cwd(), 'public', 'videos');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clean filename
    const ext = path.extname(file.name) || '.mp4';
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 40);
    const uniqueName = `video_${Date.now()}_${baseName}${ext}`;
    const filePath = path.join(uploadDir, uniqueName);

    // Save file locally
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/videos/${uniqueName}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: uniqueName,
    });
  } catch (error: any) {
    console.error('Error handling video upload:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video file' },
      { status: 500 }
    );
  }
}
