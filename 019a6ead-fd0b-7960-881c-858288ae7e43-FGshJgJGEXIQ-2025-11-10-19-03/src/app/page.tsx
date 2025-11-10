'use client';

import { useState } from 'react';

interface MidiNote {
  midi: number;
  time: number;
  duration: number;
  velocity: number;
  name: string;
}

interface MidiTrack {
  name: string;
  instrument: string;
  notes: MidiNote[];
}

interface MidiData {
  header: {
    name: string;
    ppq: number;
    tempos: Array<{ bpm: number; time: number }>;
    timeSignatures: Array<{
      timeSignature: number[];
      measures: number;
    }>;
  };
  duration: number;
  tracks: MidiTrack[];
}

interface ConvertResponse {
  success: boolean;
  prompt: string;
  midi: MidiData;
}

export default function Home() {
  const [mode, setMode] = useState<'generate' | 'upload'>('upload');
  const [prompt, setPrompt] = useState('');
  const [musicLength, setMusicLength] = useState(30); // in seconds
  const [forceInstrumental, setForceInstrumental] = useState(true);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ConvertResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      if (mode === 'upload') {
        // Upload mode
        if (!audioFile) {
          throw new Error('Please select an audio file');
        }

        const formData = new FormData();
        formData.append('file', audioFile);

        const response = await fetch('/api/upload-audio', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.details
            ? `${data.error}: ${data.details}`
            : data.error || 'Failed to convert audio';
          throw new Error(errorMsg);
        }

        setResult(data);
      } else {
        // Generate mode
        const response = await fetch('/api/convert-song', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            musicLengthMs: musicLength * 1000,
            forceInstrumental
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.details
            ? `${data.error}: ${data.details}`
            : data.error || 'Failed to convert song';
          throw new Error(errorMsg);
        }

        setResult(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadJson = () => {
    if (!result) return;

    const blob = new Blob([JSON.stringify(result.midi, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `midi-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 font-sans dark:from-zinc-900 dark:to-black p-4">
      <main className="w-full max-w-4xl">
        <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 md:p-12">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            MIDI Song Converter
          </h1>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-8">
            Upload audio files or generate AI music, then convert to MIDI format
          </p>

          {/* Mode Tabs */}
          <div className="flex gap-2 mb-6 bg-zinc-100 dark:bg-zinc-700 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setMode('upload')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'upload'
                  ? 'bg-white dark:bg-zinc-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              📁 Upload Audio
            </button>
            <button
              type="button"
              onClick={() => setMode('generate')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                mode === 'generate'
                  ? 'bg-white dark:bg-zinc-600 text-blue-600 dark:text-blue-400 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              }`}
            >
              🎵 AI Generate (Paid)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'upload' ? (
              // Upload Mode
              <div>
                <label
                  htmlFor="audioFile"
                  className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                >
                  Audio File (MP3, WAV, etc.)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    id="audioFile"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setAudioFile(file);
                        setError(null);
                      }
                    }}
                    className="block w-full text-sm text-zinc-900 dark:text-zinc-100
                      file:mr-4 file:py-3 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900 dark:file:text-blue-300
                      dark:hover:file:bg-blue-800
                      border border-zinc-300 dark:border-zinc-600 rounded-lg
                      cursor-pointer bg-white dark:bg-zinc-700
                      focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                {audioFile && (
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    Selected: {audioFile.name} ({(audioFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                  Supports MP3, WAV, FLAC, OGG, and most audio formats
                </p>
              </div>
            ) : (
              // Generate Mode
              <>
                <div>
                  <label
                    htmlFor="prompt"
                    className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                  >
                    Song Prompt
                  </label>
                  <textarea
                    id="prompt"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a description for your song..."
                    className="w-full px-4 py-3 border border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 resize-none"
                    rows={4}
                    required
                  />
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    ⚠️ Requires API key configured on server
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="musicLength"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Music Length: {musicLength}s
                    </label>
                    <input
                      type="range"
                      id="musicLength"
                      min="3"
                      max="300"
                      step="1"
                      value={musicLength}
                      onChange={(e) => setMusicLength(parseInt(e.target.value))}
                      className="w-full h-2 bg-zinc-200 dark:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      <span>3s</span>
                      <span>300s (5min)</span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="forceInstrumental"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Music Type
                    </label>
                    <div className="flex gap-2 h-full items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="musicType"
                          checked={forceInstrumental}
                          onChange={() => setForceInstrumental(true)}
                          className="mr-2 accent-blue-600"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">Instrumental</span>
                      </label>
                      <label className="flex items-center cursor-pointer ml-4">
                        <input
                          type="radio"
                          name="musicType"
                          checked={!forceInstrumental}
                          onChange={() => setForceInstrumental(false)}
                          className="mr-2 accent-blue-600"
                        />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">With Vocals</span>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading || (mode === 'upload' ? !audioFile : !prompt.trim())}
              className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Converting...
                </span>
              ) : (
                `Convert ${mode === 'upload' ? 'Audio' : 'Song'} to MIDI`
              )}
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-400 text-sm">
                <strong>Error:</strong> {error}
              </p>
            </div>
          )}

          {result && (
            <div className="mt-8 space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-green-700 dark:text-green-400 font-medium">
                  Conversion successful!
                </p>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                  MIDI Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400">Duration:</span>
                    <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {result.midi.duration.toFixed(2)}s
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400">Tracks:</span>
                    <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {result.midi.tracks.length}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-600 dark:text-zinc-400">PPQ:</span>
                    <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-100">
                      {result.midi.header.ppq}
                    </span>
                  </div>
                  {result.midi.header.tempos.length > 0 && (
                    <div>
                      <span className="text-zinc-600 dark:text-zinc-400">Tempo:</span>
                      <span className="ml-2 font-medium text-zinc-900 dark:text-zinc-100">
                        {result.midi.header.tempos[0].bpm.toFixed(0)} BPM
                      </span>
                    </div>
                  )}
                </div>

                {result.midi.tracks.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      Tracks:
                    </h3>
                    <div className="space-y-2">
                      {result.midi.tracks.map((track, idx) => (
                        <div
                          key={idx}
                          className="bg-white dark:bg-zinc-600 rounded p-3 text-sm"
                        >
                          <div className="font-medium text-zinc-900 dark:text-zinc-100">
                            {track.name || `Track ${idx + 1}`}
                          </div>
                          <div className="text-zinc-600 dark:text-zinc-400 text-xs mt-1">
                            Instrument: {track.instrument} • Notes: {track.notes.length}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={downloadJson}
                  className="w-full mt-4 py-3 px-4 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-medium rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                >
                  Download MIDI JSON
                </button>
              </div>

              <details className="bg-zinc-50 dark:bg-zinc-700/50 rounded-lg p-4">
                <summary className="cursor-pointer font-medium text-zinc-900 dark:text-zinc-100 hover:text-blue-600 dark:hover:text-blue-400">
                  View Full JSON
                </summary>
                <pre className="mt-4 text-xs bg-white dark:bg-zinc-800 p-4 rounded border border-zinc-200 dark:border-zinc-600 overflow-x-auto">
                  {JSON.stringify(result.midi, null, 2)}
                </pre>
              </details>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-700">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              API Usage
            </h3>
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-lg p-4 text-xs overflow-x-auto">
              <code className="text-zinc-800 dark:text-zinc-200">
                POST /api/convert-song
                <br />
                <br />
                {JSON.stringify({
                  prompt: "upbeat indie rock song",
                  musicLengthMs: 30000,
                  forceInstrumental: true
                }, null, 2)}
              </code>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
