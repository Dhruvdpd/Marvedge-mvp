import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: Request) {
  const { videoId, startTime, endTime } = await request.json()

  if (
    !videoId ||
    typeof startTime !== "number" ||
    typeof endTime !== "number"
  ) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    )
  }

  // RAW video path (must be inside public/)
  const inputPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "raw",
    `${videoId}.webm`
  )

  if (!fs.existsSync(inputPath)) {
    return NextResponse.json(
      { error: "Source video not found" },
      { status: 404 }
    )
  }

  const trimmedVideoId = randomUUID()

  // OUTPUT path (inside public/)
  const outputDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "trimmed"
  )

  const outputPath = path.join(
    outputDir,
    `${trimmedVideoId}.webm`
  )

  fs.mkdirSync(outputDir, { recursive: true })

  const ffmpegCommand =
    `ffmpeg -i "${inputPath}" -ss ${startTime} -to ${endTime} -c copy "${outputPath}"`

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })

  // Metadata persistence
  const metadataPath = path.join(
    process.cwd(),
    "data",
    "videos.json"
  )

  fs.mkdirSync(path.dirname(metadataPath), { recursive: true })

  let videos: any = {}

  if (fs.existsSync(metadataPath)) {
    videos = JSON.parse(fs.readFileSync(metadataPath, "utf-8"))
  }

  videos[trimmedVideoId] = {
    id: trimmedVideoId,
    filePath: `/uploads/trimmed/${trimmedVideoId}.webm`,
    viewCount: 0,
    completionSum: 0,
    duration: endTime - startTime,
    createdAt: new Date().toISOString()
  }

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(videos, null, 2)
  )

  return NextResponse.json({ trimmedVideoId })
}
