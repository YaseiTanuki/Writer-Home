import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!image.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      );
    }

    // Validate file size (max 32MB for ImgBB)
    if (image.size > 32 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 32MB' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Upload to ImgBB
    const imgbbFormData = new FormData();
    imgbbFormData.append('image', base64Image);

    const imgbbResponse = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: imgbbFormData,
      }
    );

    if (!imgbbResponse.ok) {
      throw new Error('ImgBB API request failed');
    }

    const imgbbResult = await imgbbResponse.json();

    if (!imgbbResult.success) {
      throw new Error('ImgBB upload failed');
    }

    return NextResponse.json({
      url: imgbbResult.data.url,
      display_url: imgbbResult.data.display_url,
      delete_url: imgbbResult.data.delete_url,
      id: imgbbResult.data.id,
    });
  } catch (error) {
    console.error('Image upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
