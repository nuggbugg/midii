# MIDI Song Converter API Documentation

Base URL: `https://workspace-gamma-blue.vercel.app`

## Overview

The MIDI Song Converter API provides two main endpoints:
1. **Upload Audio to MIDI** - Convert any audio file to MIDI format (no API key required)
2. **AI Music Generation to MIDI** - Generate AI music and convert to MIDI (requires API key)

---

## Endpoints

### 1. Upload Audio to MIDI

Convert an uploaded audio file to MIDI format.

**Endpoint:** `POST /api/upload-audio`

**Content-Type:** `multipart/form-data`

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Audio file (MP3, WAV, FLAC, OGG, etc.) |

**Example Request (cURL):**
```bash
curl -X POST https://workspace-gamma-blue.vercel.app/api/upload-audio \
  -F "file=@/path/to/your/audio.mp3"
```

**Example Request (JavaScript/Fetch):**
```javascript
const formData = new FormData();
formData.append('file', audioFile); // audioFile is a File object from <input type="file">

const response = await fetch('https://workspace-gamma-blue.vercel.app/api/upload-audio', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
console.log(data);
```

**Example Request (Python):**
```python
import requests

url = 'https://workspace-gamma-blue.vercel.app/api/upload-audio'
files = {'file': open('audio.mp3', 'rb')}

response = requests.post(url, files=files)
print(response.json())
```

**Example Request (Node.js):**
```javascript
const FormData = require('form-data');
const fs = require('fs');
const fetch = require('node-fetch');

const form = new FormData();
form.append('file', fs.createReadStream('audio.mp3'));

const response = await fetch('https://workspace-gamma-blue.vercel.app/api/upload-audio', {
  method: 'POST',
  body: form,
});

const data = await response.json();
console.log(data);
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "filename": "audio.mp3",
  "midi": {
    "header": {
      "name": "",
      "ppq": 480,
      "tempos": [
        {
          "bpm": 120,
          "time": 0
        }
      ],
      "timeSignatures": [
        {
          "timeSignature": [4, 4],
          "measures": 0
        }
      ]
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
          },
          {
            "midi": 64,
            "time": 0.5,
            "duration": 0.5,
            "velocity": 0.7,
            "name": "E4"
          }
        ]
      }
    ]
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "error": "No audio file provided"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to convert audio file",
  "details": "Error message here"
}
```

---

### 2. AI Music Generation to MIDI

Generate AI music from a text prompt and convert it to MIDI format.

**Note:** This endpoint requires an API key to be configured on the server. Contact the administrator if you get an "API key not configured" error.

**Endpoint:** `POST /api/convert-song`

**Content-Type:** `application/json`

**Request Body:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `prompt` | string | Yes | Description of the music to generate (e.g., "upbeat indie rock song with electric guitar") |
| `musicLengthMs` | number | No | Length of music in milliseconds. Min: 3000, Max: 300000. Default: 30000 |
| `forceInstrumental` | boolean | No | Generate instrumental only (true) or allow vocals (false). Default: true |

**Example Request (cURL):**
```bash
curl -X POST https://workspace-gamma-blue.vercel.app/api/convert-song \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "upbeat indie rock song with electric guitar",
    "musicLengthMs": 30000,
    "forceInstrumental": true
  }'
```

**Example Request (JavaScript/Fetch):**
```javascript
const response = await fetch('https://workspace-gamma-blue.vercel.app/api/convert-song', {
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
console.log(data);
```

**Example Request (Python):**
```python
import requests
import json

url = 'https://workspace-gamma-blue.vercel.app/api/convert-song'
payload = {
    'prompt': 'upbeat indie rock song with electric guitar',
    'musicLengthMs': 30000,
    'forceInstrumental': True
}

headers = {'Content-Type': 'application/json'}
response = requests.post(url, data=json.dumps(payload), headers=headers)
print(response.json())
```

