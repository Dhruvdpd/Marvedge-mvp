import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: Request) {
  const { videoId, x, y, width, height, start, end } = await request.json()

  if (!videoId || typeof x !== "number" || typeof y !== "number" || typeof width !== "number" || typeof height !== "number") {
    return NextResponse.json({ error: "Missing or invalid parameters" }, { status: 400 })
  }

  const inputPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "trimmed",
    `${videoId}.webm`
  )

  if (!fs.existsSync(inputPath)) {
    return NextResponse.json({ error: "Video not found" }, { status: 404 })
  }

  const outputDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "edited"
  )

  fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(
    outputDir,
    `${videoId}-blur.webm`
  )

  // FFmpeg filter to blur a specific region
  // boxblur filter with enable parameter for time range
  const timeCondition = start !== undefined && end !== undefined 
    ? `:enable='between(t,${start},${end})'`
    : ""

  const ffmpegCommand = `
    ffmpeg -y -i "${inputPath}"
    -filter_complex "[0:v]crop=${width}:${height}:${x}:${y},boxblur=10${timeCondition}[blurred];[0:v][blurred]overlay=${x}:${y}${timeCondition}"
    -c:v libvpx-vp9 -c:a copy "${outputPath}"
  `.replace(/\n/g, " ")

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (err, stdout, stderr) => {
      console.log("BLUR STDOUT:", stdout)
      console.error("BLUR STDERR:", stderr)
      
      if (err) {
        console.error("Blur error:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })

  return NextResponse.json({
    editedUrl: `/uploads/edited/${videoId}-blur.webm`,
    message: "Blur applied successfully"
  })
}