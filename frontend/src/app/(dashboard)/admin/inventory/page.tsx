'use client';

export default function AdminInventoryPage() {
  return (
    <div className="bg-cream-white border-2 border-espresso-dark shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
      <div className="border-b-2 border-espresso-dark p-6 bg-vintage-paper flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso-dark">Inventory Control</h1>
          <p className="font-mono text-xs text-mocha-medium mt-1">Real-time stock tracking</p>
        </div>
        <button className="px-4 py-2 bg-sunrise-amber text-espresso-dark font-mono text-xs uppercase tracking-wider font-bold hover:bg-terracotta-warm hover:text-cream-white transition-colors border border-espresso-dark">
          + Add Item
        </button>
      </div>
      
      <div className="p-8 text-center text-mocha-medium font-mono">
        Inventory table coming soon...
      </div>
    </div>
  );
}
