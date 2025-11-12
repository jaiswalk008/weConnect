import { Loader2 } from 'lucide-react';

const Spinner = ({ color = 'text-foreground' }: { color?: string }) => {
  return (
    <div className='flex items-center justify-center'>
      <Loader2 className={`animate-spin h-8 w-8 ${color}`} />
    </div>
  );
};
export default Spinner;
