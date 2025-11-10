import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { Midi } from '@tonejs/midi';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

interface ConvertRequest {
  prompt: string;
  musicLengthMs?: number;
  forceInstrumental?: boolean;
}

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

export async function POST(request: NextRequest) {
  console.log('=== API Route Called ===');

  // CORS headers to allow cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const body: ConvertRequest = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    if (!body.prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Check if API key is set
    const apiKey = process.env.ELEVENLABS_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey?.length);

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Music API key is not configured on the server' },
        { status: 500, headers: corsHeaders }
      );
    }

    // Initialize Music Generation client
    console.log('Initializing music generation client...');
    const elevenlabs = new ElevenLabsClient({ apiKey });
    console.log('Music generation client initialized');

    // Create temp directory if it doesn't exist
    const tempDir = path.join('/tmp', 'midi-converter');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const audioPath = path.join(tempDir, `audio_${timestamp}.mp3`);

    try {
      // Step 1: Generate music from prompt using Music Generation API
      console.log('=== Starting music generation ===');
      console.log('Generating music from prompt:', body.prompt);

      const musicLengthMs = body.musicLengthMs || 30000; // Default 30 seconds
      console.log('Music length (ms):', musicLengthMs);

      // Add "instrumental" to prompt if requested
      let prompt = body.prompt;
      if (body.forceInstrumental ?? true) {
        prompt = `${body.prompt} (instrumental version)`;
      }
      console.log('Final prompt:', prompt);

      console.log('Calling elevenlabs.music.compose...');
      const audio = await elevenlabs.music.compose({
        prompt: prompt,
        musicLengthMs: musicLengthMs,
      });
      console.log('Music generation completed, received audio stream');

      // Convert ReadableStream to Buffer
      console.log('Converting audio stream to buffer...');
      const chunks: Uint8Array[] = [];
      // @ts-ignore - audio is an async iterable
      for await (const chunk of audio) {
        chunks.push(chunk);
      }
      const audioBuffer = Buffer.concat(chunks);
      console.log('Audio buffer size:', audioBuffer.length, 'bytes');

      // Save audio to file
      await writeFile(audioPath, audioBuffer);
      console.log('Audio saved to:', audioPath);

      // Step 2: Convert audio to MIDI using basic-pitch
      console.log('Converting audio to MIDI...');
      const basicPitchCmd = `basic-pitch "${tempDir}" "${audioPath}" --save-midi`;

      const { stdout, stderr } = await execAsync(basicPitchCmd, { timeout: 120000 });
      console.log('MIDI conversion output:', stdout);
      if (stderr) console.log('MIDI conversion stderr:', stderr);
      console.log('MIDI conversion complete');

      // Step 3: Read and parse MIDI file
      // basic-pitch creates a file named after the input audio file
      const audioBasename = path.basename(audioPath, path.extname(audioPath));
      const generatedMidiPath = path.join(tempDir, `${audioBasename}_basic_pitch.mid`);
      console.log('Reading MIDI file from:', generatedMidiPath);
      const midiData = await readFile(generatedMidiPath);
      const midi = new Midi(midiData);

      // Step 4: Convert MIDI to JSON format
      const midiJson: MidiData = {
        header: {
          name: midi.name,
          ppq: midi.header.ppq,
          tempos: midi.header.tempos.map(t => ({
            bpm: t.bpm,
            time: t.time ?? 0,
          })),
          timeSignatures: midi.header.timeSignatures.map(ts => ({
            timeSignature: ts.timeSignature,
            measures: ts.measures ?? 0,
          })),
        },
        duration: midi.duration,
        tracks: midi.tracks.map(track => ({
          name: track.name,
          instrument: track.instrument.name,
          notes: track.notes.map(note => ({
            midi: note.midi,
            time: note.time,
            duration: note.duration,
            velocity: note.velocity,
            name: note.name,
          })),
        })),
      };

      // Cleanup temp files
      await unlink(audioPath).catch(console.error);
      await unlink(generatedMidiPath).catch(console.error);

      return NextResponse.json({
        success: true,
        prompt: body.prompt,
        midi: midiJson,
      }, { headers: corsHeaders });

    } catch (error) {
      // Cleanup on error
      await unlink(audioPath).catch(() => {});
      const audioBasename = path.basename(audioPath, path.extname(audioPath));
      const generatedMidiPath = path.join(tempDir, `${audioBasename}_basic_pitch.mid`);
      await unlink(generatedMidiPath).catch(() => {});
      throw error;
    }

  } catch (error) {
    console.error('Error in convert-song API:', error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    // @ts-ignore - check for API response errors
    if (error?.response) {
      // @ts-ignore
      console.error('API Response Status:', error.response.status);
      // @ts-ignore
      console.error('API Response Data:', error.response.data);
    }

    return NextResponse.json(
      {
        error: 'Failed to convert song',
        details: error instanceof Error ? error.message : String(error),
        // @ts-ignore
        statusCode: error?.response?.status,
      },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
