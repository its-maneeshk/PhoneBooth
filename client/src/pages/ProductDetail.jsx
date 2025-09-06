import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Products } from "../lib/api";

export default function ProductDetail() {
  const { slug } = useParams();
  const [p, setP] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=> {
    Products.get(slug).then(setP).finally(()=>setLoading(false));
  }, [slug]);

  if (loading) return <div>Loading…</div>;
  if (!p) return <div>Not found</div>;

  return (
    <article className="grid md:grid-cols-2 gap-6">
      <div className="space-y-3">
        {(p.images || []).map((src,i)=>(
          <img key={i} src={src} alt={`${p.title} ${i+1}`} className="w-full rounded-lg border bg-white"/>
        ))}
      </div>
      <div>
        <h1 className="text-3xl font-bold">{p.title}</h1>
        <div className="text-sm text-gray-500">{p.brand} • {new Date(p.launchDate) <= new Date() ? "Launched" : "Upcoming"}</div>
        {p.price ? <div className="mt-2 text-xl font-semibold">₹ {p.price.toLocaleString("en-IN")}</div> : null}

        <h2 className="mt-6 font-semibold">Specs</h2>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {Object.entries(p.specs || {}).map(([k,v])=>(
            <div key={k} className="flex justify-between border rounded p-2 bg-white">
              <span className="text-gray-500">{k}</span>
              <span className="font-medium">{String(v)}</span>
            </div>
          ))}
        </div>
      </div>
    </article>
  );
}
