import { Mp3Encoder } from '@breezystack/lamejs';

export interface ParsedWav {
  channels: number;
  sampleRate: number;
  bitsPerSample: number;
  samples: Int16Array;
}

/**
 * Parses PCM WAV binary data from an ArrayBuffer into channels, sampleRate, and Int16Array PCM samples.
 */
export function parseWavHeader(buffer: ArrayBuffer, byteOffset: number = 0, byteLength: number = buffer.byteLength): ParsedWav | null {
  try {
    const dataView = new DataView(buffer, byteOffset, byteLength);
    if (dataView.byteLength < 44) return null;

    const riff = String.fromCharCode(
      dataView.getUint8(0),
      dataView.getUint8(1),
      dataView.getUint8(2),
      dataView.getUint8(3)
    );
    if (riff !== 'RIFF') return null;

    let pos = 12;
    let channels = 1;
    let sampleRate = 24000;
    let bitsPerSample = 16;
    let dataOffset = 0;
    let dataLength = 0;

    while (pos + 8 <= dataView.byteLength) {
      const chunkId = String.fromCharCode(
        dataView.getUint8(pos),
        dataView.getUint8(pos + 1),
        dataView.getUint8(pos + 2),
        dataView.getUint8(pos + 3)
      );
      const chunkSize = dataView.getUint32(pos + 4, true);

      if (chunkId === 'fmt ') {
        channels = dataView.getUint16(pos + 10, true);
        sampleRate = dataView.getUint32(pos + 12, true);
        bitsPerSample = dataView.getUint16(pos + 22, true);
      } else if (chunkId === 'data') {
        dataOffset = pos + 8;
        dataLength = chunkSize;
        break;
      }
      pos += 8 + chunkSize;
    }

    if (dataOffset === 0) return null;
    const actualLength = Math.min(dataLength, dataView.byteLength - dataOffset);
    const sampleCount = Math.floor(actualLength / (bitsPerSample / 8));
    const samples = new Int16Array(sampleCount);

    if (bitsPerSample === 16) {
      for (let i = 0; i < sampleCount; i++) {
        samples[i] = dataView.getInt16(dataOffset + i * 2, true);
      }
    } else if (bitsPerSample === 8) {
      for (let i = 0; i < sampleCount; i++) {
        const val = dataView.getUint8(dataOffset + i) - 128;
        samples[i] = val * 256;
      }
    } else {
      return null;
    }

    return { channels, sampleRate, bitsPerSample, samples };
  } catch (err) {
    console.error('Failed to parse WAV header:', err);
    return null;
  }
}

/**
 * Encodes PCM Int16 samples into an MP3 Uint8Array using lamejs.
 */
