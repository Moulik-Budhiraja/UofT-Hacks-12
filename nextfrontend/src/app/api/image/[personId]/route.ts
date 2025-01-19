import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const imageDir = path.join(
      process.cwd(),
      "..",
      "video",
      "faces",
      (await params).personId
    );
    const files = await fs.readdir(imageDir);

    // Filter for jpg files and select a random one
    const jpgFiles = files.filter((file) => file.endsWith(".jpg"));
    if (jpgFiles.length === 0) {
      return NextResponse.json({ error: "No images found" }, { status: 404 });
    }

    const randomImage = jpgFiles[0];
    const imagePath = path.join(imageDir, randomImage);
    const imageBuffer = await fs.readFile(imagePath);

    const headers = new Headers();
    headers.set("Content-Type", "image/jpeg");

    return new NextResponse(imageBuffer, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
