'use client';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: 'Menu', href: '#menu' },
  { label: 'Our Story', href: '#heritage' },
  { label: 'Visit Us', href: '#locations' },
  { label: 'Order', href: '#order' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <>
      <div
        id="mobile-menu"
        className="mobile-menu"
        aria-hidden={!isOpen}
        aria-label="Mobile navigation menu"
        role="dialog"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgb(var(--color-espresso-dark))',
          zIndex: 'var(--z-overlay)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-8)',
          transition: 'transform 0.5s var(--ease-smooth)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <button
          onClick={onClose}
          className="mobile-menu__close"
          aria-label="Close menu"
        >
          ×
        </button>

        {MOBILE_NAV_ITEMS.map(item => (
          <a
            key={item.href}
            href={item.href}
            className="mobile-menu__link"
            onClick={onClose}
          >
            {item.label}
          </a>
        ))}
      </div>

      <style jsx>{`
        .mobile-menu__close {
          position: absolute;
          top: var(--space-6);
          right: var(--space-6);
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          font: var(--font-display);
          font-size: 2rem;
          color: rgb(var(--color-cream-white));
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-full);
        }

        .mobile-menu__link {
          font: var(--font-display);
          font-size: 2rem;
          font-weight: 700;
          color: rgb(var(--color-cream-white));
          transition: color var(--duration-normal) var(--ease-smooth);
          text-decoration: none;
        }

        .mobile-menu__link:hover {
          color: rgb(var(--color-sunrise-amber));
        }
      `}</style>
    </>
  );
}
