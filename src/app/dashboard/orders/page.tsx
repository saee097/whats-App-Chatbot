import { listOrders } from "@/lib/store";
import { StatusPill } from "@/components/dashboard/ui";

export default async function OrdersPage() {
  const orders = await listOrders();
  return (
    <div>
      <h1 className="font-serif text-4xl">Orders</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Customers can ask “where is order 88421” in the widget and get a live status.
      </p>
      <div className="mt-6 overflow-hidden rounded-2xl border border-white/8">
        <table className="w-full text-left text-sm">
          <thead className="bg-white/4 text-[var(--muted)]">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ship to</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-white/6">
                <td className="px-4 py-3 font-medium">{o.id}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3">${o.totalAmount}</td>
                <td className="px-4 py-3">
                  <StatusPill status={o.status} />
                </td>
                <td className="px-4 py-3 text-[var(--muted)]">{o.deliveryAddress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
