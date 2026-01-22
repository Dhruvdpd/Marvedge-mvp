# Screen Recorder MVP (Next.js)

A full-featured, Loom-style screen recording application built with Next.js, TypeScript, and FFmpeg. This project demonstrates a complete end-to-end implementation of browser-based screen recording with advanced video processing, AI-powered features, and analytics.

## 🎯 Overview

This is a production-ready MVP that showcases:
- **Browser Media APIs** - Screen and microphone recording without extensions
- **Server-side Video Processing** - FFmpeg-based trimming, editing, and format conversion
- **AI Integration** - Automatic subtitle generation and AI voiceover
- **Data Persistence** - File-based storage with JSON metadata
- **Analytics** - View tracking and watch completion metrics
- **Modern UI** - Responsive design with dark mode support

## ✨ Key Features

### 🎥 Recording
- **Screen + Audio Capture** - Records screen with system audio and microphone
- **Live Controls** - Start, pause, resume, and stop recording
- **Instant Preview** - View recording immediately after stopping
- **WebM Format** - Browser-native format for optimal compatibility

### ✂️ Video Editing
- **Precision Trimming** - Cut videos to exact start/end times using FFmpeg
- **Text Overlays** - Add timed text annotations to videos
- **Blur Regions** - Privacy-focused area blurring with custom dimensions
- **Arrow Annotations** - Draw attention with visual arrow indicators
- **Format Export** - Convert WebM to MP4 for universal compatibility

### 🤖 AI Features
- **Auto Subtitles** - Generate accurate subtitles using OpenAI Whisper
- **AI Voiceover** - Professional text-to-speech with ElevenLabs (7 voice options)
- **Subtitle Formats** - Export as SRT, VTT, JSON, TXT, or TSV

### 📊 Analytics & Sharing
- **Public Share Links** - Generate shareable URLs for any video
- **View Tracking** - Server-side view count (no double-counting)
- **Completion Metrics** - Track average watch percentage across all views
- **Video Metadata** - Add title, description, and tags to organize content

