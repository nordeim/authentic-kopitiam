interface SteamRiseProps {
  count?: number;
  particleSize?: number;
}

interface SteamParticleProps {
  delay: number;
  x: number;
  size: number;
}

function SteamParticle({ delay, x, size }: SteamParticleProps) {
  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: 'rgba(255,255,255, 0.7)',
        borderRadius: '50%',
        animation: `steamRise 2s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        position: 'relative',
        left: `${x}px`,
      }}
    />
  );
}

export function SteamRise({
  count = 3,
  particleSize = 8,
}: SteamRiseProps) {
  const particles: Array<{ delay: number; x: number }> = [
    { delay: 0, x: -15 },
    { delay: 0.3, x: 0 },
    { delay: 0.6, x: 15 },
  ];

  return (
    <>
      <style jsx>{`
        @keyframes steamRise {
          0% {
            opacity: 0;
            transform: translateY(0) scale(1);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(-30px) scale(0.5);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .steam-particle {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="steam"
        style={{
          position: 'relative',
          display: 'flex',
          gap: 'var(--space-2)',
        }}
      >
        {particles.slice(0, count).map((particle, index) => (
          <SteamParticle
            key={index}
            delay={particle.delay}
            x={particle.x}
            size={particleSize}
          />
        ))}
      </div>
    </>
  );
}
