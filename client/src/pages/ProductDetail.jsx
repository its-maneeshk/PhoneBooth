import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Products } from "../lib/api";

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    Products.get(slug)
      .then((data) => {
        setP(data);
        setSelectedImg(data.images?.[0] || null); // ✅ first image as default preview
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="text-center py-8 text-gray-500">Loading…</div>;
  if (!p) return <div className="text-center py-8 text-red-500">Not found</div>;

  return (
    <article className="grid md:grid-cols-2 gap-8">
      {/* ✅ Image Preview Section */}
      <div>
        {selectedImg ? (
          <img
            src={selectedImg}
            alt={p.title}
            className="w-full rounded-lg border shadow-sm bg-white max-h-[450px] object-contain"
          />
        ) : (
          <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
            No Image Available
          </div>
        )}

        {/* ✅ Thumbnails */}
        <div className="flex mt-4 gap-3 overflow-x-auto">
          {(p.images || []).map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`${p.title} ${i + 1}`}
              onClick={() => setSelectedImg(src)}
              className={`h-20 w-20 object-contain border rounded-lg cursor-pointer transition 
                ${selectedImg === src ? "border-black ring-2 ring-black" : "border-gray-300 hover:border-black"}
              `}
            />
          ))}
        </div>
      </div>

      {/* ✅ Product Info Section */}
      <div>
        <h1 className="text-3xl font-bold">{p.title}</h1>
        <div className="text-sm text-gray-500 mt-1">
          {p.brand} • {new Date(p.launchDate) <= new Date() ? "Launched" : "Upcoming"}
        </div>

        {p.price ? (
          <div className="mt-3 text-2xl font-semibold text-green-600">
            ₹ {p.price.toLocaleString("en-IN")}
          </div>
        ) : (
          <div className="mt-3 text-lg text-gray-500">Price not available</div>
        )}

        {/* ✅ Specs */}
        <h2 className="mt-6 font-semibold text-lg">Specifications</h2>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          {Object.entries(p.specs || {}).map(([k, v]) => (
            <div
              key={k}
              className="flex justify-between border rounded-lg p-3 bg-white shadow-sm"
            >
              <span className="text-gray-500">{k}</span>
              <span className="font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
