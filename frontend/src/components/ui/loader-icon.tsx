import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoaderIconProps extends React.SVGProps<SVGSVGElement> {}

export function LoaderIcon({ className, ...props }: LoaderIconProps) {
  return (
    <Loader2 
      className={cn("animate-spin", className)} 
      {...props} 
    />
  );
}
