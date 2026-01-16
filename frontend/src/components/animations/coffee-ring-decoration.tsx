interface CoffeeRingProps {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  size?: number;
  opacity?: number;
  rotation?: number;
}

interface CoffeeRingDecorationProps {
  rings: CoffeeRingProps[];
}

function CoffeeRing({
  top = 'auto',
  right = 'auto',
  bottom = 'auto',
  left = 'auto',
  size = 200,
  opacity = 0.1,
  rotation = 0,
}: CoffeeRingProps) {
  return (
    <div
      className="coffee-ring"
      style={{
        position: 'absolute',
        width: `${size}px`,
        height: `${size}px`,
        border: '3px solid rgb(var(--color-espresso-dark))',
        borderRadius: '50%',
        opacity,
        transform: `rotate(${rotation}deg)`,
        top,
        right,
        bottom,
        left,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

export function CoffeeRingDecoration({ rings }: CoffeeRingDecorationProps) {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      {rings.map((ring, index) => (
        <CoffeeRing key={index} {...ring} />
      ))}
    </div>
  );
}
