'use client';

interface SunburstBackgroundProps {
  color1?: string;
  color2?: string;
  duration?: number;
}

export function SunburstBackground({
  color1 = 'var(--color-sunrise-amber)',
  color2 = 'var(--color-cream-white)',
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
        className="sunburst-background"
        style={{
          position: 'absolute',
          top: '-50%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '200%',
          height: '200%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `repeating-conic-gradient(
              from 0deg,
              ${color1} 0deg 10deg,
              ${color2} 10deg 20deg
            )`,
            opacity: 0.6,
            animation: `slowRotate ${duration}s linear infinite`,
          }}
        />
      </div>
    </>
  );
}
