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

  // Input video path (trimmed video)
  const videoPath = path.join(
    process.cwd(),
    "public",
    "uploads",
    "trimmed",
    `${videoId}.webm`
  )

  if (!fs.existsSync(videoPath)) {
    return NextResponse.json(
      { error: "Video not found" },
      { status: 404 }
    )
  }

  // Create directories
  const audioDir = path.join(process.cwd(), "public", "uploads", "audio")
  const subtitlesDir = path.join(process.cwd(), "public", "uploads", "subtitles")
  
  fs.mkdirSync(audioDir, { recursive: true })
  fs.mkdirSync(subtitlesDir, { recursive: true })

  const audioPath = path.join(audioDir, `${videoId}.wav`)
  const srtPath = path.join(subtitlesDir, `${videoId}.srt`)

  // Step 1: Extract audio from video using FFmpeg
  const extractAudioCommand = `ffmpeg -y -i "${videoPath}" -vn -acodec pcm_s16le -ar 16000 -ac 1 "${audioPath}"`

  await new Promise<void>((resolve, reject) => {
    exec(extractAudioCommand, (err, stdout, stderr) => {
      console.log("EXTRACT AUDIO STDOUT:", stdout)
      console.error("EXTRACT AUDIO STDERR:", stderr)
      
      if (err) {
        console.error("FFmpeg extraction error:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })

  // Step 2: Run Whisper on the extracted audio
  // Using --model base for faster processing
  // Output format is json which includes timestamps
  const whisperCommand = `whisper "${audioPath}" --model base --output_format json --output_dir "${subtitlesDir}" --language en`

  await new Promise<void>((resolve, reject) => {
    exec(whisperCommand, (err, stdout, stderr) => {
      console.log("WHISPER STDOUT:", stdout)
      console.error("WHISPER STDERR:", stderr)

      if (err) {
        console.error("Whisper error:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })

  // Step 3: Read the Whisper JSON output
  const jsonPath = path.join(subtitlesDir, `${videoId}.json`)
  
  if (!fs.existsSync(jsonPath)) {
    return NextResponse.json(
      { error: "Whisper output not found. Make sure Whisper is installed: pip install openai-whisper" },
      { status: 500 }
    )
  }

  const transcript = JSON.parse(fs.readFileSync(jsonPath, "utf-8"))

  // Step 4: Convert to SRT format
  let srtContent = ""

  if (transcript.segments && Array.isArray(transcript.segments)) {
    transcript.segments.forEach((segment: any, index: number) => {
      srtContent += `${index + 1}\n`
      srtContent += `${secondsToSrtTime(segment.start)} --> ${secondsToSrtTime(segment.end)}\n`
      srtContent += `${segment.text.trim()}\n\n`
    })
  }

  fs.writeFileSync(srtPath, srtContent)

  return NextResponse.json({
    srtUrl: `/uploads/subtitles/${videoId}.srt`,
    message: "Subtitles generated successfully"
  })
}