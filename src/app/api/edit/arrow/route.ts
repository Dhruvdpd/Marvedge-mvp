import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: Request) {
  const { videoId, x1, y1, x2, y2, start, end } = await request.json()

  if (!videoId || typeof x1 !== "number" || typeof y1 !== "number" || typeof x2 !== "number" || typeof y2 !== "number") {
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
    `${videoId}-arrow.webm`
  )

  // Calculate arrow properties
  const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  const angle = Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI)

  // Create arrow using drawbox and drawtext for arrowhead
  // This is a simplified arrow - for production, you'd want to use a pre-made arrow image overlay
  const timeCondition = start !== undefined && end !== undefined 
    ? `:enable='between(t,${start},${end})'`
    : ""

  // Draw a thick line and a simple arrowhead
  const ffmpegCommand = `
    ffmpeg -y -i "${inputPath}"
    -vf "drawbox=x=${x1}:y=${y1}:w=${Math.round(length)}:h=5:color=red@0.8:t=fill${timeCondition},
         drawbox=x=${x2-10}:y=${y2-10}:w=20:h=20:color=red@0.8:t=fill${timeCondition}"
    -c:v libvpx-vp9 -c:a copy "${outputPath}"
  `.replace(/\n/g, " ")

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (err, stdout, stderr) => {
      console.log("ARROW STDOUT:", stdout)
      console.error("ARROW STDERR:", stderr)
      
      if (err) {
        console.error("Arrow error:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })

  return NextResponse.json({
    editedUrl: `/uploads/edited/${videoId}-arrow.webm`,
    message: "Arrow added successfully"
  })
}