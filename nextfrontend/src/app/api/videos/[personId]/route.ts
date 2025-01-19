import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { spawn } from "child_process";

async function getVideoDuration(filepath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const process = spawn("ffprobe", [
      "-v",
      "error",
      "-show_entries",
      "format=duration",
      "-of",
      "default=noprint_wrappers=1:nokey=1",
      filepath,
    ]);

    let output = "";
    process.stdout.on("data", (data) => {
      output += data.toString();
    });

    process.on("close", (code) => {
      if (code !== 0) reject(new Error("Failed to get video duration"));
      resolve(parseFloat(output.trim()));
    });
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ personId: string }> }
) {
  try {
    const videoDir = path.join(
      process.cwd(),
      "..",
      "video",
      "interactions",
      (await params).personId
    );
    const files = await fs.readdir(videoDir);

    let closestVideo = null;
    let closestDiff = Infinity;
    const targetDuration = 5;

    for (const file of files) {
      if (file.endsWith(".mov")) {
        const filepath = path.join(videoDir, file);
        const duration = await getVideoDuration(filepath);
        const diff = Math.abs(duration - targetDuration);

        if (diff < closestDiff) {
          closestDiff = diff;
          closestVideo = filepath;
        }
      }
    }

    if (!closestVideo) {
      return NextResponse.json({ error: "No videos found" }, { status: 404 });
    }

    const videoBuffer = await fs.readFile(closestVideo);
    const headers = new Headers();
    headers.set("Content-Type", "video/quicktime");

    return new NextResponse(videoBuffer, {
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
