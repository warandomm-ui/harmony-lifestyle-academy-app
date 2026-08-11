import { describe, expect, it } from 'vitest';
import { createBlob, decode, encode } from './audioUtils';

describe('encode/decode', () => {
  it('round-trips arbitrary byte arrays through base64', () => {
    const original = new Uint8Array([0, 1, 2, 127, 128, 255]);
    const roundTripped = decode(encode(original));
    expect(Array.from(roundTripped)).toEqual(Array.from(original));
  });

  it('round-trips an empty array', () => {
    const original = new Uint8Array([]);
    expect(decode(encode(original))).toEqual(original);
  });
});

describe('createBlob', () => {
  it('scales Float32 samples into 16-bit PCM range and reports the expected mimeType', () => {
    const samples = new Float32Array([0, 0.5, -0.5, 1, -1]);
    const result = createBlob(samples);

    expect(result.mimeType).toBe('audio/pcm;rate=16000');

    const pcmBytes = decode(result.data);
    const int16 = new Int16Array(pcmBytes.buffer);
    expect(int16.length).toBe(samples.length);
    expect(int16[0]).toBe(0);
    expect(int16[1]).toBe(Math.round(0.5 * 32768));
  });
});
