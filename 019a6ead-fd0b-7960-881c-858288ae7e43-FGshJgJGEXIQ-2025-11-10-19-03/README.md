# MIDI Song Converter

A Next.js application that converts audio to MIDI files. Upload your own audio files or use AI Music API to generate music, then convert to MIDI format with detailed JSON output.

## Features

- **🎵 Audio File Upload** - Upload MP3, WAV, FLAC, OGG and other audio formats
- **🤖 AI Music Generation** (optional, requires paid plan) using Music Generation API
- Control over music length (3s - 300s / 5 minutes)
- Instrumental or vocal music options
- Audio-to-MIDI conversion using Spotify's basic-pitch model
- Interactive web UI for easy testing
- RESTful API endpoints for programmatic access
- MIDI data returned in JSON format
- Download MIDI JSON files directly from the UI

## Tech Stack

- **Frontend**: Next.js 16, React 19, TailwindCSS
- **Music Generation**: Music Generation API
- **Audio-to-MIDI**: basic-pitch (Spotify's ML model)
- **MIDI Processing**: @tonejs/midi
- **Runtime**: Node.js with Python 3.11 for audio processing

## Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- Music Generation API key (optional, for AI music generation)

## Installation

1. Clone the repository and install dependencies:

```bash
npm install
```

2. Set up Python virtual environment (already configured):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install basic-pitch tensorflow
```

3. Create a `.env.local` file with your Music API key:

```bash
cp .env.example .env.local
```

4. Edit `.env.local` and add your API key:

```env
ELEVENLABS_API_KEY=your_api_key_here
```

## Usage

### Web Interface

1. Start the development server:

```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

3. **Option A: Upload Audio** (Recommended - No API key needed for this feature!)
   - Click the "Upload Audio" tab
   - Select an audio file (MP3, WAV, FLAC, OGG, etc.)
   - Click "Convert Audio to MIDI"
   - View the MIDI information and download the JSON file

4. **Option B: Generate AI Music** (Requires API key configured)
   - Click the "AI Generate (Paid)" tab
   - Enter a music prompt (e.g., "upbeat indie rock song with electric guitar")
   - Adjust music length (3s - 300s) and choose instrumental or with vocals
   - Click "Convert Song to MIDI"
   - View the MIDI information and download the JSON file

### API Endpoints

#### Upload Audio to MIDI

**Endpoint**: `POST /api/upload-audio`

**Content-Type**: `multipart/form-data`

**Form Data**:
- `file`: Audio file (MP3, WAV, FLAC, OGG, etc.)

**Example with cURL**:
```bash
curl -X POST http://localhost:3000/api/upload-audio \
  -F "file=@/path/to/your/song.mp3"
```

**Example with JavaScript**:
```javascript
const formData = new FormData();
formData.append('file', audioFile); // audioFile is a File object

const response = await fetch('/api/upload-audio', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data.midi);
```

#### Generate AI Music to MIDI

**Endpoint**: `POST /api/convert-song` (Requires API key)

**Request Body**:
```json
{
  "prompt": "upbeat indie rock song with electric guitar",
  "musicLengthMs": 30000,
  "forceInstrumental": true
}
```

**Parameters**:
- `prompt` (string, required): Description of the music to generate
- `musicLengthMs` (number, optional): Length of music in milliseconds (3000-300000). Default: 30000
- `forceInstrumental` (boolean, optional): Generate instrumental only (true) or allow vocals (false). Default: true

**Response**:
```json
{
  "success": true,
  "prompt": "Your prompt",
  "midi": {
    "header": {
      "name": "song name",
      "ppq": 480,
      "tempos": [{"bpm": 120, "time": 0}],
      "timeSignatures": [{"timeSignature": [4, 4], "measures": 0}]
    },
    "duration": 10.5,
    "tracks": [
      {
        "name": "Track 1",
        "instrument": "acoustic grand piano",
        "notes": [
          {
            "midi": 60,
            "time": 0,
            "duration": 0.5,
            "velocity": 0.8,
            "name": "C4"
          }
        ]
      }
    ]
  }
}
```

**Example with cURL**:
```bash
curl -X POST http://localhost:3000/api/convert-song \
  -H "Content-Type: application/json" \
  -d '{"prompt": "upbeat indie rock song", "musicLengthMs": 30000, "forceInstrumental": true}'
```

**Example with JavaScript**:
```javascript
const response = await fetch('/api/convert-song', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'upbeat indie rock song with electric guitar',
    musicLengthMs: 30000,
    forceInstrumental: true,
  }),
});

const data = await response.json();
console.log(data.midi);
```

## How It Works

### Upload Mode (Free)
1. **Audio Upload**: User uploads an audio file through the web interface or API
2. **Audio to MIDI**: The audio is processed by basic-pitch (Spotify's ML model) to extract musical notes
3. **MIDI to JSON**: The MIDI file is parsed using @tonejs/midi and converted to a structured JSON format
4. **Response**: The JSON data is returned with track, note, tempo, and timing information

### AI Generation Mode (Requires Paid Plan)
1. **Text to Music**: The prompt is sent to Music Generation API which generates actual music compositions based on the description
2. **Audio to MIDI**: The generated audio is processed by basic-pitch to extract musical notes
3. **MIDI to JSON**: The MIDI file is parsed using @tonejs/midi and converted to a structured JSON format
4. **Response**: The JSON data is returned with track, note, tempo, and timing information

## MIDI JSON Structure

The returned MIDI data includes:

- **Header**: Metadata including PPQ (pulses per quarter note), tempo, and time signature
- **Duration**: Total duration of the MIDI in seconds
- **Tracks**: Array of tracks, each containing:
  - Track name
  - Instrument
  - Notes array with:
    - MIDI note number (0-127)
    - Time (in seconds)
    - Duration (in seconds)
    - Velocity (0-1)
    - Note name (e.g., "C4", "A#3")

## Limitations

### Upload Mode
- MIDI conversion accuracy depends on the audio quality and complexity
- Best results with instrumental music (vocals can reduce MIDI accuracy)
- Clear, isolated melodies work better than complex mixes
- Processing time varies based on audio length (typically 10-60 seconds)

### AI Generation Mode
- Requires API key configured on server (Music API is not available for free)
- Music generation quality depends on prompt clarity and specificity
- Music length limited to 3-300 seconds (5 minutes)
- Processing time includes both generation and conversion (typically 30-90 seconds)

## Environment Variables

- `MUSIC_API_KEY` (optional): Your Music Generation API key - only required for AI music generation feature. Upload mode works without this.

## Development

The project structure:

```
src/
├── app/
│   ├── api/
│   │   ├── convert-song/
│   │   │   └── route.ts        # AI music generation API
│   │   └── upload-audio/
│   │       └── route.ts        # Audio upload API
│   ├── page.tsx                # Main UI with tabs
│   ├── layout.tsx
│   └── globals.css
venv/                            # Python virtual environment
```

## Troubleshooting

### "API key not configured"
This error only affects the AI generation feature. You can still use the upload feature without an API key. If you want to use AI generation, make sure you've created a `.env.local` file with your API key and the server has been configured properly.

### "Music API is not available"
The Music Generation API requires a paid account. Contact the administrator to enable this feature, or use the upload feature instead, which works without any API key.

### "basic-pitch not found"
Run the Python installation command again:
```bash
source venv/bin/activate
pip install basic-pitch tensorflow
```

### Conversion takes too long
Processing time depends on audio length and system resources. Shorter audio files (under 60 seconds) will process faster. The AI generation mode takes longer because it includes music generation time.

## License

MIT

## Credits

- Music Generation API for AI music generation
- Spotify's basic-pitch for audio-to-MIDI conversion
- Tone.js for MIDI parsing
