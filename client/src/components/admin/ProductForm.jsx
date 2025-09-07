import SpecEditor from "./SpecEditor";

export default function ProductForm({ form, setField, handleSubmit }) {
  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Add / Edit Product</h2>

      <input
        value={form.name}
        onChange={(e) => setField({ name: e.target.value })}
        placeholder="Product Name"
        className="w-full border p-2 rounded mb-2"
      />

      <input
        value={form.brand}
        onChange={(e) => setField({ brand: e.target.value })}
        placeholder="Brand"
        className="w-full border p-2 rounded mb-2"
      />

      <textarea
        value={form.description}
        onChange={(e) => setField({ description: e.target.value })}
        placeholder="Description"
        className="w-full border p-2 rounded mb-2"
      />

      <input
        type="number"
        value={form.price}
        onChange={(e) => setField({ price: e.target.value })}
        placeholder="Price"
        className="w-full border p-2 rounded mb-2"
      />

      <div className="mb-4">
        <h3 className="font-semibold mb-2">Specifications</h3>
        <SpecEditor
          value={form.specs}
          onChange={(obj) => setField({ specs: obj })}
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Save Product
      </button>
    </form>
  );
}
