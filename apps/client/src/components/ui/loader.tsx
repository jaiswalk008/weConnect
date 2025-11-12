import { Loader2 } from 'lucide-react';

interface LoaderProps {
  showLoader: boolean;
}

const Loader = ({ showLoader }: LoaderProps) => {
  if (!showLoader) return null;

  return (
    <div className='fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50'>
      <Loader2 className='animate-spin h-8 w-8 text-primary' />
    </div>
  );
};

export default Loader;
