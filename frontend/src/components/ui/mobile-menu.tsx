'use client';

import Link from 'next/link';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  href: string;
}

const MOBILE_NAV_ITEMS: NavItem[] = [
  { label: 'Menu', href: '/menu' },
  { label: 'Our Story', href: '/heritage' },
  { label: 'Visit Us', href: '/locations' },
  { label: 'Order', href: '/#order' },
];

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <div
      id="mobile-menu"
      className={`mobile-menu ${isOpen ? 'is-open' : ''}`}
      aria-hidden={!isOpen}
      aria-label="Mobile navigation menu"
      role="dialog"
      data-open={isOpen}
    >
      <button
        onClick={onClose}
        className="mobile-menu__close"
        aria-label="Close menu"
      >
        ×
      </button>

      {MOBILE_NAV_ITEMS.map(item => (
        <Link
          key={item.href}
          href={item.href}
          className="mobile-menu__link"
          onClick={onClose}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}