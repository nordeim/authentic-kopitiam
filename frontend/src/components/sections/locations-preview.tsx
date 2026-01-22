'use client';

export function LocationsPreview() {
  return (
    <section id="locations" className="locations py-20 relative overflow-hidden bg-sage-fresh">
      {/* Texture */}
      <div className="absolute inset-0 pointer-events-none opacity-15" style={{ backgroundImage: 'var(--texture-circles)', backgroundSize: '100px 100px' }} />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-3 text-cream-white">Find Your Nearest Kopitiam</h2>
          <p className="text-lg text-white/90">Three locations across Singapore, each with its own unique character</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <article className="bg-cream-white rounded-3xl overflow-hidden shadow-lg transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
            <div className="flex justify-between items-center p-4 bg-espresso-dark">
              <h3 className="text-xl font-bold text-cream-white m-0">Tiong Bahru</h3>
              <span className="text-xs font-bold uppercase tracking-widest text-espresso-dark bg-sunrise-amber px-2 py-1 rounded-full">Flagship</span>
            </div>
            <div className="h-44 bg-gradient-to-br from-sage-fresh to-honey-light flex items-center justify-center text-5xl">
              ☕
            </div>
            <div className="p-6">
              <p className="font-bold mb-2 text-espresso-dark">55 Tiong Bahru Road, #01-55</p>
              <p className="text-sm text-mocha-medium mb-4">Daily: 7:00 AM - 8:00 PM</p>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-mocha-medium flex items-center gap-2">🍳 Full Breakfast Menu</span>
                <span className="text-sm text-mocha-medium flex items-center gap-2">♿ Wheelchair Accessible</span>
                <span className="text-sm text-mocha-medium flex items-center gap-2">🅿️ Parking Available</span>
              </div>
            </div>
            <div className="flex gap-3 p-4 bg-vintage-paper border-t-2 border-dashed border-butter-toast">
              <a href="#" className="flex-1 text-center py-2 rounded-lg font-bold text-sm bg-espresso-dark text-cream-white hover:bg-coral-pop transition-colors">Get Directions</a>
              <a href="#" className="flex-1 text-center py-2 rounded-lg font-bold text-sm bg-transparent text-espresso-dark border-2 border-espresso-dark hover:bg-espresso-dark hover:text-cream-white transition-colors">Reserve</a>
            </div>
          </article>
        </div>

        {/* Map Placeholder */}
        <div className="mt-12 h-96 bg-white/20 rounded-3xl flex flex-col items-center justify-center relative border-3 border-dashed border-white/30">
          <h3 className="text-2xl font-bold text-cream-white mb-2">Interactive Map</h3>
          <p className="text-white/80">Coming Soon</p>
          <div className="flex gap-8 mt-6">
            <div className="w-6 h-6 bg-coral-pop rounded-full animate-marker-pulse shadow-[0_0_0_8px_rgba(255,123,84,0.3)]"></div>
            <div className="w-6 h-6 bg-coral-pop rounded-full animate-marker-pulse shadow-[0_0_0_8px_rgba(255,123,84,0.3)] delay-300"></div>
            <div className="w-6 h-6 bg-coral-pop rounded-full animate-marker-pulse shadow-[0_0_0_8px_rgba(255,123,84,0.3)] delay-500"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
