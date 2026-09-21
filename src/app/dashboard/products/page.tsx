import { listProducts } from "@/lib/store";

export default async function ProductsPage() {
  const products = await listProducts();
  return (
    <div>
      <h1 className="font-serif text-4xl">Catalog</h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        The assistant can quote price and stock from these records.
      </p>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {products.map((p) => (
          <article key={p.id} className="rounded-3xl border border-white/8 p-5">
            <p className="text-xs text-[var(--muted)]">{p.sku}</p>
            <h2 className="mt-1 text-xl font-semibold">{p.name}</h2>
            <p className="mt-2 text-sm text-[var(--muted)]">{p.description}</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="font-semibold">${p.price}</span>
              <span className="text-[var(--muted)]">{p.stock} in stock</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
