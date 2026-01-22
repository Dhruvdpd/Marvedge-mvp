import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import VideoPlayer from "./VideoPlayer"

type Props = {
  params: Promise<{ id: string }>
}

export default async function SharePage({ params }: Props) {
  const { id } = await params

  const metadataPath = path.join(process.cwd(), "data", "videos.json")

  if (!fs.existsSync(metadataPath)) {
    notFound()
  }

  const videos = JSON.parse(fs.readFileSync(metadataPath, "utf-8"))
  const video = videos[id]

  if (!video) {
    notFound()
  }

  // Increment view count (server-side)
  video.viewCount += 1
  fs.writeFileSync(metadataPath, JSON.stringify(videos, null, 2))

  return (
    <main className="p-8 space-y-4">
      <h1 className="text-xl font-bold">Shared Video</h1>

      <VideoPlayer
        videoId={id}
        src={video.filePath}
        duration={video.duration}
        />


      <p>Views: {video.viewCount}</p>
    </main>
  )
}
