import { useEffect, useState } from "react";
import { Products } from "../lib/api";
import ProductCard from "../components/ProductCard";

// 🔹 Reusable Tabs (same as Phones)
function SectionTabs({ value, onChange, options }) {
  return (
    <div className="inline-flex border rounded-lg overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`px-4 py-2 text-sm font-medium transition-colors duration-200
            ${value === opt ? "bg-black text-white" : "bg-white hover:bg-gray-100"}
          `}
        >
          {opt[0].toUpperCase() + opt.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function Laptops() {
  const [tab, setTab] = useState("launched"); // ✅ default = launched
  const [data, setData] = useState({ items: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const params = {
      category: "laptop",
      status: tab,
      limit: 24,
      sort: tab === "upcoming" ? "launchDate" : "-launchDate",
    };

    Products.list(params)
      .then(setData)
      .finally(() => setLoading(false));

    // Auto scroll top on tab change
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tab]);

  return (
    <section>
      {/* Header with Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Laptops</h1>
        <SectionTabs value={tab} onChange={setTab} options={["launched", "upcoming"]} />
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse border rounded-lg p-4 h-48 bg-gray-100"
            />
          ))}
        </div>
      ) : data.items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {data.items.map((p) => (
            <ProductCard key={p._id} p={p} darkBorder />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          <div className="text-4xl mb-2">💻</div>
          <p>No {tab} laptops found.</p>
        </div>
      )}
    </section>
  );
}
