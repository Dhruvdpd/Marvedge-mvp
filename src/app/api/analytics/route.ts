import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  const { videoId, watchedSeconds } = await request.json()

  if (
    !videoId ||
    typeof watchedSeconds !== "number"
  ) {
    return NextResponse.json(
      { error: "Invalid input" },
      { status: 400 }
    )
  }

  const metadataPath = path.join(
    process.cwd(),
    "data",
    "videos.json"
  )

  if (!fs.existsSync(metadataPath)) {
    return NextResponse.json(
      { error: "Metadata not found" },
      { status: 404 }
    )
  }

  const videos = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  )

  const video = videos[videoId]

  if (!video) {
    return NextResponse.json(
      { error: "Video not found" },
      { status: 404 }
    )
  }

  const completion =
    Math.min(watchedSeconds / video.duration, 1)

  video.completionSum += completion

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(videos, null, 2)
  )

  return NextResponse.json({ success: true })
}
