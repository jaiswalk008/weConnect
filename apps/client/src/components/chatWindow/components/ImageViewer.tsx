import { useState } from 'react';
import { X, Minus, Plus } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Dialog, DialogContent } from '@workspace/ui/components/dialog';

interface ImageViewerProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
}

export const ImageViewer = ({ isOpen, onClose, imageUrl }: ImageViewerProps) => {
  const [currentScale, setCurrentScale] = useState(1);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[100vw] w-screen h-screen p-0 overflow-hidden bg-black/40 backdrop-blur-md border-none shadow-none flex flex-col data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-200'>
        <div className='relative w-full h-full flex-1 overflow-hidden'>
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={5}
            centerOnInit
            onTransformed={(e) => setCurrentScale(e.state.scale)}
          >
            {(utils: any) => {
              const { zoomIn, zoomOut, resetTransform, zoomTo } = utils;
              return (
                <>
                  <TransformComponent
                    wrapperStyle={{ width: '100%', height: '100%' }}
                    contentStyle={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt='Full view'
                      className='max-w-[95vw] max-h-[95vh] w-auto h-auto object-contain'
                      style={{ maxWidth: '100%', maxHeight: '100%' }}
                    />
                  </TransformComponent>

                  {/* Controls */}
                  <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/60 backdrop-blur-sm p-3 rounded-full text-white z-50 shadow-lg select-none'>
                    <button
                      onClick={() => zoomOut()}
                      className='p-1 hover:bg-white/20 rounded-full transition-colors'
                      title='Zoom Out'
                    >
                      <Minus className='w-5 h-5' />
                    </button>

                    {/* Slider */}
                    <div className='w-32 flex items-center'>
                      <input
                        type='range'
                        min='0.5'
                        max='5'
                        step='0.01'
                        value={currentScale}
                        className='w-full accent-white h-1 bg-white/30 rounded-lg appearance-none cursor-pointer'
                        onInput={(e) => {
                          const newScale = parseFloat((e.target as HTMLInputElement).value);
                          zoomTo(newScale, 0);
                          setCurrentScale(newScale);
                        }}
                        onChange={() => {}} // Suppress warning
                      />
                    </div>

                    <button
                      onClick={() => zoomIn()}
                      className='p-1 hover:bg-white/20 rounded-full transition-colors'
                      title='Zoom In'
                    >
                      <Plus className='w-5 h-5' />
                    </button>

                    <button
                      onClick={() => {
                        resetTransform();
                        setCurrentScale(1);
                      }}
                      className='ml-2 p-1 hover:bg-white/20 rounded-full transition-colors text-xs font-mono'
                      title='Reset'
                    >
                      1x
                    </button>
                  </div>
                </>
              );
            }}
          </TransformWrapper>

          <button
            onClick={onClose}
            className='fixed top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors'
          >
            <X className='w-6 h-6' />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
