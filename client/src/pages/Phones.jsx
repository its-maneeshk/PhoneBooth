import { useEffect, useState } from "react";
import { Products } from "../lib/api";
import ProductCard from "../components/ProductCard";

function SectionTabs({ value, onChange }) {
  return (
    <div className="inline-flex border rounded overflow-hidden">
      {["upcoming","launched"].map(v => (
        <button key={v}
          onClick={()=>onChange(v)}
          className={`px-3 py-1 text-sm ${value===v ? "bg-black text-white" : "bg-white"}`}>
          {v[0].toUpperCase()+v.slice(1)}
        </button>
      ))}
    </div>
  );
}

export default function Phones() {
  const [tab, setTab] = useState("upcoming");
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Products.list({ category: "phone", status: tab, limit: 24, sort: tab==="upcoming" ? "launchDate" : "-launchDate" })
      .then(setData)
      .finally(()=>setLoading(false));
  }, [tab]);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Phones</h1>
        <SectionTabs value={tab} onChange={setTab} />
      </div>
      {loading ? <div>Loading…</div> : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {data.items.map(p => <ProductCard key={p._id} p={p} />)}
        </div>
      )}
    </section>
  );
}
