import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';

interface AudioPlayerProps {
  src: string;
  isSender: boolean;
}

export const AudioPlayer = ({ src, isSender }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [waveform, setWaveform] = useState<number[]>([]);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const requestRef = useRef<number>();

  useEffect(() => {
    // Generate a beautiful, rounded simulated waveform consisting of 40 bars
    const arr = [];
    for (let i = 0; i < 40; i++) {
       const val = 15 + Math.random() * 85; 
       arr.push(val);
    }
    // smooth it slightly
    for (let i = 1; i < 39; i++) {
        arr[i] = (arr[i-1] + arr[i] + arr[i+1]) / 3;
    }
    setWaveform(arr);
  }, []);

  const updateProgress = () => {
    if (audioRef.current && audioRef.current.duration) {
      setCurrentTime(audioRef.current.currentTime);
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
      requestRef.current = requestAnimationFrame(updateProgress);
    }
  };

  // Initialize audio
  useEffect(() => {
    const audio = new Audio(src);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('play', () => {
      setIsPlaying(true);
      requestRef.current = requestAnimationFrame(updateProgress);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    });

    return () => {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [src]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };
  
  const handlePlaybackRate = () => {
     if (!audioRef.current) return;
     let nextRate = playbackRate;
     if (playbackRate === 1) nextRate = 1.5;
     else if (playbackRate === 1.5) nextRate = 2;
     else nextRate = 1;
     
     audioRef.current.playbackRate = nextRate;
     setPlaybackRate(nextRate);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || !isFinite(timeInSeconds)) return '0:00';
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Click on waveform to seek
  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !duration) return;
    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = Math.max(0, Math.min(1, x / bounds.width));
    
    // Update audio currentTime
    audioRef.current.currentTime = percentage * duration;
    setCurrentTime(percentage * duration);
    setProgress(percentage * 100);
  };

  return (
    <div className={`flex flex-col gap-2 p-1.5 md:p-2 max-w-[260px] md:max-w-sm rounded-2xl ${
        isSender 
          ? 'bg-primary-foreground/5 text-primary-foreground' 
          : 'bg-background/60 text-foreground shadow-sm'
      }`}
    >
      <div className="flex items-center gap-3">
          <button
            onClick={togglePlayPause}
            className={`flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              isSender 
                ? 'bg-primary-foreground text-primary shadow-md hover:shadow-lg' 
                : 'bg-primary text-primary-foreground shadow-md hover:shadow-lg'
            }`}
          >
            {isPlaying ? (
              <Pause className='w-5 h-5 fill-current' />
            ) : (
              <Play className='w-5 h-5 fill-current ml-1' />
            )}
          </button>

          <div className='flex flex-col flex-1 gap-1.5 min-w-[150px]'>
            {/* Waveform */}
            <div 
              className="relative h-8 w-full cursor-pointer group"
              onClick={handleWaveformClick}
            >
              {/* Base Waveform (Unplayed) */}
              <div className="absolute inset-0 flex items-center gap-[2px]">
                {waveform.map((height, i) => (
                  <div
                    key={`base-${i}`}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${height}%`,
                      minHeight: '4px',
                      backgroundColor: isSender ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.15)'
                    }}
                  />
                ))}
              </div>

              {/* Active Waveform (Played) */}
              <div 
                className="absolute inset-0 flex items-center gap-[2px]"
                style={{ clipPath: `inset(0% ${100 - progress}% 0% 0%)` }}
              >
                {waveform.map((height, i) => (
                  <div
                    key={`active-${i}`}
                    className="flex-1 rounded-full"
                    style={{
                      height: `${height}%`,
                      minHeight: '4px',
                      backgroundColor: isSender ? '#ffffff' : 'hsl(var(--primary))'
                    }}
                  />
                ))}
              </div>
            </div>

            <div className={`flex justify-between items-center text-[11px] font-semibold tracking-wide uppercase ${
                isSender ? 'text-primary-foreground/80' : 'text-muted-foreground'
              }`}>
              <span>{formatTime(currentTime)}</span>
              
              <div className="flex items-center gap-2">
                 <button 
                   onClick={handlePlaybackRate}
                   className={`px-1.5 py-0.5 rounded-[4px] text-[10px] transition-colors ${
                      playbackRate !== 1 
                        ? (isSender ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-primary/20 text-primary') 
                        : 'hover:bg-black/10'
                   }`}
                 >
                   {playbackRate}x
                 </button>
                 <span>{duration ? formatTime(duration) : '0:00'}</span>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
};
