'use client';

export interface PolaroidPhoto {
  id: string;
  caption: string;
  imageUrl?: string;
  rotationOffset: number;
}

interface PolaroidGalleryProps {
  photos: PolaroidPhoto[];
}

export function PolaroidGallery({ photos }: PolaroidGalleryProps) {
  const rotationOffsets = [-2, 3, -1, 2];

  return (
    <>
      <style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          .polaroid {
            transform: rotate(0deg) !important;
          }
        }
      `}</style>
      <div
        className="polaroid-gallery"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 'var(--spacing-4)',
        }}
      >
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="polaroid"
            style={{
              background: 'rgb(var(--color-cream-white))',
              padding: 'var(--spacing-3)',
              paddingBottom: 'var(--spacing-8)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-lg)',
              transform: `rotate(${photo.rotationOffset ?? rotationOffsets[index % 4]}deg)`,
              transition: 'transform 0.3s var(--ease-smooth)',
            }}
          >
            <div
              style={{
                width: '100%',
                height: '150px',
                background: 'linear-gradient(135deg, rgb(var(--color-honey-light)), rgb(var(--color-cinnamon-glow)))',
                borderRadius: 'var(--radius-sm)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '1.5rem',
                color: 'rgb(var(--color-mocha-medium))',
              }}
            >
              {photo.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.imageUrl}
                  alt={photo.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                  }}
                />
              ) : null}
            </div>
            <div
              style={{
                textAlign: 'center',
                fontFamily: 'var(--font-display)',
                fontSize: '0.875rem',
                color: 'rgb(var(--color-mocha-medium))',
                marginTop: 'var(--spacing-3)',
              }}
            >
              {photo.caption}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
