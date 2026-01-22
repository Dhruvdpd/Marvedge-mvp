import { NextResponse } from "next/server"
import { exec } from "child_process"
import path from "path"
import fs from "fs"

export async function POST(request: Request) {
  const { videoId, text, voiceId } = await request.json()

  if (!videoId || !text) {
    return NextResponse.json(
      { error: "Missing videoId or text" },
      { status: 400 }
    )
  }

  // Get ElevenLabs API key from environment
  const apiKey = process.env.ELEVENLABS_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: "ElevenLabs API key not configured. Add ELEVENLABS_API_KEY to your .env file" },
      { status: 500 }
    )
  }

  // Default voice ID (Rachel - natural voice)
  const selectedVoiceId = voiceId || "21m00Tcm4TlvDq8ikWAM"

  // Check if video exists
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
  const voiceoverDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "voiceovers"
  )
  const editedDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "edited"
  )

  fs.mkdirSync(voiceoverDir, { recursive: true })
  fs.mkdirSync(editedDir, { recursive: true })

  const audioPath = path.join(voiceoverDir, `${videoId}.mp3`)
  const outputVideoPath = path.join(editedDir, `${videoId}-voiceover.webm`)

  // Step 1: Generate voiceover using ElevenLabs API
  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`,
      {
        method: "POST",
        headers: {
          "Accept": "audio/mpeg",
          "Content-Type": "application/json",
          "xi-api-key": apiKey
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("ElevenLabs API error:", errorText)
      return NextResponse.json(
        { error: `ElevenLabs API error: ${response.status}` },
        { status: response.status }
      )
    }

    // Save the audio file
    const audioBuffer = Buffer.from(await response.arrayBuffer())
    fs.writeFileSync(audioPath, audioBuffer)

  } catch (error) {
    console.error("Error generating voiceover:", error)
    return NextResponse.json(
      { error: "Failed to generate voiceover" },
      { status: 500 }
    )
  }

  // Step 2: Merge voiceover with video using FFmpeg
  // This replaces the original audio with the AI voiceover
  const ffmpegCommand = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -map 0:v:0 -map 1:a:0 -shortest "${outputVideoPath}"`

  await new Promise<void>((resolve, reject) => {
    exec(ffmpegCommand, (err, stdout, stderr) => {
      console.log("FFMPEG STDOUT:", stdout)
      console.error("FFMPEG STDERR:", stderr)

      if (err) {
        console.error("FFmpeg error:", err)
        reject(err)
      } else {
        resolve()
      }
    })
  })

  return NextResponse.json({
    voiceoverUrl: `/uploads/voiceovers/${videoId}.mp3`,
    videoWithVoiceoverUrl: `/uploads/edited/${videoId}-voiceover.webm`,
    message: "Voiceover generated and merged successfully"
  })
}