### 🎨 User Interface
- **Sidebar Navigation** - Organized tool access with icon indicators
- **Modern Design** - Gradient backgrounds, shadows, and smooth transitions
- **Dark Mode** - Automatic theme switching based on system preferences
- **Responsive Layout** - Optimized for desktop and tablet viewing

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js 18+** - [Download](https://nodejs.org/)
- **FFmpeg** - Required for video processing

#### Install FFmpeg:

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install ffmpeg
```

**Windows:**
Download from [ffmpeg.org](https://ffmpeg.org/download.html) and add to PATH

**Verify installation:**
```bash
ffmpeg -version
```

### Optional Dependencies

For AI features, you'll need:

**OpenAI Whisper** (for subtitles):
```bash
pip install openai-whisper
```

**ElevenLabs API** (for voiceover):
1. Sign up at [elevenlabs.io](https://elevenlabs.io/)
2. Get your API key from the dashboard
3. Create a `.env` file in the project root:
```bash
ELEVENLABS_API_KEY=your_api_key_here
```

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd screen-recorder-mvp
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create required directories:**
```bash
mkdir -p public/uploads/{raw,trimmed,edited,audio,subtitles,voiceovers,exports}
mkdir -p data
```

4. **Initialize metadata storage:**
```bash
echo "{}" > data/videos.json
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
```
http://localhost:3000
```

## 📁 Project Structure

```
screen-recorder-mvp/
├── src/
│   ├── app/
│   │   ├── api/                    # API routes
│   │   │   ├── upload/             # Raw video upload
│   │   │   ├── trim/               # Video trimming with FFmpeg
│   │   │   ├── analytics/          # Watch metrics tracking
│   │   │   ├── metadata/           # Video details management
│   │   │   ├── subtitles/          # Whisper subtitle generation
│   │   │   ├── voiceover/          # ElevenLabs AI voiceover
│   │   │   ├── edit/
│   │   │   │   ├── text/           # Text overlay rendering
│   │   │   │   ├── blur/           # Region blurring
│   │   │   │   └── arrow/          # Arrow annotations
│   │   │   └── export/
│   │   │       └── mp4/            # WebM to MP4 conversion
│   │   ├── share/[id]/             # Public video pages
│   │   │   ├── page.tsx            # Server-rendered share page
│   │   │   └── VideoPlayer.tsx     # Client-side analytics tracking
│   │   ├── page.tsx                # Main recording interface
│   │   ├── layout.tsx              # App layout wrapper
│   │   └── globals.css             # Global styles
│   └── ...
├── public/
│   └── uploads/                    # Video storage
│       ├── raw/                    # Original recordings
│       ├── trimmed/                # Processed videos
│       ├── edited/                 # Videos with effects
│       ├── audio/                  # Extracted audio files
│       ├── subtitles/              # Generated subtitle files
│       ├── voiceovers/             # AI-generated audio
│       └── exports/                # MP4 exports
├── data/
│   └── videos.json                 # Metadata database
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🔧 API Routes

### Video Management

**POST `/api/upload`**
- Uploads raw recorded video
- Returns: `{ videoId: string }`

**POST `/api/trim`**
- Body: `{ videoId, startTime, endTime }`
- Trims video using FFmpeg with re-encoding
- Returns: `{ trimmedVideoId: string }`

**POST `/api/metadata`**
- Body: `{ videoId, title, description, tags }`
- Saves video metadata
- Returns: `{ success: boolean }`

### Video Editing

**POST `/api/edit/text`**
- Body: `{ videoId, text, start, end }`
- Adds timed text overlay
- Returns: `{ editedUrl: string }`

**POST `/api/edit/blur`**
- Body: `{ videoId, x, y, width, height, start, end }`
- Applies boxblur to specified region
- Returns: `{ editedUrl: string }`

**POST `/api/edit/arrow`**
- Body: `{ videoId, x1, y1, x2, y2, start, end }`
- Draws arrow from point A to point B
- Returns: `{ editedUrl: string }`

### AI Features

**POST `/api/subtitles`**
- Body: `{ videoId }`
- Extracts audio and runs Whisper transcription
- Returns: `{ srtUrl: string, message: string }`

**POST `/api/voiceover`**
- Body: `{ videoId, text, voiceId }`
- Generates AI voiceover with ElevenLabs
- Merges audio with video
- Returns: `{ voiceoverUrl: string, videoWithVoiceoverUrl: string }`

### Export & Analytics

**POST `/api/export/mp4`**
- Body: `{ videoId }`
- Converts WebM to MP4 using FFmpeg
- Returns: `{ mp4Url: string }`

**POST `/api/analytics`**
- Body: `{ videoId, watchedSeconds }`
- Updates completion metrics
- Returns: `{ success: boolean }`

## 🎨 UI Components

### Main Recording Page (`src/app/page.tsx`)

**Recording Studio**
- Start/Pause/Resume/Stop controls
- Real-time recording state management
- Automatic upload after recording

**Video Preview**
- Inline video player for recorded content
- Upload status indicators

**Trimming Controls**
- Start/end time inputs
- Trim button with FFmpeg processing

**Editing Tools**
- Text overlay with timing controls
- Blur area with position/size inputs
- Arrow annotation with coordinate inputs
- Visual feedback during processing

**AI Features**
- Subtitle generation with Whisper
- Voiceover with voice selection dropdown
- Audio preview and download links

**Export Options**
- MP4 conversion button
- Download links for all formats

### Share Page (`src/app/share/[id]/page.tsx`)

**Server-Side Rendering**
- Increments view count on page load
- Calculates average completion percentage
- Displays video metadata (title, description, tags)

**Analytics Dashboard**
- Total views card
- Average completion percentage card
- Video duration display

**Video Player Component**
- Client-side playback tracking
- Maximum progress detection
- Analytics reporting on unload/end

## 📊 Data Storage

### videos.json Schema

```json
{
  "video-uuid": {
    "id": "video-uuid",
    "filePath": "/uploads/trimmed/video-uuid.webm",
    "viewCount": 0,
    "completionSum": 0,
    "duration": 5,
    "createdAt": "2026-01-22T12:00:00.000Z",
    "title": "Optional video title",
    "description": "Optional description",
    "tags": ["tag1", "tag2"]
  }
}
```

### File Storage Strategy

For this MVP, videos are stored in the local filesystem under `public/uploads/`. This acts as mocked object storage and keeps the system simple and reliable.

**For production**, this layer can be swapped with:
- AWS S3
- Cloudflare R2
- Google Cloud Storage
- Azure Blob Storage

The API routes are designed to be storage-agnostic, requiring only path updates.

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```bash
# Optional: For AI voiceover feature
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

## 🚢 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm start
```

### Deployment Considerations

**For serverless platforms (Vercel, Netlify):**
- Replace file storage with object storage (S3, R2)
- Move metadata to a database (PostgreSQL, MongoDB)
- Consider Lambda/Edge function limits for video processing
- Use background job queues for long-running FFmpeg tasks

**For traditional servers:**
- Current file-based approach works well
- Consider adding Nginx for static file serving
- Implement backup strategy for uploads directory
- Add monitoring for disk space usage

## ⚡ Performance Optimization

### Current Optimizations
- WebM format for minimal recording overhead
- FFmpeg re-encoding for browser compatibility
- Server-side view counting to prevent double-counting
- Maximum progress tracking for accurate completion metrics

### Recommended Improvements
- Add video thumbnails for share pages
- Implement progressive upload for large files
- Use CDN for video delivery
- Add video streaming (HLS/DASH) for long recordings
- Implement client-side video compression before upload

## 🔒 Security Considerations

### Current Implementation
- UUIDs for unpredictable video IDs
- Server-side validation for all inputs
- No authentication (MVP scope)

### Production Recommendations
- Add user authentication and authorization
- Implement access control for videos (private/public/unlisted)
- Add rate limiting for API routes
- Sanitize user-provided metadata
- Implement CORS policies
- Add virus scanning for uploaded videos
- Use signed URLs for video access

## 🐛 Troubleshooting

### Common Issues

**FFmpeg not found:**
```bash
# Check if FFmpeg is installed
ffmpeg -version

# Install if missing (macOS)
brew install ffmpeg
```

**Whisper not found:**
```bash
# Install Whisper
pip install openai-whisper

# Verify installation
whisper --help
```

**ElevenLabs API errors:**
- Check your API key in `.env`
- Verify your account has credits
- Check API usage limits

**Video won't play in browser:**
- Ensure FFmpeg is re-encoding (not using `-c copy`)
- Check browser console for codec errors
- Try converting to MP4 format

**Permission errors on Windows:**
- Run as Administrator
- Check file path permissions
- Verify FFmpeg path in system PATH

## 🎯 Feature Roadmap

### Planned Enhancements
- [ ] Real-time collaboration features
- [ ] Video timeline editor with drag-and-drop trimming
- [ ] Picture-in-picture webcam overlay
- [ ] Custom watermark support
- [ ] Batch processing for multiple videos
- [ ] Video chapters and bookmarks
- [ ] Advanced analytics (heatmaps, drop-off points)
- [ ] Social media sharing integrations
- [ ] Video compression presets
- [ ] Multi-language subtitle support

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is provided as-is for educational and demonstration purposes.

## 🙏 Acknowledgments

**Technologies Used:**
- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [FFmpeg](https://ffmpeg.org/) - Video processing
- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition
- [ElevenLabs](https://elevenlabs.io/) - AI voice generation
- [Lucide React](https://lucide.dev/) - Icon library

## 📧 Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the troubleshooting section above

## 📊 Project Stats

- **Lines of Code**: ~2,000+
- **API Routes**: 10
- **Features Implemented**: 15+
- **Development Time**: ~5 days
- **Tech Stack**: Next.js 16, TypeScript, FFmpeg, AI APIs

---

**Built with ❤️ using Next.js and modern web technologies**
