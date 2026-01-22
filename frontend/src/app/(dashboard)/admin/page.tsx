'use client';

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-cream-white border-2 border-espresso-dark p-6 shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
          <h3 className="font-mono text-sm text-mocha-medium uppercase tracking-wider mb-2">Total Revenue</h3>
          <p className="font-mono text-3xl font-bold text-espresso-dark">$12,450.00</p>
          <div className="mt-4 text-xs font-mono text-sage-fresh flex items-center gap-1">
            <span>▲ 12%</span>
            <span className="text-mocha-medium">vs last month</span>
          </div>
        </div>
        
        <div className="bg-cream-white border-2 border-espresso-dark p-6 shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
          <h3 className="font-mono text-sm text-mocha-medium uppercase tracking-wider mb-2">Active Orders</h3>
          <p className="font-mono text-3xl font-bold text-espresso-dark">24</p>
          <div className="mt-4 text-xs font-mono text-coral-pop flex items-center gap-1">
            <span>● 4</span>
            <span className="text-mocha-medium">pending preparation</span>
          </div>
        </div>

        <div className="bg-cream-white border-2 border-espresso-dark p-6 shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
          <h3 className="font-mono text-sm text-mocha-medium uppercase tracking-wider mb-2">Inventory Alerts</h3>
          <p className="font-mono text-3xl font-bold text-espresso-dark">3</p>
          <div className="mt-4 text-xs font-mono text-terracotta-warm flex items-center gap-1">
            <span>⚠ Low Stock</span>
            <span className="text-mocha-medium">Kaya, Eggs, Milk</span>
          </div>
        </div>
      </div>

      {/* Recent Activity Ledger */}
      <div className="bg-cream-white border-2 border-espresso-dark shadow-[4px_4px_0px_0px_rgba(61,43,31,0.2)]">
        <div className="border-b-2 border-espresso-dark p-4 bg-vintage-paper flex justify-between items-center">
          <h2 className="font-display text-lg font-bold text-espresso-dark">Recent Transactions Log</h2>
          <button className="text-xs font-mono uppercase tracking-widest text-sunrise-amber hover:text-espresso-dark transition-colors">
            View All →
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-black/5 border-b-2 border-double border-espresso-dark font-mono text-xs uppercase tracking-wider text-espresso-dark">
              <tr>
                <th className="px-6 py-3 font-bold border-r border-mocha-medium/10">Time</th>
                <th className="px-6 py-3 font-bold border-r border-mocha-medium/10">Order ID</th>
                <th className="px-6 py-3 font-bold border-r border-mocha-medium/10">Customer</th>
                <th className="px-6 py-3 font-bold border-r border-mocha-medium/10">Status</th>
                <th className="px-6 py-3 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-mocha-medium/10 font-mono">
              <tr className="hover:bg-vintage-paper transition-colors">
                <td className="px-6 py-3 text-mocha-medium border-r border-mocha-medium/10">10:42 AM</td>
                <td className="px-6 py-3 text-espresso-dark font-bold border-r border-mocha-medium/10">#MBC-2024-0892</td>
                <td className="px-6 py-3 text-espresso-dark border-r border-mocha-medium/10">Sarah Tan</td>
                <td className="px-6 py-3 border-r border-mocha-medium/10">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sage-fresh/20 text-sage-fresh border border-sage-fresh/30">
                    Completed
                  </span>
                </td>
                <td className="px-6 py-3 text-right font-bold text-espresso-dark">$14.50</td>
              </tr>
              <tr className="hover:bg-vintage-paper transition-colors">
                <td className="px-6 py-3 text-mocha-medium border-r border-mocha-medium/10">10:38 AM</td>
                <td className="px-6 py-3 text-espresso-dark font-bold border-r border-mocha-medium/10">#MBC-2024-0891</td>
                <td className="px-6 py-3 text-espresso-dark border-r border-mocha-medium/10">James Lee</td>
                <td className="px-6 py-3 border-r border-mocha-medium/10">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-sunrise-amber/20 text-sunrise-amber border border-sunrise-amber/30">
                    Preparing
                  </span>
                </td>
                <td className="px-6 py-3 text-right font-bold text-espresso-dark">$8.20</td>
              </tr>
              <tr className="hover:bg-vintage-paper transition-colors">
                <td className="px-6 py-3 text-mocha-medium border-r border-mocha-medium/10">10:35 AM</td>
                <td className="px-6 py-3 text-espresso-dark font-bold border-r border-mocha-medium/10">#MBC-2024-0890</td>
                <td className="px-6 py-3 text-espresso-dark border-r border-mocha-medium/10">Ahmad B.</td>
                <td className="px-6 py-3 border-r border-mocha-medium/10">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-coral-pop/20 text-coral-pop border border-coral-pop/30">
                    Pending
                  </span>
                </td>
                <td className="px-6 py-3 text-right font-bold text-espresso-dark">$22.00</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
