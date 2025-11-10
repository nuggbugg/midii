import { NextRequest, NextResponse } from 'next/server';
import { Midi } from '@tonejs/midi';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, readFile, unlink, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

const execAsync = promisify(exec);

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
  console.log('=== Upload Audio API Called ===');

  // CORS headers to allow cross-origin requests
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('File received:', file.name, 'Size:', file.size, 'Type:', file.type);

    // Create temp directory if it doesn't exist
    const tempDir = path.join('/tmp', 'midi-converter');
    if (!existsSync(tempDir)) {
      await mkdir(tempDir, { recursive: true });
    }

    const timestamp = Date.now();
    const fileExt = path.extname(file.name) || '.mp3';
    const audioPath = path.join(tempDir, `upload_${timestamp}${fileExt}`);

    try {
      // Save uploaded file
      console.log('Saving uploaded file to:', audioPath);
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      await writeFile(audioPath, buffer);
      console.log('Audio file saved');

      // Convert audio to MIDI using basic-pitch
      console.log('Converting audio to MIDI...');
      const basicPitchCmd = `basic-pitch "${tempDir}" "${audioPath}" --save-midi`;

      const { stdout, stderr } = await execAsync(basicPitchCmd, { timeout: 120000 });
      console.log('MIDI conversion output:', stdout);
      if (stderr) console.log('MIDI conversion stderr:', stderr);
      console.log('MIDI conversion complete');

      // Read and parse MIDI file
      const audioBasename = path.basename(audioPath, path.extname(audioPath));
      const generatedMidiPath = path.join(tempDir, `${audioBasename}_basic_pitch.mid`);
      console.log('Reading MIDI file from:', generatedMidiPath);
      const midiData = await readFile(generatedMidiPath);
      const midi = new Midi(midiData);

      // Convert MIDI to JSON format
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
        filename: file.name,
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
    console.error('Error in upload-audio API:', error);

    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        error: 'Failed to convert audio file',
        details: error instanceof Error ? error.message : String(error),
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
