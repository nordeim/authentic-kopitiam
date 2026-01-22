'use client';

import { RetroButton } from '@/components/ui/retro-button';

export function MenuPreview() {
  const products = [
    {
      name: 'Traditional Kopi',
      price: '$3.50',
      description: 'Strong coffee brewed with margarine and sugar, served with evaporated milk.',
      tag: 'House Specialty',
      rating: '★★☆',
      id: 'kopi',
      category: 'coffee'
    },
    {
      name: 'Kopi-C',
      price: '$3.20',
      description: 'Coffee with evaporated milk and sugar. Creamy, sweet, and perfectly balanced.',
      tag: 'Best Seller',
      rating: '★☆☆',
      id: 'kopi-c',
      category: 'coffee'
    },
    {
      name: 'Kaya Toast Set',
      price: '$5.50',
      description: 'Crispy toast with house-made coconut jam and butter. Served with soft-boiled eggs.',
      tag: 'Breakfast Classic',
      rating: '☆☆☆',
      id: 'kaya-toast',
      category: 'food'
    }
  ];

  return (
    <section id="menu" className="menu py-20 relative overflow-hidden bg-terracotta-warm text-cream-white">
      {/* Background Pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-30" 
           style={{ backgroundImage: 'var(--texture-arcs)', backgroundSize: '60px 60px' }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 text-cream-white">Our Signature Brews</h2>
          <p className="text-lg opacity-90 max-w-lg mx-auto">Crafted with beans roasted in-house since 1973</p>
          <div className="flex items-center justify-center gap-4 mt-4">
            <span className="w-16 h-1 bg-sunrise-amber rounded-full"></span>
            <svg className="w-8 h-8 fill-sunrise-amber" viewBox="0 0 32 32">
              <path d="M16 2C9.4 2 4 7.4 4 14c0 5.2 3.4 9.6 8 11.2V26h8v-0.8c4.6-1.6 8-6 8-11.2 0-6.6-5.4-12-12-12zm0 4c4.4 0 8 3.6 8 8s-3.6 8-8 8-8-3.6-8-8 3.6-8 8-8z"/>
            </svg>
            <span className="w-16 h-1 bg-sunrise-amber rounded-full"></span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <article key={product.id} className="menu-card bg-cream-white rounded-2xl overflow-hidden shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-glow group">
              {/* Top Border Accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-sunrise-amber via-transparent to-transparent bg-[length:20px_100%]"></div>
              
              <div className="h-48 bg-gradient-to-br from-honey-light to-butter-toast flex items-center justify-center relative overflow-hidden">
                <div className="flex gap-3 animate-bean-bounce">
                  <div className="w-4 h-6 bg-mocha-medium rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] relative before:content-[''] before:absolute before:top-[30%] before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:h-[40%] before:bg-espresso-dark before:rounded-full"></div>
                  <div className="w-4 h-6 bg-mocha-medium rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] relative before:content-[''] before:absolute before:top-[30%] before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:h-[40%] before:bg-espresso-dark before:rounded-full delay-100"></div>
                  <div className="w-4 h-6 bg-mocha-medium rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] relative before:content-[''] before:absolute before:top-[30%] before:left-1/2 before:-translate-x-1/2 before:w-0.5 before:h-[40%] before:bg-espresso-dark before:rounded-full delay-200"></div>
                </div>
              </div>

              <div className="p-6 text-espresso-dark">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-display text-xl font-bold">{product.name}</h3>
                  <span className="font-display font-bold text-lg text-terracotta-warm bg-honey-light px-3 py-1 rounded-full">{product.price}</span>
                </div>
                <p className="text-sm text-mocha-medium leading-relaxed mb-4">{product.description}</p>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-cream-white bg-coral-pop px-3 py-1 rounded-full">{product.tag}</span>
                  <span className="text-sm text-mocha-medium">{product.rating}</span>
                </div>
                <RetroButton variant="primary" className="w-full justify-center">
                  Add to Cart +
                </RetroButton>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <a href="/menu" className="inline-flex items-center gap-2 px-6 py-3 border-2 border-cream-white rounded-full font-display font-bold text-xl text-cream-white hover:bg-cream-white hover:text-terracotta-warm transition-all duration-300">
            View Full Menu →
          </a>
        </div>
      </div>

      {/* Wave Divider Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path d="M0,64 C480,0 960,120 1440,64 L1440,120 L0,120 Z" fill="#E8A857"/>
        </svg>
      </div>
    </section>
  );
}
