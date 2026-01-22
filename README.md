Screen Recorder MVP (Next.js)

This is a Next.js + TypeScript project that implements a real, end-to-end slice of a Loom-style product.
It demonstrates browser-based screen recording, server-side video processing, public sharing, and basic analytics with a clean MVP mindset.

The project was built to show competence across:

Browser media APIs

Backend processing

Data persistence

Product decision-making

Getting Started
Prerequisites

Make sure you have the following installed:

Node.js 18+

FFmpeg (required for server-side trimming)

Verify FFmpeg:

ffmpeg -version

Run the development server
npm install
npm run dev


Open:

http://localhost:3000


You should see the screen recording interface.

How the App Works
1. In-Browser Screen Recording

Records screen + microphone using the MediaRecorder API

No browser extension required

Start / Stop controls

Output saved as .webm

2. Video Trimming

User provides start and end time

Trimming is done server-side using FFmpeg

Produces a new immutable trimmed video

3. Upload & Share

Trimmed video is persisted in storage (mocked object storage)

Generates a public share link

Anyone with the link can watch the video

4. Analytics

View count

Incremented server-side when the share page loads

Watch completion percentage

Tracked client-side using video playback events

Persisted server-side and averaged across views

All data persists across reloads and restarts.

Project Structure
src/
  app/
    page.tsx                 # Recording + trimming UI
    share/[id]/
      page.tsx               # Public share page (server-side)
      VideoPlayer.tsx        # Client-side playback analytics
    api/
      upload/route.ts        # Raw video upload
      trim/route.ts          # FFmpeg trimming + metadata
      analytics/route.ts     # Completion analytics
public/
  uploads/
    raw/
    trimmed/
data/
  videos.json                # Persistent metadata

Storage Strategy

For this MVP, videos are stored on the local filesystem under public/uploads/.

This acts as mocked object storage, which is explicitly allowed by the assignment and keeps the system simple and reliable.

For production, this layer can be swapped with S3 or Cloudflare R2 without changing the rest of the pipeline.

Analytics Design

View count

Counted on the server to avoid double counting from client re-renders

Completion percentage

Calculated using the maximum playback progress per session

Avoids inflating metrics from seeking or replaying

This mirrors real-world analytics behavior at MVP scale.

UI Notes

The UI is intentionally minimal:

Small font size

No heavy styling

Focus on behavior and correctness

This keeps attention on functionality rather than polish.
Typography and spacing would be expanded for a production-facing version.

What Would Be Improved for Production

If this were taken beyond MVP:

Replace mocked storage with S3 / R2

Use a real database (Postgres / SQLite)

Add background job queues for video processing

Improve trimming UI with a visual timeline

Add authentication and access control

Track unique views (sessions / cookies)

Improve accessibility and responsive typography

Demo

Local demo: run via npm run dev

Recorded demo: 2–3 minute screen recording showing:

Recording

Trimming

Share link generation

View & completion analytics

Time Spent

~5 days
(including design, implementation, learning, and polish)

Learn More

To learn more about the tools used in this project:

Next.js Documentation

MediaRecorder API

FFmpeg Documentation

Deployment Notes

This project is designed to run locally for demonstration purposes.

If deployed to a serverless platform:

Video storage would move to object storage

Metadata persistence would move to a database

Final Note

This project focuses on shipping a real, working MVP slice, not overengineering.
Every design choice was made to balance correctness, simplicity, and clarity.
