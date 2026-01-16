'use client';

import { useState } from 'react';
import { RetroButton } from '@/components/ui/retro-button';
import { AnimatedSection } from '@/components/animations/animated-section';
import { BeanBounce } from '@/components/animations/bean-bounce';
import { WaveDivider } from '@/components/ui/wave-divider';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'coffee' | 'breakfast' | 'pastries' | 'sides';
  tags: string[];
  imageUrl?: string;
}

const MOCK_MENU_ITEMS: MenuItem[] = [
  {
    id: '1',
    name: 'Kopi O Kosong',
    description: 'Strong black coffee without sugar. The classic Singaporean brew.',
    price: 2.50,
    category: 'coffee',
    tags: ['Hot', 'Classic'],
  },
  {
    id: '2',
    name: 'Kopi-C',
    description: 'Coffee with evaporated milk and sugar. The creamy favorite.',
    price: 2.80,
    category: 'coffee',
    tags: ['Hot', 'Sweet'],
  },
  {
    id: '3',
    name: 'Kaya Toast',
    description: 'Traditional charcoal-grilled toast with coconut jam and butter.',
    price: 3.50,
    category: 'breakfast',
    tags: ['Classic', 'Hot'],
  },
  {
    id: '4',
    name: 'Half-Boiled Eggs',
    description: 'Soft-boiled eggs with soy sauce and white pepper.',
    price: 2.00,
    category: 'breakfast',
    tags: ['Classic'],
  },
  {
    id: '5',
    name: 'Butter Croissant',
    description: 'Flaky, buttery French pastry baked fresh daily.',
    price: 4.00,
    category: 'pastries',
    tags: ['Fresh', 'Daily'],
  },
  {
    id: '6',
    name: 'Pandan Cake',
    description: 'Traditional Malay sponge cake with coconut milk and pandan.',
    price: 2.50,
    category: 'pastries',
    tags: ['Traditional'],
  },
];

const CATEGORIES: Array<'All' | 'Coffee' | 'Breakfast' | 'Pastries' | 'Sides'> = [
  'All',
  'Coffee',
  'Breakfast',
  'Pastries',
  'Sides',
];

export default function MenuPage() {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Coffee' | 'Breakfast' | 'Pastries' | 'Sides'>('All');

  const filteredItems = activeFilter === 'All' 
    ? MOCK_MENU_ITEMS 
    : MOCK_MENU_ITEMS.filter(item => 
        activeFilter === 'Coffee' ? item.category === 'coffee' :
        activeFilter === 'Breakfast' ? item.category === 'breakfast' :
        activeFilter === 'Pastries' ? item.category === 'pastries' :
        item.category === 'sides'
      );

  return (
    <section id="menu" className="menu">
      <div className="container">
        <AnimatedSection delay={0} className="section-header">
          <h2 className="section-header__title">Our Signature Brews</h2>
          <p className="section-header__subtitle">
            Crafted with beans roasted in-house since 1973
          </p>
          <div className="section-header__decoration">
            <span className="section-header__line" />
            <span className="section-header__icon">☕</span>
            <span className="section-header__line" />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={100}>
          <div className="menu__filters">
            {CATEGORIES.map(category => (
              <button
                key={category}
                className={`filter-btn ${activeFilter === category ? 'active' : ''}`}
                onClick={() => setActiveFilter(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={200}>
          {filteredItems.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state__icon">🍳</span>
              <span className="empty-state__text">No items found in this category</span>
            </div>
          ) : (
            <div className="menu__grid">
              {filteredItems.map(item => (
                <div key={item.id} className="menu-card">
                  <div className="menu-card__image">
                    <BeanBounce count={3} />
                  </div>
                  <div className="menu-card__content">
                    <div className="menu-card__header">
                      <h3 className="menu-card__title">{item.name}</h3>
                      <span className="menu-card__price">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>
                    <p className="menu-card__description">
                      {item.description}
                    </p>
                    <div className="menu-card__meta">
                      <span className="menu-card__tag">{item.tags[0]}</span>
                      <span className="menu-card__spice">
                        {item.category}
                      </span>
                    </div>
                    <button className="add-to-cart">
                      <span className="add-to-cart__icon">+</span>
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </AnimatedSection>

        <AnimatedSection delay={300} className="menu__footer">
          <a href="#menu" className="menu__link">
            View Full Menu
            <span>→</span>
          </a>
        </AnimatedSection>
      </div>
    </section>
  );
}