export function pcmInt16ToMp3(
  samples: Int16Array,
  channels: number = 1,
  sampleRate: number = 24000,
  kbps: number = 128
): Uint8Array {
  const encoder = new Mp3Encoder(channels, sampleRate, kbps);
  const mp3Chunks: Uint8Array[] = [];
  const blockSize = 1152;

  if (channels === 1) {
    for (let i = 0; i < samples.length; i += blockSize) {
      const chunk = samples.subarray(i, i + blockSize);
      const mp3buf = encoder.encodeBuffer(chunk);
      if (mp3buf && mp3buf.length > 0) {
        mp3Chunks.push(new Uint8Array(mp3buf));
      }
    }
  } else {
    // Stereo interleaved: split into left and right
    const frameCount = Math.floor(samples.length / 2);
    const left = new Int16Array(frameCount);
    const right = new Int16Array(frameCount);
    for (let i = 0; i < frameCount; i++) {
      left[i] = samples[i * 2];
      right[i] = samples[i * 2 + 1];
    }
    for (let i = 0; i < frameCount; i += blockSize) {
      const leftChunk = left.subarray(i, i + blockSize);
      const rightChunk = right.subarray(i, i + blockSize);
      const mp3buf = encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf && mp3buf.length > 0) {
        mp3Chunks.push(new Uint8Array(mp3buf));
      }
    }
  }

  const flush = encoder.flush();
  if (flush && flush.length > 0) {
    mp3Chunks.push(new Uint8Array(flush));
  }

  // Concatenate all chunks into a single Uint8Array
  const totalLength = mp3Chunks.reduce((acc, curr) => acc + curr.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of mp3Chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Converts a data URL or Blob (WAV audio) to a genuine MP3 Blob.
 */
export async function convertWavToMp3Blob(audioSource: string | Blob): Promise<Blob> {
  let arrayBuffer: ArrayBuffer;

  if (typeof audioSource === 'string') {
    // Handle data URL or http URL
    if (audioSource.startsWith('data:')) {
      const base64Part = audioSource.split(',')[1];
      const binaryString = atob(base64Part);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      arrayBuffer = bytes.buffer;
    } else {
      const res = await fetch(audioSource);
      arrayBuffer = await res.arrayBuffer();
    }
  } else {
    arrayBuffer = await audioSource.arrayBuffer();
  }

  // Method 1: Try Web Audio API if available (handles various sample rates, resamplings, channel counts)
  if (typeof window !== 'undefined' && (window.AudioContext || (window as any).webkitAudioContext)) {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      const decoded = await audioCtx.decodeAudioData(arrayBuffer.slice(0));

      const numChannels = decoded.numberOfChannels;
      const sampleRate = decoded.sampleRate;
      const encoder = new Mp3Encoder(numChannels, sampleRate, 128);
      const mp3Chunks: Uint8Array[] = [];
      const blockSize = 1152;

      if (numChannels === 1) {
        const floatData = decoded.getChannelData(0);
        const int16 = new Int16Array(floatData.length);
        for (let i = 0; i < floatData.length; i++) {
          const s = Math.max(-1, Math.min(1, floatData[i]));
          int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        for (let i = 0; i < int16.length; i += blockSize) {
          const chunk = int16.subarray(i, i + blockSize);
          const buf = encoder.encodeBuffer(chunk);
          if (buf && buf.length > 0) mp3Chunks.push(new Uint8Array(buf));
        }
      } else {
        const leftFloat = decoded.getChannelData(0);
        const rightFloat = decoded.getChannelData(1);
        const leftInt16 = new Int16Array(leftFloat.length);
        const rightInt16 = new Int16Array(rightFloat.length);

        for (let i = 0; i < leftFloat.length; i++) {
          const sL = Math.max(-1, Math.min(1, leftFloat[i]));
          leftInt16[i] = sL < 0 ? sL * 0x8000 : sL * 0x7fff;
          const sR = Math.max(-1, Math.min(1, rightFloat[i]));
          rightInt16[i] = sR < 0 ? sR * 0x8000 : sR * 0x7fff;
        }

        for (let i = 0; i < leftInt16.length; i += blockSize) {
          const leftChunk = leftInt16.subarray(i, i + blockSize);
          const rightChunk = rightInt16.subarray(i, i + blockSize);
          const buf = encoder.encodeBuffer(leftChunk, rightChunk);
          if (buf && buf.length > 0) mp3Chunks.push(new Uint8Array(buf));
        }
      }

      const flush = encoder.flush();
      if (flush && flush.length > 0) mp3Chunks.push(new Uint8Array(flush));

      audioCtx.close().catch(() => {});
      return new Blob(mp3Chunks as unknown as BlobPart[], { type: 'audio/mp3' });
    } catch (e) {
      console.warn('AudioContext decoding failed, falling back to direct WAV parser:', e);
    }
  }

  // Method 2: Direct standalone WAV parser
  const parsed = parseWavHeader(arrayBuffer);
  if (parsed) {
    const mp3Bytes = pcmInt16ToMp3(parsed.samples, parsed.channels, parsed.sampleRate, 128);
    return new Blob([mp3Bytes as unknown as BlobPart], { type: 'audio/mp3' });
  }

  // Fallback: If parsing fails, create MP3 blob from source
  return new Blob([arrayBuffer as unknown as BlobPart], { type: 'audio/mp3' });
}

/**
 * Triggers a browser file download for a given Blob or data URL.
 */
export function downloadBlob(blobOrUrl: Blob | string, filename: string): void {
  let url: string;
  let isCreatedUrl = false;

  if (typeof blobOrUrl === 'string') {
    url = blobOrUrl;
  } else {
    url = URL.createObjectURL(blobOrUrl);
    isCreatedUrl = true;
  }

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (isCreatedUrl) {
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