**Example Request (Node.js):**
```javascript
const fetch = require('node-fetch');

const response = await fetch('https://workspace-gamma-blue.vercel.app/api/convert-song', {
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
console.log(data);
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "prompt": "upbeat indie rock song with electric guitar",
  "midi": {
    "header": {
      "name": "Generated Song",
      "ppq": 480,
      "tempos": [
        {
          "bpm": 120,
          "time": 0
        }
      ],
      "timeSignatures": [
        {
          "timeSignature": [4, 4],
          "measures": 0
        }
      ]
    },
    "duration": 30.0,
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

**Error Response (400 Bad Request):**
```json
{
  "error": "Missing required field: prompt"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "error": "Failed to generate and convert song",
  "details": "Error message here"
}
```

---

## MIDI JSON Structure

Both endpoints return MIDI data in the following JSON structure:

```typescript
{
  "header": {
    "name": string,              // Name of the MIDI composition
    "ppq": number,               // Pulses per quarter note
    "tempos": [
      {
        "bpm": number,           // Beats per minute
        "time": number           // Time in seconds when tempo change occurs
      }
    ],
    "timeSignatures": [
      {
        "timeSignature": [number, number],  // [numerator, denominator] e.g., [4, 4]
        "measures": number                   // Measure number where change occurs
      }
    ]
  },
  "duration": number,            // Total duration in seconds
  "tracks": [
    {
      "name": string,            // Track name
      "instrument": string,      // Instrument name
      "notes": [
        {
          "midi": number,        // MIDI note number (0-127)
          "time": number,        // Note start time in seconds
          "duration": number,    // Note duration in seconds
          "velocity": number,    // Note velocity (0-1)
          "name": string         // Note name (e.g., "C4", "A#3")
        }
      ]
    }
  ]
}
```

**MIDI Note Numbers:**
- Middle C (C4) = 60
- A4 (440 Hz) = 69
- Range: 0-127

**Velocity:**
- Range: 0.0 to 1.0
- 0.0 = silent, 1.0 = maximum volume

---

## Rate Limits & Constraints

### Upload Audio Endpoint:
- **Max file size:** Limited by Vercel (typically 4.5MB for free tier)
- **Supported formats:** MP3, WAV, FLAC, OGG, M4A, AAC, and most common audio formats
- **Processing time:** 10-60 seconds depending on audio length
- **Best results:** Instrumental music with clear melodies

### AI Generation Endpoint:
- **Music length:** 3 seconds to 300 seconds (5 minutes)
- **Processing time:** 30-90 seconds (includes generation + conversion)
- **Requires:** Server must have API key configured
- **Note:** Music generation API requires a paid account

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request - Invalid parameters or missing required fields |
| 500 | Internal Server Error - Processing failed |

---

## Example Use Cases

### 1. Music Transcription Service
Upload existing songs to extract MIDI data for sheet music generation.

### 2. Music Analysis Tool
Analyze musical patterns, chord progressions, and note sequences.

### 3. AI Music Composition
Generate custom background music for videos, games, or apps.

### 4. MIDI Controller Integration
Convert audio to MIDI for use with digital audio workstations (DAWs).

---

## Support & Feedback

For issues, questions, or feature requests:
- GitHub: [Your Repository URL]
- Email: [Your Email]

---

## Example Integration (Full Workflow)

```javascript
// Upload audio file
async function uploadAndConvert(audioFile) {
  const formData = new FormData();
  formData.append('file', audioFile);

  const response = await fetch('https://workspace-gamma-blue.vercel.app/api/upload-audio', {
    method: 'POST',
    body: formData,
  });

  const result = await response.json();

  if (result.success) {
    console.log('MIDI conversion successful!');
    console.log('Duration:', result.midi.duration, 'seconds');
    console.log('Number of tracks:', result.midi.tracks.length);
    console.log('Total notes:', result.midi.tracks.reduce((sum, track) => sum + track.notes.length, 0));

    // Process the MIDI data
    result.midi.tracks.forEach((track, index) => {
      console.log(`Track ${index + 1}: ${track.name} (${track.instrument})`);
      console.log(`  - ${track.notes.length} notes`);
    });

    return result.midi;
  } else {
    console.error('Conversion failed:', result.error);
    throw new Error(result.error);
  }
}

// Generate AI music
async function generateMusic(prompt) {
  const response = await fetch('https://workspace-gamma-blue.vercel.app/api/convert-song', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt: prompt,
      musicLengthMs: 30000,
      forceInstrumental: true,
    }),
  });

  const result = await response.json();

  if (result.success) {
    console.log('Music generated successfully!');
    return result.midi;
  } else {
    console.error('Generation failed:', result.error);
    throw new Error(result.error);
  }
}
```

---

## Testing

You can test the API using tools like:
- cURL (command line)
- Postman
- Insomnia
- Your favorite programming language
