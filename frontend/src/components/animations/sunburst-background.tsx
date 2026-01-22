'use client';

interface SunburstBackgroundProps {
  opacity?: number;
  duration?: number;
}

export function SunburstBackground({
  opacity = 0.6,
  duration = 120,
}: SunburstBackgroundProps) {
  return (
    <>
      <style jsx global>{`
        @keyframes slowRotate {
          from {
            transform: translateX(-50%) rotate(0deg);
          }
          to {
            transform: translateX(-50%) rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .sunburst-background {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="sunburst-background pointer-events-none absolute top-[-50%] left-1/2 w-[200%] h-[200%] z-0"
        style={{
          transform: 'translateX(-50%)',
          backgroundImage: 'var(--texture-sunburst)',
          backgroundSize: '800px 800px',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: opacity,
          animation: `slowRotate ${duration}s linear infinite`,
        }}
      />
    </>
  );
}