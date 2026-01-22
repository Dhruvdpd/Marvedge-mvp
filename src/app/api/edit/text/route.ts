import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

function escapeText(text: string) {
  return text.replace(/:/g, "\\:").replace(/'/g, "\\'")
}

export async function POST(request: Request) {
  const { videoId, text, start, end } = await request.json()

  if (!videoId || !text) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
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
    `${videoId}-text.mp4`
  )

  const safeText = escapeText(text)
  const fontPath = "C\\:/Windows/Fonts/arial.ttf"

  const ffmpegCommand = `
    ffmpeg -y
    -analyzeduration 200M
    -probesize 200M
    -i "${inputPath}"
    -vf "format=yuv420p,drawtext=fontfile='${fontPath}':text='${safeText}':x=20:y=20:enable='between(t,${start},${end})'"
    -c:v libx264
    -pix_fmt yuv420p
    -movflags +faststart
    -c:a aac
    "${outputPath}"
  `.replace(/\n/g, " ")

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (err) => {
      if (err) reject(err)
      else resolve()
    })
  })

  return NextResponse.json({
    editedUrl: `/uploads/edited/${videoId}-text.mp4`
  })
}
