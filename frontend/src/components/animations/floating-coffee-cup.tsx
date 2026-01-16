'use client';

import { SteamRise } from './steam-rise';

interface FloatingCoffeeCupProps {
  width?: number | string;
  className?: string;
}

export function FloatingCoffeeCup({
  width = 'clamp(200px, 30vw, 400px)',
  className = '',
}: FloatingCoffeeCupProps) {
  return (
    <>
      <style jsx>{`
        @keyframes gentleFloat {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(3deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .hero__illustration {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className={`hero__illustration ${className}`}
        style={{
          position: 'absolute',
          right: '5%',
          bottom: '10%',
          width,
          animation: 'gentleFloat 6s ease-in-out infinite',
        }}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 200 220"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
          }}
        >
          <g transform="translate(100, 20)">
            <SteamRise count={3} />
          </g>
          
          <ellipse
            cx={100}
            cy={70}
            rx={70}
            ry={20}
            fill="rgb(var(--color-terracotta-warm))"
          />
          
          <path
            d="M30 70 L40 180 Q100 200 160 180 L170 70"
            fill="rgb(var(--color-espresso-dark))"
          />
          
          <ellipse
            cx={100}
            cy={70}
            rx={60}
            ry={15}
            fill="rgb(var(--color-mocha-medium))"
          />
          
          <ellipse
            cx={100}
            cy={70}
            rx={55}
            ry={12}
            fill="rgb(var(--color-terracotta-warm))"
          />
          
          <path
            d="M165 90 Q200 90 200 130 Q200 170 165 170"
            fill="none"
            stroke="rgb(var(--color-espresso-dark))"
            strokeWidth={12}
            strokeLinecap="round"
          />
          
          <path
            d="M35 120 L165 120"
            stroke="rgb(var(--color-sunrise-amber))"
            strokeWidth={4}
            strokeDasharray="10 5"
          />
        </svg>
      </div>
    </>
  );
}
