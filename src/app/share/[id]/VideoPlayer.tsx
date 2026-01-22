"use client"

import { useEffect, useRef } from "react"

type Props = {
  videoId: string
  src: string
  duration: number
}

export default function VideoPlayer({
  videoId,
  src,
  duration
}: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const maxWatchedRef = useRef(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onTimeUpdate = () => {
      maxWatchedRef.current = Math.max(
        maxWatchedRef.current,
        video.currentTime
      )
    }

    const reportAnalytics = async () => {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          watchedSeconds: maxWatchedRef.current
        })
      })
    }

    video.addEventListener("timeupdate", onTimeUpdate)
    video.addEventListener("ended", reportAnalytics)
    window.addEventListener("beforeunload", reportAnalytics)

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate)
      video.removeEventListener("ended", reportAnalytics)
      window.removeEventListener("beforeunload", reportAnalytics)
    }
  }, [videoId])

  return (
    <video
      ref={videoRef}
      src={src}
      controls
      className="w-full max-w-3xl border"
    />
  )
}
