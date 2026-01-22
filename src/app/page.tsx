"use client"

import { useRef, useState } from "react"

export default function Home() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recordedChunksRef = useRef<BlobPart[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadedVideoId, setUploadedVideoId] = useState<string | null>(null)

  const [isRecording, setIsRecording] = useState(false)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [startTime, setStartTime] = useState(0)
  const [endTime, setEndTime] = useState(5)
  const [trimmedVideoId, setTrimmedVideoId] = useState<string | null>(null)

  async function startRecording() {
    // Reset previous recording
    recordedChunksRef.current = []
    setVideoUrl(null)

    // Ask browser for screen access
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    })

    // Ask browser for microphone access
    const micStream = await navigator.mediaDevices.getUserMedia({
      audio: true
    })

    // Combine screen + mic into one stream
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

    // Upload to backend
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
    setIsRecording(true)
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop()
    setIsRecording(false)
  }

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Screen Recorder MVP</h1>

      {!isRecording && (
        <button
          onClick={startRecording}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Start Recording
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="px-4 py-2 bg-red-600 text-white rounded"
        >
          Stop Recording
        </button>
      )}

      {videoUrl && (
        <div className="space-y-2">
          <h2 className="font-semibold">Preview</h2>
          <video
            src={videoUrl}
            controls
            className="w-full max-w-3xl border"
          />
          {uploadedVideoId && (
            <div className="space-y-2">
              <h3 className="font-semibold">Trim Video</h3>

              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Start (sec)"
                  value={startTime}
                  onChange={(e) => setStartTime(Number(e.target.value))}
                  className="border px-2 py-1"
                />

                <input
                  type="number"
                  placeholder="End (sec)"
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
          <div className="mt-4 p-4 border rounded bg-gray-50 max-w-xl">
            <p className="text-sm font-semibold text-gray-700">
              Public share link
            </p>

            <a
              href={`/share/${trimmedVideoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline break-all"
            >
              {`http://localhost:3000/share/${trimmedVideoId}`}
            </a>
          </div>
        )}

          {uploading && <p>Uploading video...</p>}

          {uploadedVideoId && (
            <p className="text-green-600">
              Uploaded successfully. Video ID: {uploadedVideoId}
            </p>
          )}

        </div>
      )}
    </main>
  )
}
