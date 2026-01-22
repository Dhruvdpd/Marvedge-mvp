import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

function secondsToSrtTime(seconds: number) {
  const hrs = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.floor((seconds % 1) * 1000)

  return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")},${String(ms).padStart(3, "0")}`
}

export async function POST(request: Request) {
  const { videoId } = await request.json()

  if (!videoId) {
    return NextResponse.json({ error: "Missing videoId" }, { status: 400 })
  }

  const audioPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "audio",
    `${videoId}.wav`
  )

  if (!fs.existsSync(audioPath)) {
    return NextResponse.json(
      { error: "Audio not found. Extract audio first." },
      { status: 404 }
    )
  }

  const subtitlesDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "subtitles"
  )

  fs.mkdirSync(subtitlesDir, { recursive: true })

  const transcriptJsonPath = path.join(subtitlesDir, `${videoId}.json`)
  const srtPath = path.join(subtitlesDir, `${videoId}.srt`)

  // 1️⃣ Run Whisper via Python (cross-platform safe)
  const whisperCommand = `
    python -m whisper "${audioPath}"
    --model base
    --output_format json
    --output_dir "${subtitlesDir}"
    --language en
  `.replace(/\n/g, " ")

  await new Promise<void>((resolve, reject) => {
  exec(whisperCommand, (err, stdout, stderr) => {
    console.log("WHISPER STDOUT:", stdout)
    console.error("WHISPER STDERR:", stderr)

    if (err) reject(err)
    else resolve()
  })
})


  // 2️⃣ Read Whisper output
  const transcript = JSON.parse(
    fs.readFileSync(transcriptJsonPath, "utf-8")
  )

  // 3️⃣ Convert to SRT
  let srtContent = ""

  transcript.segments.forEach((segment: any, index: number) => {
    srtContent += `${index + 1}\n`
    srtContent += `${secondsToSrtTime(segment.start)} --> ${secondsToSrtTime(segment.end)}\n`
    srtContent += `${segment.text.trim()}\n\n`
  })

  fs.writeFileSync(srtPath, srtContent)

  return NextResponse.json({
    srtUrl: `/uploads/subtitles/${videoId}.srt`
  })
}
