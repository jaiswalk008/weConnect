export const ConnectionLoader = ({ isConnected }: { isConnected: boolean }) => {
  return (
    <div
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out ${
        !isConnected ? 'translate-y-4 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'
      }`}
    >
      <div className='backdrop-blur-md bg-white/10 dark:bg-black/10 border border-white/20 dark:border-white/10 rounded-full px-4 py-2 shadow-lg flex items-center gap-2'>
        {/* Spinning Loader */}
        <svg
          className='animate-spin h-4 w-4 text-muted-foreground'
          xmlns='http://www.w3.org/2000/svg'
          fill='none'
          viewBox='0 0 24 24'
        >
          <circle
            className='opacity-25'
            cx='12'
            cy='12'
            r='10'
            stroke='currentColor'
            strokeWidth='4'
          ></circle>
          <path
            className='opacity-75'
            fill='currentColor'
            d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
          ></path>
        </svg>

        {/* Text */}
        <span className='text-sm text-foreground/80 font-medium'>Connecting...</span>
      </div>
    </div>
  );
};
