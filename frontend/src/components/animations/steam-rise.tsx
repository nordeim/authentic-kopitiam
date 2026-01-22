interface SteamRiseProps {
  count?: number;
  particleSize?: number;
}

interface SteamParticleProps {
  delay: number;
  x: number;
  size: number;
  baseX: number;
}

function SteamParticle({ delay, x, size, baseX }: SteamParticleProps) {
  return (
    <circle
      className="steam-particle"
      cx={baseX + x}
      cy={0}
      r={size / 2}
      fill="rgba(255,255,255, 0.7)"
      style={{
        animation: `steamRise 2s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transformBox: 'fill-box',
        transformOrigin: 'center',
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

  const gap = 8; // var(--spacing-2) approximation

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
      <g className="steam">
        {particles.slice(0, count).map((particle, index) => (
          <SteamParticle
            key={index}
            delay={particle.delay}
            x={particle.x}
            size={particleSize}
            baseX={index * (particleSize + gap)}
          />
        ))}
      </g>
    </>
  );
}
