import fs from "fs"
import path from "path"
import { notFound } from "next/navigation"
import VideoPlayer from "./VideoPlayer"
import { Eye, TrendingUp, Calendar, Tag } from "lucide-react"

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

  // Format date
  const formattedDate = new Date(video.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <main className="max-w-5xl mx-auto p-6 md:p-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-3">
            {video.title || "Untitled Video"}
          </h1>
          
          {video.description && (
            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags?.length > 0 && video.tags.some((tag: string) => tag.trim()) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {video.tags
                .filter((tag: string) => tag.trim())
                .map((tag: string) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
            </div>
          )}

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-6 mt-4 text-sm text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {formattedDate}
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              {video.viewCount} {video.viewCount === 1 ? 'view' : 'views'}
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              {averageCompletion}% avg completion
            </div>
          </div>
        </div>

        {/* Video Player */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <VideoPlayer
            videoId={id}
            src={video.filePath}
            duration={video.duration}
          />
        </div>

        {/* Analytics Section */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Views</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{video.viewCount}</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Avg Completion</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{averageCompletion}%</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">Duration</h3>
            </div>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{video.duration}s</p>
          </div>
        </div>
      </main>
    </div>
  )
}