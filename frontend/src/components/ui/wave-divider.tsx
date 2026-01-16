interface WaveDividerProps {
  flip?: boolean;
  fillColor?: string;
  height?: number;
}

export function WaveDivider({
  flip = false,
  fillColor = 'rgb(var(--color-terracotta-warm))',
  height = 80,
}: WaveDividerProps) {
  return (
    <div
      className="wave-divider"
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: flip ? 0 : 'auto',
        bottom: flip ? 'auto' : 0,
        height: `${height}px`,
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          height: '100%',
          fill: fillColor,
          transform: flip ? 'rotate(180deg)' : undefined,
        }}
      >
        <path d="M0,64 C480,150 960,0 1440,64 L1440,120 L0,120 Z" />
      </svg>
    </div>
  );
}
