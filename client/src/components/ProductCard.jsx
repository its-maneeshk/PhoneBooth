import { Link } from "react-router-dom";

export default function ProductCard({ p, darkBorder = false }) {
  const img = p.images?.[0];
  const status = new Date(p.launchDate) <= new Date() ? "Launched" : "Upcoming";

  // Format price neatly (₹12,999 instead of 12999)
  const formattedPrice =
    p.price &&
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(p.price);

  return (
    <Link
      to={`/p/${p.slug}`}
      className={`block rounded-lg overflow-hidden transition transform hover:-translate-y-1 hover:shadow-lg
        ${darkBorder ? "border-2 border-gray-800" : "border border-gray-200"}
      `}
    >
      {/* Image wrapper */}
      <div className="aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {img ? (
          <img
            src={img}
            alt={`${p.title} by ${p.brand}`}
            className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-105"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
      </div>

      {/* Product info */}
      <div className="p-3 space-y-1">
        {/* Brand + status */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="px-2 py-0.5 bg-gray-100 rounded-full text-[10px] uppercase tracking-wide font-medium">
            {p.brand}
          </span>
          <span className={status === "Launched" ? "text-green-600" : "text-orange-500"}>
            {status}
          </span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2">{p.title}</h3>

        {/* Launch date */}
        <div className="text-xs text-gray-500">
          Launch: {new Date(p.launchDate).toLocaleDateString()}
        </div>

        {/* Price */}
        {formattedPrice && (
          <div className="text-blue-600 font-bold">{formattedPrice}</div>
        )}
      </div>
    </Link>
  );
}
