import { NextResponse } from "next/server"
import { randomUUID } from "crypto"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  const formData = await request.formData()
  const file = formData.get("video") as File | null

  if (!file) {
    return NextResponse.json(
      { error: "No video file provided" },
      { status: 400 }
    )
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const videoId = randomUUID()

  const uploadDir = path.join(process.cwd(), "public", "uploads", "raw")

  const filePath = path.join(uploadDir, `${videoId}.webm`)

  fs.mkdirSync(uploadDir, { recursive: true })
  fs.writeFileSync(filePath, buffer)

  return NextResponse.json({
    videoId
  })
}
