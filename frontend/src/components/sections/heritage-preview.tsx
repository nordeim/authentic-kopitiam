'use client';

export function HeritagePreview() {
  return (
    <section id="heritage" className="heritage py-20 relative overflow-hidden bg-sunrise-amber">
      {/* Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(61,43,31,0.03)_2px,rgba(61,43,31,0.03)_4px)]"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 text-espresso-dark">Our Kopitiam Heritage</h2>
          <p className="text-lg text-mocha-medium">Preserving Singapore's coffee culture since 1973</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="text-espresso-dark">
            <p className="text-xl leading-relaxed mb-6">
              <span className="float-left font-display text-6xl font-extrabold text-terracotta-warm mr-4 leading-none">I</span>
              n 1973, Uncle Lim opened his first kopitiam stall at Tiong Bahru Market. With nothing but a trusty coffee sock, a worn marble table, and recipes passed down through generations, he began serving what would become Singapore's most beloved morning ritual.
            </p>

            <div className="bg-white/30 rounded-2xl p-8 my-8 relative border-3 border-dashed border-terracotta-warm">
              <blockquote className="font-display text-xl italic leading-relaxed mb-4 relative z-10">
                "The kopitiam is more than just a place to drink coffee. It's where lawyers and laborers sit side by side, where deals are made and friendships are forged over steaming cups of kopi."
              </blockquote>
              <footer className="font-bold text-terracotta-warm text-right">— Uncle Lim, Founder</footer>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              {[
                { icon: '☕', title: 'Authentic Recipes', text: "Uncle Lim's 1973 recipes" },
                { icon: '🤝', title: 'Community First', text: '3 generations served' },
                { icon: '🌱', title: 'Sustainable', text: 'Direct ASEAN partnerships' },
              ].map((val, i) => (
                <div key={i} className="text-center p-4 bg-white/20 rounded-xl">
                  <div className="text-4xl mb-2">{val.icon}</div>
                  <h4 className="font-bold text-espresso-dark mb-1">{val.title}</h4>
                  <p className="text-xs text-mocha-medium">{val.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { year: '1973', caption: "Uncle Lim's first stall", rotate: '-rotate-2' },
              { year: '1980s', caption: 'Vintage cup collection', rotate: 'rotate-3' },
              { year: 'Today', caption: 'Modern Tiong Bahru café', rotate: '-rotate-1' },
            ].map((photo, i) => (
              <div key={i} className={`bg-cream-white p-3 pb-8 rounded-xl shadow-lg transform transition-transform duration-300 hover:rotate-0 hover:scale-105 hover:z-10 ${photo.rotate} ${i === 2 ? 'sm:col-span-2 sm:w-2/3 sm:mx-auto' : ''}`}>
                <div className="w-full h-40 bg-gradient-to-br from-honey-light to-cinnamon-glow rounded-lg flex items-center justify-center font-display text-2xl text-mocha-medium">
                  {photo.year}
                </div>
                <p className="text-center font-display text-sm text-mocha-medium mt-3">{photo.caption}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 bg-espresso-dark text-cream-white rounded-3xl p-10 text-center">
          <h3 className="font-display text-2xl font-bold mb-3">Join Our Morning Tradition</h3>
          <p className="opacity-90 max-w-lg mx-auto mb-6">Experience the authentic kopitiam culture. Every visit includes a complimentary taste of our signature kaya.</p>
          <a href="/locations" className="inline-block px-6 py-3 border-2 border-cream-white rounded-full font-bold hover:bg-cream-white hover:text-espresso-dark transition-colors">
            Visit Us Today
          </a>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0 h-20 overflow-hidden">
        <svg viewBox="0 0 1440 120" preserveAspectRatio="none" className="absolute bottom-0 w-full h-full">
          <path d="M0,40 C360,120 720,0 1080,80 C1260,120 1380,60 1440,40 L1440,120 L0,120 Z" fill="#8FA68A"/>
        </svg>
      </div>
    </section>
  );
}
