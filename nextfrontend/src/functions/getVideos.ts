"use server";

import { prisma } from "../db";

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

export async function getVideos() {
  // Return a list of all Users that match the name in the directory ../video/interactions
  const interactionsDir = path.join("..", "video", "interactions");
  const folders = await fs.readdir(interactionsDir);

  const users = await prisma.user.findMany({
    where: {
      name: {
        in: folders,
      },
    },
  });

  return users;
}

export async function rateComplete() {
  // Delete all folders in the directory ../video/interactions
  const interactionsDir = path.join("..", "video", "interactions");
  await fs.rmdir(interactionsDir, { recursive: true });
}

export async function rateInteraction(
  ratingUser: string,
  targetUser: string,
  rating: "like" | "dislike"
) {
  const user = await prisma.user.findUnique({
    where: {
      name: ratingUser,
    },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const interaction = await prisma.interaction.create({
    data: {
      pointOutcome: rating === "like" ? 1 : -1,
      initiator: {
        connect: {
          name: ratingUser,
        },
      },
      receiver: {
        connect: {
          name: targetUser,
        },
      },
    },
  });
}
