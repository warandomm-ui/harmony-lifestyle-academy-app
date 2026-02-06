import React from 'react';
import { cn } from '@/lib/utils';

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={cn("fixed inset-0 z-[-1] overflow-hidden pointer-events-none", className)}>
      {/* Main gradient blobs */}
      <div 
        className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-blob opacity-60"
        style={{ backgroundColor: 'var(--blob-1)' }}
      />
      <div 
        className="absolute top-[20%] right-[-15%] w-[45%] h-[45%] rounded-full blur-[120px] animate-blob animation-delay-2000 opacity-50"
        style={{ backgroundColor: 'var(--blob-2)' }}
      />
      <div 
        className="absolute bottom-[-10%] left-[15%] w-[55%] h-[55%] rounded-full blur-[120px] animate-blob animation-delay-4000 opacity-50"
        style={{ backgroundColor: 'var(--blob-3)' }}
      />
      
      {/* Subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
