interface BeanBounceProps {
  count?: number;
  delay?: number;
}

interface BeanProps {
  delay: number;
}

function Bean({ delay }: BeanProps) {
  return (
    <div
      className="bean"
      style={{
        width: '16px',
        height: '24px',
        background: 'rgb(var(--color-mocha-medium))',
        borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        position: 'relative',
        animation: `beanBounce 2s ease-in-out infinite`,
        animationDelay: `${delay}s`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '2px',
          height: '40%',
          background: 'rgb(var(--color-espresso-dark))',
          borderRadius: '50%',
        }}
      />
    </div>
  );
}

export function BeanBounce({
  count = 3,
  delay,
}: BeanBounceProps) {
  const delays = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.4, 1.6, 1.8];
  
  return (
    <>
      <style jsx>{`
        @keyframes beanBounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .bean {
            animation: none !important;
          }
        }
      `}</style>
      <div
        className="beans"
        style={{
          display: 'flex',
          gap: 'var(--spacing-3)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {Array.from({ length: count }).map((_, index) => {
          const beanDelay: number = delay !== undefined ? delay : (delays[index % delays.length] as number);
          return (
            <Bean
              key={index}
              delay={beanDelay}
            />
          );
        })}
      </div>
    </>
  );
}
