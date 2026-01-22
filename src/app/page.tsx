"use client"

import { useRef, useState } from "react"

type RecordingState = "inactive" | "recording" | "paused"

export default function Home() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])

  const [recordingState, setRecordingState] =
    useState<RecordingState>("inactive")

  const [uploading, setUploading] = useState(false)
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)

  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)
  const [trimmedVideoId, setTrimmedVideoId] = useState<string | null>(null)

  const [mp4Url, setMp4Url] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  // Metadata
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [metadataSaved, setMetadataSaved] = useState(false)

  // Text overlay
  const [overlayText, setOverlayText] = useState("")
  const [overlayStart, setOverlayStart] = useState(0)
  const [overlayEnd, setOverlayEnd] = useState(3)

  // ✅ Subtitles
  const [srtUrl, setSrtUrl] = useState<string | null>(null)
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false)

  async function startRecording() {
    recordedChunksRef.current = []
    setVideoUrl(null)
    setUploadedVideoId(null)
    setTrimmedVideoId(null)
    setMp4Url(null)
    setMetadataSaved(false)
    setSrtUrl(null)

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })

    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    const combinedStream = new MediaStream([
      ...screenStream.getVideoTracks(),
      ...screenStream.getAudioTracks(),
      ...micStream.getAudioTracks()
    ])

    const mediaRecorder = new MediaRecorder(combinedStream, {
      mimeType: "video/webm"
    })

    mediaRecorderRef.current = mediaRecorder

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        recordedChunksRef.current.push(event.data)
      }
    }

    mediaRecorder.onstop = async () => {
      const blob = new Blob(recordedChunksRef.current, {
        type: "video/webm"
      })

      const url = URL.createObjectURL(blob)
      setVideoUrl(url)

      const formData = new FormData()
      formData.append("video", blob, "recording.webm")

      setUploading(true)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData
      })

      const data = await response.json()
      setUploadedVideoId(data.videoId)

      setUploading(false)
    }

    mediaRecorder.start()
    setRecordingState("recording")
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setRecordingState("inactive")
  }

  function pauseRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.pause()
      setRecordingState("paused")
    }
  }

  function resumeRecording() {
    if (mediaRecorderRef.current?.state === "paused") {
      mediaRecorderRef.current.resume()
      setRecordingState("recording")
    }
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Screen Recorder MVP</h1>

      {recordingState === "inactive" && (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Recording
        </button>
      )}

      {recordingState === "recording" && (
        <div className="flex gap-2">
          <button
            onClick={pauseRecording}
            className="px-4 py-2 bg-yellow-500 text-white rounded"
          >
            Pause
          </button>

          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop
          </button>
        </div>
      )}

      {recordingState === "paused" && (
        <div className="flex gap-2">
          <button
            onClick={resumeRecording}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Resume
          </button>

          <button
            onClick={stopRecording}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Stop
          </button>
        </div>
      )}

      {videoUrl && (
        <div className="space-y-4">
          <video src={videoUrl} controls className="w-full max-w-3xl border" />

          {uploading && <p>Uploading video...</p>}

          {uploadedVideoId && (
            <p className="text-green-600">
              Uploaded successfully. Video ID: {uploadedVideoId}
            </p>
          )}

          {uploadedVideoId && (
            <div className="space-y-2">
              <h3 className="font-semibold">Trim Video</h3>

              <div className="flex gap-2">
                <input
                  type="number"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="border px-2 py-1"
                />

                <input
                  type="number"
                  value={endTime}
                  onChange={(e) => setEndTime(Number(e.target.value))}
                  className="border px-2 py-1"
                />

                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded"
                  onClick={async () => {
                    const res = await fetch("/api/trim", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        videoId: uploadedVideoId,
                        startTime,
                        endTime
                      })
                    })

                    const data = await res.json()
                    setTrimmedVideoId(data.trimmedVideoId)
                  }}
                >
                  Trim
                </button>
              </div>
            </div>
          )}

          {trimmedVideoId && (
            <>
              {/* Share */}
              <a
                href={`/share/${trimmedVideoId}`}
                target="_blank"
                className="text-blue-600 underline"
              >
                Share video
              </a>

              {/* MP4 export */}
              <div className="space-y-2">
                <button
                  onClick={async () => {
                    setExporting(true)
                    const res = await fetch("/api/export/mp4", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ videoId: trimmedVideoId })
                    })
                    const data = await res.json()
                    setMp4Url(data.mp4Url)
                    setExporting(false)
                  }}
                  className="px-4 py-2 bg-purple-600 text-white rounded"
                >
                  Export MP4
                </button>

                {mp4Url && (
                  <a
                    href={mp4Url}
                    target="_blank"
                    className="text-blue-600 underline block"
                  >
                    Download MP4
                  </a>
                )}
              </div>

              {/* ✅ Subtitles */}
              <div className="mt-4 space-y-2 max-w-xl">
                <h3 className="font-semibold">Subtitles</h3>

                <button
                  onClick={async () => {
                    setGeneratingSubtitles(true)

                    const res = await fetch("/api/subtitles", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ videoId: trimmedVideoId })
                    })

                    const data = await res.json()
                    setSrtUrl(data.srtUrl)
                    setGeneratingSubtitles(false)
                  }}
                  className="px-4 py-2 bg-teal-600 text-white rounded"
                >
                  Generate Subtitles
                </button>

                {generatingSubtitles && (
                  <p className="text-sm text-gray-600">
                    Generating subtitles…
                  </p>
                )}

                {srtUrl && (
                  <a
                    href={srtUrl}
                    target="_blank"
                    className="text-blue-600 underline block text-sm"
                  >
                    Download subtitles (.srt)
                  </a>
                )}
              </div>

              {/* Metadata */}
              <div className="mt-6 space-y-3 max-w-xl">
                <h3 className="font-semibold">Video Details</h3>

                <input
                  type="text"
                  placeholder="Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border px-3 py-2"
                />

                <textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full border px-3 py-2"
                />

                <input
                  type="text"
                  placeholder="Tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full border px-3 py-2"
                />

                <button
                  className="px-4 py-2 bg-gray-800 text-white rounded"
                  onClick={async () => {
                    await fetch("/api/metadata", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        videoId: trimmedVideoId,
                        title,
                        description,
                        tags: tags.split(",").map(t => t.trim())
                      })
                    })
                    setMetadataSaved(true)
                  }}
                >
                  Save Details
                </button>

                {metadataSaved && (
                  <p className="text-green-600 text-sm">
                    Metadata saved successfully
                  </p>
                )}
              </div>
            </>
          )}

          {trimmedVideoId && (
            <div className="mt-6 space-y-2 max-w-xl">
              <h3 className="font-semibold">Add Text Overlay</h3>

              <input
                type="text"
                value={overlayText}
                onChange={(e) => setOverlayText(e.target.value)}
                className="w-full border px-3 py-2"
              />

              <div className="flex gap-2">
                <input
                  type="number"
                  value={overlayStart}
                  onChange={(e) => setOverlayStart(Number(e.target.value))}
                  className="border px-2 py-1"
                />

                <input
                  type="number"
                  value={overlayEnd}
                  onChange={(e) => setOverlayEnd(Number(e.target.value))}
                  className="border px-2 py-1"
                />
              </div>

              <button
                className="px-4 py-2 bg-indigo-600 text-white rounded"
                onClick={async () => {
                  await fetch("/api/edit/text", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      videoId: trimmedVideoId,
                      text: overlayText,
                      start: overlayStart,
                      end: overlayEnd
                    })
                  })
                }}
              >
                Apply Text Overlay
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  )
}
