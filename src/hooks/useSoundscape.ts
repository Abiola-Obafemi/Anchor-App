import { useState, useEffect, useRef } from 'react';

export type SoundscapeType = 'none' | 'rain' | 'forest' | 'white-noise';

const SOUNDSCAPE_URLS: Record<string, string> = {
  'rain': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Placeholder, real apps would use specific loops
  'forest': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  'white-noise': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
};

// Note: In a real app, you'd use actual looping ambient sounds. 
// For this demo, I'll use placeholders that simulate the behavior.

export function useSoundscape() {
  const [type, setType] = useState<SoundscapeType>('none');
  const [volume, setVolume] = useState(0.5);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (type === 'none') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      setIsPlaying(false);
      return;
    }

    const audio = new Audio(SOUNDSCAPE_URLS[type]);
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;

    if (isPlaying) {
      audio.play().catch(console.error);
    }

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, [type]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = (force?: boolean) => {
    const next = force !== undefined ? force : !isPlaying;
    setIsPlaying(next);
    if (audioRef.current) {
      if (next) audioRef.current.play().catch(console.error);
      else audioRef.current.pause();
    }
  };

  return { type, setType, volume, setVolume, isPlaying, togglePlay };
}
