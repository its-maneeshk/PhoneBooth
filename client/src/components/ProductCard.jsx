import { Link } from "react-router-dom";

export default function ProductCard({ p }) {
  const img = p.images?.[0];
  const status = new Date(p.launchDate) <= new Date() ? "Launched" : "Upcoming";
  return (
    <Link to={`/p/${p.slug}`} className="border bg-white rounded-lg overflow-hidden hover:shadow transition">
      <div className="aspect-[4/3] bg-gray-100 overflow-hidden">
        {img ? <img src={img} alt={p.title} className="w-full h-full object-cover" /> : null}
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500">{p.brand} • {status}</div>
        <div className="font-semibold">{p.title}</div>
        <div className="text-xs text-gray-500">Launch: {new Date(p.launchDate).toLocaleDateString()}</div>
      </div>
    </Link>
  );
}
