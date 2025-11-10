# MIDI Converter API - Quick Reference

## Base URL
```
https://workspace-gamma-blue.vercel.app
```

---

## 📤 Upload Audio to MIDI (No API key needed)

```bash
curl -X POST https://workspace-gamma-blue.vercel.app/api/upload-audio \
  -F "file=@song.mp3"
```

**JavaScript:**
```javascript
const formData = new FormData();
formData.append('file', audioFile);

const response = await fetch('https://workspace-gamma-blue.vercel.app/api/upload-audio', {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

---

## 🎵 AI Music Generation (Requires API key on server)

```bash
curl -X POST https://workspace-gamma-blue.vercel.app/api/convert-song \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "upbeat rock song",
    "musicLengthMs": 30000,
    "forceInstrumental": true
  }'
```

**JavaScript:**
```javascript
const response = await fetch('https://workspace-gamma-blue.vercel.app/api/convert-song', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'upbeat rock song',
    musicLengthMs: 30000,
    forceInstrumental: true
  })
});

const data = await response.json();
```

---

## Response Format

```json
{
  "success": true,
  "midi": {
    "header": { "ppq": 480, "tempos": [...], "timeSignatures": [...] },
    "duration": 30.5,
    "tracks": [
      {
        "name": "Track 1",
        "instrument": "acoustic grand piano",
        "notes": [
          { "midi": 60, "time": 0, "duration": 0.5, "velocity": 0.8, "name": "C4" }
        ]
      }
    ]
  }
}
```

---

## Testing

Use tools like cURL, Postman, or Insomnia to test the API endpoints.
