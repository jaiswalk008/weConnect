import { useEffect, useRef } from 'react';
import { useCall } from '@/context/CallContext';

export const AudioWave = () => {
  const { status, isMuted } = useCall();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (status !== 'active' || isMuted) {
      return;
    }

    let audioContext: AudioContext;
    let analyzer: AnalyserNode;
    let microphone: MediaStreamAudioSourceNode;
    let animationFrame: number;
    let stream: MediaStream;

    const setupAudio = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        analyzer = audioContext.createAnalyser();
        microphone = audioContext.createMediaStreamSource(stream);
        
        analyzer.fftSize = 64; // Using a low number to easily get a few frequency bins
        microphone.connect(analyzer);
        
        const bufferLength = analyzer.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        const draw = () => {
          if (!canvasRef.current || isMuted) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (!ctx) return;
          
          animationFrame = requestAnimationFrame(draw);
          analyzer.getByteFrequencyData(dataArray);
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Let's create about 10 bars
          const noOfBars = 10;
          const barWidth = canvas.width / noOfBars - 2;
          let x = 0;
          
          for (let i = 0; i < noOfBars; i++) {
            // we will sample the frequency
            // map i to index in dataArray
            const dataIndex = Math.floor((i / noOfBars) * bufferLength);
            const value = dataArray[dataIndex] || 0;
            
            // Map 0-255 to canvas height with minimum height of 4px
            const minHeight = 4;
            let barHeight = (value / 255) * canvas.height;
            if (barHeight < minHeight) {
                barHeight = minHeight;
            }
            
            ctx.fillStyle = `rgba(34, 197, 94, 0.8)`; // Tailwind green-500
            
            ctx.beginPath();
            ctx.roundRect(x, canvas.height - barHeight, barWidth, barHeight, 2);
            ctx.fill();
            
            x += barWidth + 2;
          }
        };
        
        draw();
      } catch (err) {
        console.error("Error accessing microphone for wave visualization:", err);
      }
    };
    
    // Slight delay to ensure UI is ready
    const timeoutId = setTimeout(setupAudio, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (audioContext && audioContext.state !== 'closed') {
        audioContext.close();
      }
    };
  }, [status, isMuted]);

  if (status !== 'active') return null;

  return (
    <div className='flex items-end justify-center h-12 w-full max-w-[150px]'>
      {isMuted ? (
        <div className='flex items-end gap-[2px] h-full w-full'>
          {[...Array(10)].map((_, i) => (
            <div key={i} className='bg-green-500/30 rounded-full' style={{ width: 'calc(10% - 2px)', height: '4px' }} />
          ))}
        </div>
      ) : (
        <canvas 
          ref={canvasRef} 
          width={150} 
          height={48} 
          className='w-full h-full'
        />
      )}
    </div>
  );
};
