'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Menu } from 'lucide-react';
import { MobileMenu } from '@/components/ui/mobile-menu';
import { useCartStore } from '@/store/cart-store';

interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Menu', href: '/menu' as any },
  { label: 'Our Story', href: '/heritage' as any },
  { label: 'Visit Us', href: '/locations' as any },
  { label: 'Order', href: '/#order' as any },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const cartItemCount = useCartStore(state => state.items.reduce((sum, item) => sum + item.quantity, 0));

  useEffect(() => {
    if (isMobileMenuOpen || isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [isMobileMenuOpen, isCartOpen]);

  const handleEscapeKey = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsMobileMenuOpen(false);
      setIsCartOpen(false);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const mobileMenu = document.getElementById('mobile-menu');
    const menuToggle = document.querySelector('.menu-toggle');
    const cartBtn = document.querySelector('.cart-btn');
    const cartOverlay = document.getElementById('cart-overlay');

    // Only close mobile menu if click is outside BOTH the menu AND the toggle button
    if (mobileMenu && !mobileMenu.contains(target) && !menuToggle?.contains(target)) {
      setIsMobileMenuOpen(false);
    }

    // Only close cart if click is outside BOTH the cart overlay AND the cart button
    if (cartOverlay && !cartOverlay.contains(target) && !cartBtn?.contains(target)) {
      setIsCartOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscapeKey);
    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <>
      <header className="header" role="banner">
        <div className="header__inner">
          <Link href="/" className="logo" aria-label="Morning Brew Collective Home">
            <span className="logo__main">Morning Brew</span>
            <span className="logo__sub">Collective</span>
          </Link>

          <nav className="nav" aria-label="Main navigation">
            <ul className="nav__list">
              {NAV_ITEMS.map(item => (
                <li key={item.href}>
                  <Link href={item.href as any} className="nav__link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="header__actions">
            <button
              onClick={() => setIsCartOpen(true)}
              className="cart-btn"
              aria-label={`Shopping cart, ${cartItemCount} items`}
            >
              <ShoppingCart className="cart-btn__icon" />
              {cartItemCount > 0 && (
                <span className="cart-btn__count">
                  {cartItemCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="menu-toggle"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label="Toggle menu"
            >
              <Menu className="menu-toggle__icon" />
            </button>
          </div>
        </div>
      </header>

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  );
}
