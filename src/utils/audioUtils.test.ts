import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseWavHeader, pcmInt16ToMp3 } from './audioUtils';

describe('Audio Utils & MP3 Converter', () => {
  it('parses valid PCM WAV buffer correctly', () => {
    // Construct a standard 44-byte PCM WAV with 200 samples
    const sampleRate = 24000;
    const channels = 1;
    const numSamples = 200;
    const dataSize = numSamples * 2;
    const totalSize = 44 + dataSize;

    const buffer = new ArrayBuffer(totalSize);
    const dataView = new DataView(buffer);

    // RIFF header
    dataView.setUint8(0, 'R'.charCodeAt(0));
    dataView.setUint8(1, 'I'.charCodeAt(0));
    dataView.setUint8(2, 'F'.charCodeAt(0));
    dataView.setUint8(3, 'F'.charCodeAt(0));
    dataView.setUint32(4, 36 + dataSize, true);
    dataView.setUint8(8, 'W'.charCodeAt(0));
    dataView.setUint8(9, 'A'.charCodeAt(0));
    dataView.setUint8(10, 'V'.charCodeAt(0));
    dataView.setUint8(11, 'E'.charCodeAt(0));

    // fmt chunk
    dataView.setUint8(12, 'f'.charCodeAt(0));
    dataView.setUint8(13, 'm'.charCodeAt(0));
    dataView.setUint8(14, 't'.charCodeAt(0));
    dataView.setUint8(15, ' '.charCodeAt(0));
    dataView.setUint32(16, 16, true);
    dataView.setUint16(20, 1, true); // PCM format
    dataView.setUint16(22, channels, true);
    dataView.setUint32(24, sampleRate, true);
    dataView.setUint32(28, sampleRate * 2, true);
    dataView.setUint16(32, 2, true);
    dataView.setUint16(34, 16, true); // 16-bit

    // data chunk
    dataView.setUint8(36, 'd'.charCodeAt(0));
    dataView.setUint8(37, 'a'.charCodeAt(0));
    dataView.setUint8(38, 't'.charCodeAt(0));
    dataView.setUint8(39, 'a'.charCodeAt(0));
    dataView.setUint32(40, dataSize, true);

    // Fill some test samples
    for (let i = 0; i < numSamples; i++) {
      dataView.setInt16(44 + i * 2, i * 50, true);
    }

    const parsed = parseWavHeader(buffer);
    assert.ok(parsed, 'Parsed WAV should not be null');
    assert.strictEqual(parsed.channels, 1);
    assert.strictEqual(parsed.sampleRate, 24000);
    assert.strictEqual(parsed.bitsPerSample, 16);
    assert.strictEqual(parsed.samples.length, numSamples);
    assert.strictEqual(parsed.samples[10], 10 * 50);
  });

  it('encodes Int16 samples to MP3 Uint8Array', () => {
    const sampleRate = 24000;
    const channels = 1;
    const samples = new Int16Array(2400); // 100ms
    for (let i = 0; i < samples.length; i++) {
      samples[i] = Math.sin(i / 10) * 8000;
    }

    const mp3Bytes = pcmInt16ToMp3(samples, channels, sampleRate, 128);
    assert.ok(mp3Bytes instanceof Uint8Array);
    assert.ok(mp3Bytes.length > 0, 'MP3 bytes should not be empty');
    // Check standard MP3 frame sync: 0xFF followed by 0xFB/0xF3/0xE0 etc.
    assert.strictEqual(mp3Bytes[0], 0xFF, 'First byte of MP3 frame should be 0xFF');
  });

  it('returns null for non-WAV buffer', () => {
    const invalidBuffer = new ArrayBuffer(50);
    const parsed = parseWavHeader(invalidBuffer);
    assert.strictEqual(parsed, null);
  });
});
