interface MapMarkerProps {
  color?: string;
  delay?: number;
  size?: number;
}

export function MapMarker({
  color = 'rgb(var(--color-coral-pop))',
  delay = 0,
  size = 24,
}: MapMarkerProps) {
  const rgbColor = color.replace(/rgb\(([^)]+)\)/, '$1');
  
  return (
    <>
      <style jsx>{`
        @keyframes markerPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .map-marker {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="map-marker"
        style={{
          position: 'relative',
          width: `${size}px`,
          height: `${size}px`,
          display: 'inline-block',
          animation: `markerPulse 2s ease-in-out infinite`,
          animationDelay: `${delay}s`,
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: color,
            borderRadius: '50%',
            boxShadow: `
              0 0 0 8px rgba(${rgbColor}, 0.3),
              0 0 0 16px rgba(${rgbColor}, 0.1)
            `,
          }}
        />
      </div>
    </>
  );
}
