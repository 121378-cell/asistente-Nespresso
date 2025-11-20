
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playPcmAudio(base64Audio: string, sampleRate: number = 24000) {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate });
    const audioData = decodeBase64(base64Audio);
    
    // Convertir Uint8Array (raw bytes) a Float32Array para el AudioBuffer
    // Asumimos que el output es PCM 16-bit Little Endian mono (estándar de Gemini TTS)
    const dataInt16 = new Int16Array(audioData.buffer);
    const float32Data = new Float32Array(dataInt16.length);
    
    for (let i = 0; i < dataInt16.length; i++) {
      float32Data[i] = dataInt16[i] / 32768.0;
    }

    const audioBuffer = audioContext.createBuffer(1, float32Data.length, sampleRate);
    audioBuffer.getChannelData(0).set(float32Data);

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start(0);
    
    return new Promise<void>((resolve) => {
        source.onended = () => {
            source.disconnect();
            audioContext.close();
            resolve();
        }
    });

  } catch (error) {
    console.error("Error playing audio:", error);
    throw error;
  }
}
