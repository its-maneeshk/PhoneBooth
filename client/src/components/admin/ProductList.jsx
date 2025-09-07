import PaginationControls from "./PaginationControls";

export default function ProductList({
  products,
  loading,
  page,
  totalPages,
  onPageChange,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Products</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <ul className="space-y-2">
            {products.map((p) => (
              <li
                key={p._id}
                className="border p-2 rounded flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-gray-600">{p.brand}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEdit(p)}
                    className="text-blue-500 text-sm"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(p._id)}
                    className="text-red-500 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <PaginationControls
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </div>
  );
}
