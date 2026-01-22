"use client"

import { useRef, useState } from "react"
import { Camera, Upload, Scissors, FileVideo, Download, Type, Droplet, ArrowRight, Subtitles, Mic } from "lucide-react"

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

  // Subtitles
  const [srtUrl, setSrtUrl] = useState<string | null>(null)
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false)

  // Voiceover
  const [voiceoverText, setVoiceoverText] = useState("")
  const [voiceId, setVoiceId] = useState("21m00Tcm4TlvDq8ikWAM") // Rachel voice
  const [generatingVoiceover, setGeneratingVoiceover] = useState(false)
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null)
  const [videoWithVoiceoverUrl, setVideoWithVoiceoverUrl] = useState<string | null>(null)

  // Blur
  const [blurX, setBlurX] = useState(100)
  const [blurY, setBlurY] = useState(100)
  const [blurWidth, setBlurWidth] = useState(200)
  const [blurHeight, setBlurHeight] = useState(200)
  const [blurStart, setBlurStart] = useState(0)
  const [blurEnd, setBlurEnd] = useState(3)
  const [applyingBlur, setApplyingBlur] = useState(false)

  // Arrow
  const [arrowX1, setArrowX1] = useState(100)
  const [arrowY1, setArrowY1] = useState(100)
  const [arrowX2, setArrowX2] = useState(300)
  const [arrowY2, setArrowY2] = useState(300)
  const [arrowStart, setArrowStart] = useState(0)
  const [arrowEnd, setArrowEnd] = useState(3)
  const [applyingArrow, setApplyingArrow] = useState(false)

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-xl border-r border-slate-200 dark:border-slate-700 z-10">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Camera className="w-7 h-7 text-blue-600" />
            RecordX
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Screen Recording MVP</p>
        </div>

        <nav className="mt-6 px-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Tools
          </div>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 font-medium">
            <Camera className="w-5 h-5" />
            Record
          </button>
          {trimmedVideoId && (
            <>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Scissors className="w-5 h-5" />
                Trim
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Type className="w-5 h-5" />
                Text Overlay
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Droplet className="w-5 h-5" />
                Blur Area
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <ArrowRight className="w-5 h-5" />
                Add Arrow
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Subtitles className="w-5 h-5" />
                Subtitles
              </button>
              <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Mic className="w-5 h-5" />
                AI Voiceover
              </button>
            </>
          )}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Recording Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Recording Studio</h2>
            
            {recordingState === "inactive" && (
              <button
                onClick={startRecording}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
              >
                <Camera className="w-5 h-5" />
                Start Recording
              </button>
            )}

            {recordingState === "recording" && (
              <div className="flex gap-3">
                <button
                  onClick={pauseRecording}
                  className="flex items-center gap-2 px-5 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  Pause
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  Stop Recording
                </button>
              </div>
            )}

            {recordingState === "paused" && (
              <div className="flex gap-3">
                <button
                  onClick={resumeRecording}
                  className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  Resume
                </button>
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-2 px-5 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  Stop Recording
                </button>
              </div>
            )}
          </div>

          {/* Video Preview */}
          {videoUrl && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Preview</h2>
              <video src={videoUrl} controls className="w-full rounded-xl border border-slate-200 dark:border-slate-700 shadow-lg" />

              {uploading && (
                <div className="mt-4 flex items-center gap-3 text-blue-600">
                  <Upload className="w-5 h-5 animate-bounce" />
                  <span>Uploading video...</span>
                </div>
              )}

              {uploadedVideoId && (
                <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <p className="text-green-700 dark:text-green-400 font-medium">
                    ✓ Uploaded successfully. Video ID: {uploadedVideoId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Trim Section */}
          {uploadedVideoId && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                <Scissors className="w-6 h-6 text-blue-600" />
                Trim Video
              </h2>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Start Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={startTime}
                    onChange={(e) => setStartTime(Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    End Time (seconds)
                  </label>
                  <input
                    type="number"
                    value={endTime}
                    onChange={(e) => setEndTime(Number(e.target.value))}
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <button
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all"
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
                <Scissors className="w-5 h-5" />
                Trim Video
              </button>
            </div>
          )}

          {/* Post-Trim Features */}
          {trimmedVideoId && (
            <>
              {/* Share Link */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl shadow-lg p-8 mb-8 border border-blue-200 dark:border-blue-800">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Share Your Video</h2>
                <a
                  href={`/share/${trimmedVideoId}`}
                  target="_blank"
                  className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium text-lg underline decoration-2 underline-offset-4"
                >
                  🔗 Open Shareable Link
                </a>
              </div>

              {/* Video Details */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Video Details</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter video title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Describe your video"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="tutorial, demo, product"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    className="px-6 py-3 bg-slate-800 dark:bg-slate-600 hover:bg-slate-900 dark:hover:bg-slate-700 text-white rounded-xl font-semibold shadow-lg transition-all"
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
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <p className="text-green-700 dark:text-green-400 font-medium">
                        ✓ Metadata saved successfully
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Text Overlay */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Type className="w-6 h-6 text-purple-600" />
                  Add Text Overlay
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Text
                    </label>
                    <input
                      type="text"
                      value={overlayText}
                      onChange={(e) => setOverlayText(e.target.value)}
                      placeholder="Enter overlay text"
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start (seconds)
                      </label>
                      <input
                        type="number"
                        value={overlayStart}
                        onChange={(e) => setOverlayStart(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        End (seconds)
                      </label>
                      <input
                        type="number"
                        value={overlayEnd}
                        onChange={(e) => setOverlayEnd(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-semibold shadow-lg transition-all"
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
                    <Type className="w-5 h-5" />
                    Apply Text Overlay
                  </button>
                </div>
              </div>

              {/* Blur Area */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Droplet className="w-6 h-6 text-pink-600" />
                  Blur Area
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        X Position
                      </label>
                      <input
                        type="number"
                        value={blurX}
                        onChange={(e) => setBlurX(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Y Position
                      </label>
                      <input
                        type="number"
                        value={blurY}
                        onChange={(e) => setBlurY(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Width
                      </label>
                      <input
                        type="number"
                        value={blurWidth}
                        onChange={(e) => setBlurWidth(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Height
                      </label>
                      <input
                        type="number"
                        value={blurHeight}
                        onChange={(e) => setBlurHeight(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start (seconds)
                      </label>
                      <input
                        type="number"
                        value={blurStart}
                        onChange={(e) => setBlurStart(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        End (seconds)
                      </label>
                      <input
                        type="number"
                        value={blurEnd}
                        onChange={(e) => setBlurEnd(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    disabled={applyingBlur}
                    className="flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-pink-400 text-white rounded-xl font-semibold shadow-lg transition-all"
                    onClick={async () => {
                      setApplyingBlur(true)
                      await fetch("/api/edit/blur", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          videoId: trimmedVideoId,
                          x: blurX,
                          y: blurY,
                          width: blurWidth,
                          height: blurHeight,
                          start: blurStart,
                          end: blurEnd
                        })
                      })
                      setApplyingBlur(false)
                    }}
                  >
                    <Droplet className="w-5 h-5" />
                    {applyingBlur ? "Applying Blur..." : "Apply Blur"}
                  </button>
                </div>
              </div>

              {/* Add Arrow */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <ArrowRight className="w-6 h-6 text-orange-600" />
                  Add Arrow
                </h2>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start X
                      </label>
                      <input
                        type="number"
                        value={arrowX1}
                        onChange={(e) => setArrowX1(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start Y
                      </label>
                      <input
                        type="number"
                        value={arrowY1}
                        onChange={(e) => setArrowY1(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        End X
                      </label>
                      <input
                        type="number"
                        value={arrowX2}
                        onChange={(e) => setArrowX2(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        End Y
                      </label>
                      <input
                        type="number"
                        value={arrowY2}
                        onChange={(e) => setArrowY2(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Start (seconds)
                      </label>
                      <input
                        type="number"
                        value={arrowStart}
                        onChange={(e) => setArrowStart(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        End (seconds)
                      </label>
                      <input
                        type="number"
                        value={arrowEnd}
                        onChange={(e) => setArrowEnd(Number(e.target.value))}
                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <button
                    disabled={applyingArrow}
                    className="flex items-center gap-2 px-6 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white rounded-xl font-semibold shadow-lg transition-all"
                    onClick={async () => {
                      setApplyingArrow(true)
                      await fetch("/api/edit/arrow", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          videoId: trimmedVideoId,
                          x1: arrowX1,
                          y1: arrowY1,
                          x2: arrowX2,
                          y2: arrowY2,
                          start: arrowStart,
                          end: arrowEnd
                        })
                      })
                      setApplyingArrow(false)
                    }}
                  >
                    <ArrowRight className="w-5 h-5" />
                    {applyingArrow ? "Adding Arrow..." : "Add Arrow"}
                  </button>
                </div>
              </div>

              {/* Subtitles */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Subtitles className="w-6 h-6 text-teal-600" />
                  Generate Subtitles
                </h2>

                <button
                  disabled={generatingSubtitles}
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
                  className="flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  <Subtitles className="w-5 h-5" />
                  {generatingSubtitles ? "Generating..." : "Generate Subtitles"}
                </button>

                {generatingSubtitles && (
                  <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                    This may take a minute. Processing audio with Whisper...
                  </p>
                )}

                {srtUrl && (
                  <div className="mt-4 p-4 bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-lg">
                    <a
                      href={srtUrl}
                      target="_blank"
                      className="text-teal-700 dark:text-teal-400 font-medium hover:underline"
                    >
                      📥 Download Subtitles (.srt)
                    </a>
                  </div>
                )}
              </div>

              {/* AI Voiceover */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <Mic className="w-6 h-6 text-violet-600" />
                  AI Voiceover (ElevenLabs)
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Voiceover Script
                    </label>
                    <textarea
                      placeholder="Enter the text you want to convert to speech..."
                      value={voiceoverText}
                      onChange={(e) => setVoiceoverText(e.target.value)}
                      rows={4}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Voice
                    </label>
                    <select
                      value={voiceId}
                      onChange={(e) => setVoiceId(e.target.value)}
                      className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    >
                      <option value="21m00Tcm4TlvDq8ikWAM">Rachel - Natural (Female)</option>
                      <option value="AZnzlk1XvdvUeBnXmlld">Domi - Strong (Female)</option>
                      <option value="EXAVITQu4vr4xnSDxMaL">Bella - Soft (Female)</option>
                      <option value="ErXwobaYiN019PkySvjV">Antoni - Well-rounded (Male)</option>
                      <option value="VR6AewLTigWG4xSOukaG">Arnold - Crisp (Male)</option>
                      <option value="pNInz6obpgDQGcFmaJgB">Adam - Deep (Male)</option>
                      <option value="yoZ06aMxZJJ28mfd3POQ">Sam - Dynamic (Male)</option>
                    </select>
                  </div>

                  <button
                    disabled={generatingVoiceover || !voiceoverText.trim()}
                    onClick={async () => {
                      setGeneratingVoiceover(true)

                      try {
                        const res = await fetch("/api/voiceover", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            videoId: trimmedVideoId,
                            text: voiceoverText,
                            voiceId: voiceId
                          })
                        })

                        const data = await res.json()
                        
                        if (res.ok) {
                          setVoiceoverUrl(data.voiceoverUrl)
                          setVideoWithVoiceoverUrl(data.videoWithVoiceoverUrl)
                        } else {
                          alert(data.error || "Failed to generate voiceover")
                        }
                      } catch (error) {
                        console.error("Voiceover error:", error)
                        alert("Failed to generate voiceover")
                      }

                      setGeneratingVoiceover(false)
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl font-semibold shadow-lg transition-all"
                  >
                    <Mic className="w-5 h-5" />
                    {generatingVoiceover ? "Generating..." : "Generate AI Voiceover"}
                  </button>

                  {generatingVoiceover && (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Generating professional voiceover with ElevenLabs...
                    </p>
                  )}

                  {voiceoverUrl && (
                    <div className="mt-4 space-y-3">
                      <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Audio Only:
                        </p>
                        <audio src={voiceoverUrl} controls className="w-full" />
                      </div>

                      {videoWithVoiceoverUrl && (
                        <div className="p-4 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-lg">
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Video with AI Voiceover:
                          </p>
                          <a
                            href={videoWithVoiceoverUrl}
                            target="_blank"
                            className="text-violet-700 dark:text-violet-400 font-medium hover:underline"
                          >
                            📥 Download Video with Voiceover
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Export MP4 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 mb-8">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-2">
                  <FileVideo className="w-6 h-6 text-indigo-600" />
                  Export Video
                </h2>

                <button
                  disabled={exporting}
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
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-xl font-semibold shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  {exporting ? "Exporting..." : "Export as MP4"}
                </button>

                {mp4Url && (
                  <div className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                    <a
                      href={mp4Url}
                      target="_blank"
                      className="text-indigo-700 dark:text-indigo-400 font-medium hover:underline"
                    >
                      📥 Download MP4
                    </a>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}