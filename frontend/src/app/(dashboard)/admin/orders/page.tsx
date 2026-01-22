'use client';

export default function AdminOrdersPage() {
  return (
    <div className="bg-cream-white border-2 border-espresso-dark shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
      <div className="border-b-2 border-espresso-dark p-6 bg-vintage-paper flex justify-between items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-espresso-dark">Order Management</h1>
          <p className="font-mono text-xs text-mocha-medium mt-1">Viewing all records</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-espresso-dark text-cream-white font-mono text-xs uppercase tracking-wider hover:bg-mocha-medium transition-colors border border-espresso-dark">
            Export CSV
          </button>
          <button className="px-4 py-2 bg-transparent text-espresso-dark font-mono text-xs uppercase tracking-wider hover:bg-black/5 transition-colors border border-espresso-dark">
            Filter
          </button>
        </div>
      </div>
      
      <div className="p-8 text-center text-mocha-medium font-mono">
        Orders table coming soon...
      </div>
    </div>
  );
}
