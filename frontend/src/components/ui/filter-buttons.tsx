'use client';

import { useFilterStore, useFilterQuery } from '@/store/filter-store';

interface FilterButtonProps {
  category: string;
  isActive: boolean;
  onClick: () => void;
}

export function FilterButton({ category, isActive, onClick }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`filter-button ${isActive ? 'filter-button--active' : ''}`}
      aria-pressed={isActive}
      type="button"
    >
      <style jsx>{`
        .filter-button {
          padding: var(--space-2, 0.5rem) var(--space-3, 0.75rem);
          border: 2px solid rgb(var(--color-mocha-light));
          border-radius: var(--radius-full, 50%);
          background: rgb(var(--color-cream-white));
          color: rgb(var(--color-espresso-dark));
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .filter-button:hover {
          background: rgb(var(--color-honey-light));
          border-color: rgb(var(--color-honey-light));
          transform: translate(-1px, -1px);
        }

        .filter-button:focus-visible {
          outline: 2px solid rgb(var(--color-terracotta-warm));
          outline-offset: 2px;
        }

        .filter-button--active {
          background: rgb(var(--color-terracotta-warm));
          border-color: rgb(var(--color-terracotta-warm));
          color: rgb(var(--color-cream-white));
        }

        .filter-button--active:hover {
          background: rgb(var(--color-terracotta-warm-hover));
          border-color: rgb(var(--color-terracotta-warm-hover));
        }

        .filter-button--active:focus-visible {
          outline-color: rgb(var(--color-cream-white));
        }

        @media (prefers-reduced-motion: reduce) {
          .filter-button {
            transition: none;
            transform: none;
          }
        }
      `}</style>
      {category}
    </button>
  );
}

interface FilterButtonsProps {
  className?: string;
}

const CATEGORIES = ['All', 'Coffee', 'Breakfast', 'Pastries', 'Sides'] as const;

export function FilterButtons({ className = '' }: FilterButtonsProps) {
  const activeFilter = useFilterQuery();
  const setActiveFilter = useFilterStore((state) => state.setActiveFilter);

  return (
    <div className={`filter-buttons ${className}`}>
      <style jsx>{`
        .filter-buttons {
          display: flex;
          gap: var(--space-2, 0.5rem);
          flex-wrap: wrap;
          justify-content: center;
        }

        @media (min-width: 768px) {
          .filter-buttons {
            gap: var(--space-3, 0.75rem);
          }
        }
      `}</style>
      {CATEGORIES.map((category) => (
        <FilterButton
          key={category}
          category={category}
          isActive={activeFilter === category}
          onClick={() => setActiveFilter(category as any)}
        />
      ))}
    </div>
  );
}
