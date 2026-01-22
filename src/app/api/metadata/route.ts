import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  const { videoId, title, description, tags } = await request.json()

  if (!videoId) {
    return NextResponse.json(
      { error: "Missing videoId" },
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
      { error: "Metadata store not found" },
      { status: 404 }
    )
  }

  const videos = JSON.parse(
    fs.readFileSync(metadataPath, "utf-8")
  )

  if (!videos[videoId]) {
    return NextResponse.json(
      { error: "Video not found" },
      { status: 404 }
    )
  }

  videos[videoId].title = title || ""
  videos[videoId].description = description || ""
  videos[videoId].tags = Array.isArray(tags) ? tags : []

  fs.writeFileSync(
    metadataPath,
    JSON.stringify(videos, null, 2)
  )

  return NextResponse.json({ success: true })
}
