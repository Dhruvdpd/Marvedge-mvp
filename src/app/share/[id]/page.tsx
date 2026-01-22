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

  // ✅ Increment view count (server-side)
  video.viewCount += 1
  fs.writeFileSync(metadataPath, JSON.stringify(videos, null, 2))

  // ✅ Compute average completion percentage
  const averageCompletion =
    video.viewCount > 0
      ? Math.round((video.completionSum / video.viewCount) * 100)
      : 0

  return (
    <main className="p-8 space-y-6 max-w-4xl">
      {/* Title */}
      <h1 className="text-2xl font-bold">
        {video.title || "Untitled Video"}
      </h1>

      {/* Description */}
      {video.description && (
        <p className="text-gray-700">{video.description}</p>
      )}

      {/* Tags */}
      {video.tags?.length > 0 && (
        <div className="flex gap-2 text-sm text-gray-600">
          {video.tags.map((tag: string) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      )}

      {/* Video player */}
      <VideoPlayer
        videoId={id}
        src={video.filePath}
        duration={video.duration}
      />

      {/* Analytics */}
      <div className="text-sm text-gray-700 space-y-1">
        <p>Views: {video.viewCount}</p>
        <p>Average completion: {averageCompletion}%</p>
      </div>
    </main>
  )
}
