import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: Request) {
  const { videoId } = await request.json()

  if (!videoId) {
    return NextResponse.json(
      { error: "Missing videoId" },
      { status: 400 }
    )
  }

  const inputPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "trimmed",
    `${videoId}.webm`
  )

  if (!fs.existsSync(inputPath)) {
    return NextResponse.json(
      { error: "Source video not found" },
      { status: 404 }
    )
  }

  const outputDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "exports"
  )

  fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(
    outputDir,
    `${videoId}.mp4`
  )

  const ffmpegCommand =
    `ffmpeg -y -i "${inputPath}" -c:v libx264 -c:a aac "${outputPath}"`

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (error) => {
      if (error) reject(error)
      else resolve()
    })
  })

  return NextResponse.json({
    mp4Url: `/uploads/exports/${videoId}.mp4`
  })
}
