// AdminDashboard.jsx
import { useEffect, useMemo, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Products, Auth } from "../lib/api";

/* ---------- Helpers ---------- */
const emptyForm = {
  title: "",
  brand: "",
  category: "phone",
  images: "", // comma-separated
  launchDate: "",
  price: "",
  specs: {}, // object in form state
  description: "" // add this
};

const pageSizes = [10, 25, 50];

function toPayload(form) {
  return {
    title: form.title,
    brand: form.brand,
    category: form.category,
    images: (form.images || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean),
    launchDate: form.launchDate ? new Date(form.launchDate).toISOString() : null,
    price: form.price ? Number(form.price) : undefined,
    specs: form.specs || {},
    description: form.description || "No description available for this product."
  };
}

function previewUrlsFromForm(form) {
  return (form.images || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ---------- SpecEditor Component ---------- */
/* Dynamic list of key/value rows that update a parent via onChange(obj)
   IMPORTANT: prevent infinite loop by only calling onChange when object actually changes.
*/
function SpecEditor({ value = {}, onChange }) {
  // initialize rows from value (stable)
  const [rows, setRows] = useState(() =>
    Object.entries(value || {}).map(([k, v]) => ({ k, v }))
  );

  // helper to parse numbers/booleans
  function parsePossibleNumberOrBoolean(v) {
    if (v === "true") return true;
    if (v === "false") return false;
    if (v === "" || v == null) return "";
    const n = Number(v);
    if (!Number.isNaN(n) && String(n) === String(v)) return n;
    return v;
  }

  // Sync rows from parent value ONLY when keys changed (avoid stomping user edits)
  useEffect(() => {
    const currentKeys = rows.map((r) => r.k).sort().join(",");
    const newKeys = Object.keys(value || {}).sort().join(",");
    if (currentKeys !== newKeys) {
      setRows(Object.entries(value || {}).map(([k, v]) => ({ k, v })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]); // intentionally not depending on rows here (we compare inside)

  // Synthesize object from rows and push up only if different
  useEffect(() => {
    const obj = {};
    rows.forEach(({ k, v }) => {
      if (k && k.toString().trim()) obj[k.toString().trim()] = parsePossibleNumberOrBoolean(v);
    });

    // deep-equality via JSON string (sufficient for small specs object)
    const same = JSON.stringify(obj) === JSON.stringify(value || {});
    if (!same) {
      // only call parent when there is an actual change
      if (typeof onChange === "function") onChange(obj);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  // row helpers
  const setRowKey = (index, key) =>
    setRows((r) => r.map((row, i) => (i === index ? { ...row, k: key } : row)));

  const setRowVal = (index, val) =>
    setRows((r) => r.map((row, i) => (i === index ? { ...row, v: val } : row)));

  const addRow = () => setRows((r) => [...r, { k: "", v: "" }]);
  const removeRow = (index) => setRows((r) => r.filter((_, i) => i !== index));

  return (
    <div>
      <div className="space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2 items-center">
            <input
              value={row.k}
              onChange={(e) => setRowKey(i, e.target.value)}
              placeholder="key (e.g. ram)"
              className="flex-[0.45] border p-1 rounded text-sm"
            />
            <input
              value={row.v}
              onChange={(e) => setRowVal(i, e.target.value)}
              placeholder="value (e.g. 16GB)"
              className="flex-1 border p-1 rounded text-sm"
            />
            <button
              type="button"
              onClick={() => removeRow(i)}
              className="text-red-600 px-2 py-1 text-sm"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2">
        <button
          type="button"
          onClick={addRow}
          className="px-3 py-1 bg-gray-100 border rounded text-sm"
        >
          + Add field
        </button>
        <button
          type="button"
          onClick={() => {
            setRows([]);
            if (typeof onChange === "function") onChange({});
          }}
          className="px-3 py-1 border rounded text-sm"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

/* ---------- ImageGalleryModal ---------- */
function ImageGalleryModal({ urls = [], startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex || 0);
  useEffect(() => setIndex(startIndex || 0), [startIndex]);

  if (!urls.length) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
      <div className="bg-white rounded shadow-lg max-w-3xl w-full">
        <div className="p-2 flex justify-between items-center border-b">
          <div className="text-sm font-medium">Image Preview</div>
          <button onClick={onClose} className="px-2 py-1">Close</button>
        </div>
        <div className="p-4 flex items-center justify-center gap-4">
          <button
            onClick={() => setIndex((i) => (i - 1 + urls.length) % urls.length)}
            className="px-3 py-2"
            aria-label="prev"
          >
            ◀
          </button>
          <img
            src={urls[index]}
            alt={`img-${index}`}
            className="max-h-[70vh] max-w-full object-contain"
          />
          <button
            onClick={() => setIndex((i) => (i + 1) % urls.length)}
            className="px-3 py-2"
            aria-label="next"
          >
            ▶
          </button>
        </div>
        <div className="p-3 border-t text-sm text-center text-gray-600">
          {index + 1} / {urls.length}
        </div>
      </div>
    </div>
  );
}

/* ---------- Main Component ---------- */
export default function AdminDashboard() {
  // form uses object specs
  const [form, setForm] = useState({ ...emptyForm });
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [gallery, setGallery] = useState({ open: false, urls: [], start: 0 });

  // search/filter/sort/pagination
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt_desc");
  const [pageSize, setPageSize] = useState(pageSizes[0]);
  const [page, setPage] = useState(1);

  // inline validation
  const [errors, setErrors] = useState({});

  // load products
  const load = async () => {
    setLoading(true);
    try {
      const r = await Products.list({ limit: 100, sort: "-createdAt" });
      setData(r.items || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Derived filtered+sorted items
  const filtered = useMemo(() => {
    const qLow = q.trim().toLowerCase();
    let items = data.slice();

    if (categoryFilter !== "all") {
      items = items.filter((p) => (p.category || "").toLowerCase() === categoryFilter);
    }
    if (qLow) {
      items = items.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(qLow) ||
          (p.brand || "").toLowerCase().includes(qLow)
      );
    }

    // sort
    const [field, dir] = sortBy.split("_");
    items.sort((a, b) => {
      let av = a[field];
      let bv = b[field];
      if (field === "price") {
        av = Number(av ?? 0);
        bv = Number(bv ?? 0);
      }
      if (field === "launchDate" || field === "createdAt") {
        av = new Date(av || 0).getTime();
        bv = new Date(bv || 0).getTime();
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });

    return items;
  }, [data, q, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  /* ---------- Form handlers ---------- */
  const setField = (patch) => setForm((f) => ({ ...f, ...patch }));

  const validateForm = () => {
    const err = {};
    if (!form.title || !form.title.trim()) err.title = "Title is required";
    if (!form.brand || !form.brand.trim()) err.brand = "Brand is required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix validation errors");
      return;
    }
    setSaving(true);
    try {
      const payload = toPayload(form);
      if (editingId) {
        await Products.update(editingId, payload);
        toast.success("Product updated");
      } else {
        await Products.create(payload);
        toast.success("Product created");
      }
      setForm({ ...emptyForm });
      setEditingId(null);
      await load();
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onEdit = (p) => {
    setEditingId(p._id);
    setForm({
      title: p.title || "",
      brand: p.brand || "",
      category: p.category || "phone",
      images: (p.images || []).join(", "),
      launchDate: p.launchDate ? new Date(p.launchDate).toISOString().slice(0, 16) : "",
      price: p.price ?? "",
      specs: p.specs || {},
      description: p.description || ""
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ---------- Delete with Undo ---------- */
  const onDelete = async (p) => {
    const backup = { ...p };
    setData((d) => d.filter((x) => x._id !== p._id));

    const id = toast((t) => (
      <div className="flex items-center gap-3">
        <div>Deleted {p.title}</div>
        <button
          className="ml-2 underline text-sm"
          onClick={async () => {
            toast.dismiss(t.id);
            try {
              const payload = {
                title: backup.title,
                brand: backup.brand,
                category: backup.category,
                images: backup.images || [],
                launchDate: backup.launchDate || null,
                price: backup.price,
                specs: backup.specs || {}
              };
              await Products.create(payload);
              toast.success("Undo: product restored");
              load();
            } catch (err) {
              console.error(err);
              toast.error("Failed to restore item");
              load();
            }
          }}
        >
          Undo
        </button>
      </div>
    ), { duration: 5000 });

    setTimeout(async () => {
      try {
        await Products.remove(p._id);
      } catch (err) {
        console.error("delete failed", err);
      }
    }, 5200);
  };

  /* ---------- small UI helper ---------- */
  const openGalleryAt = (urls, start) => setGallery({ open: true, urls, start });
  const closeGallery = () => setGallery({ open: false, urls: [], start: 0 });

  /* ---------- JSX ---------- */
  return (
    <div className="p-4">
      <Toaster position="top-right" />

      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">Admin</span>
            <span className="text-xs text-gray-500">Logged in</span>
          </div>
          <button
            onClick={() => Auth.logout().then(() => (location.href = "/"))}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded transition-colors duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1m0-10V5" />
            </svg>
            Logout
          </button>
        </div>


      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Form column */}
        <div className="md:col-span-1 bg-white p-4 border rounded shadow-sm">
          <h2 className="font-semibold mb-2">{editingId ? "Edit Product" : "Create Product"}</h2>
          <form onSubmit={onSubmit} className="space-y-3">
            <div>
              <input
                className={`w-full border p-2 rounded ${errors.title ? "border-red-500" : ""}`}
                placeholder="Title"
                value={form.title}
                onChange={(e) => setField({ title: e.target.value })}
              />
              {errors.title && <div className="text-red-600 text-sm mt-1">{errors.title}</div>}
            </div>

            <div>
              <input
                className={`w-full border p-2 rounded ${errors.brand ? "border-red-500" : ""}`}
                placeholder="Brand"
                value={form.brand}
                onChange={(e) => setField({ brand: e.target.value })}
              />
              {errors.brand && <div className="text-red-600 text-sm mt-1">{errors.brand}</div>}
            </div>

            <div>
              <select
                value={form.category}
                onChange={(e) => setField({ category: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="phone">Phone</option>
                <option value="laptop">Laptop</option>
                {/* <option value="accessory">Accessory</option> */}
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Images (comma separated)</label>
              <textarea
                rows="2"
                className="w-full border p-2 rounded"
                value={form.images}
                onChange={(e) => setField({ images: e.target.value })}
                placeholder="https://example.com/1.jpg, https://example.com/2.jpg"
              />
              {/* thumbnails */}
              <div className="flex flex-wrap gap-2 mt-2">
                {previewUrlsFromForm(form).map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`thumb-${i}`}
                    onClick={() => openGalleryAt(previewUrlsFromForm(form), i)}
                    className="w-20 h-20 object-cover rounded border cursor-pointer"
                    onError={(e) => {
                      e.currentTarget.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80'%3E%3Crect width='100%' height='100%' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%23999' font-size='10' alignment-baseline='middle' text-anchor='middle'%3Eno image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Launch Date</label>
              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={form.launchDate}
                onChange={(e) => setField({ launchDate: e.target.value })}
              />
            </div>

            <div>
              <input
                type="number"
                min="0"
                className="w-full border p-2 rounded"
                placeholder="Price (optional)"
                value={form.price}
                onChange={(e) => setField({ price: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 block mb-1">Description</label>
              <textarea
                rows="4"
                className="w-full border p-2 rounded"
                value={form.description}
                onChange={(e) => setField({ description: e.target.value })}
                placeholder="Enter product description"
              />
            </div>


            <div>
              <label className="text-sm text-gray-600 block mb-1">Specs</label>
              <SpecEditor
                value={form.specs}
                onChange={(obj) => setField({ specs: obj })}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 bg-black text-white rounded disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({ ...emptyForm });
                  setEditingId(null);
                }}
                className="px-4 py-2 border rounded"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* List + controls */}
        <div className="md:col-span-2">
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <input
              placeholder="Search title or brand..."
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              className="border p-2 rounded flex-1"
            />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="border p-2 rounded"
            >
              <option value="all">All categories</option>
              <option value="phone">Phone</option>
              <option value="laptop">Laptop</option>
              {/* <option value="accessory">Accessory</option> */}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="createdAt_desc">Newest</option>
              <option value="createdAt_asc">Oldest</option>
              <option value="title_asc">Title (A→Z)</option>
              <option value="title_desc">Title (Z→A)</option>
              <option value="price_asc">Price (low→high)</option>
              <option value="price_desc">Price (high→low)</option>
            </select>

            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="border p-2 rounded"
            >
              {pageSizes.map((ps) => (
                <option key={ps} value={ps}>
                  {ps} / page
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white border rounded shadow-sm">
            {/* header */}
            <div className="p-3 border-b flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Showing {filtered.length} results — page {page} / {totalPages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setForm({ ...emptyForm });
                    setEditingId(null);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="text-sm px-2 py-1 border rounded"
                >
                  New product
                </button>
                <button
                  onClick={load}
                  className="text-sm px-2 py-1 border rounded"
                >
                  Refresh
                </button>
              </div>
            </div>

            {/* list */}
            <div className="p-3 space-y-2">
              {loading ? (
                Array.from({ length: pageSize }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-16 h-16 bg-gray-200 rounded" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : pageItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">No products found.</div>
              ) : (
                pageItems.map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center gap-3 p-2 border rounded"
                  >
                    <div className="w-16 h-16 flex-shrink-0">
                      {p.images?.[0] ? (
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          className="w-16 h-16 object-cover rounded border cursor-pointer"
                          onClick={() => openGalleryAt(p.images || [], 0)}
                          onError={(e) => {
                            e.currentTarget.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Crect width='100%' height='100%' fill='%23f3f4f6'/%3E%3Ctext x='50%' y='50%' fill='%23999' font-size='10' alignment-baseline='middle' text-anchor='middle'%3Eno image%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-50 rounded border flex items-center justify-center text-xs text-gray-400">
                          no image
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="font-medium">{p.title}</div>
                      <div className="text-xs text-gray-500">
                        {p.brand} • {p.category} •{" "}
                        {p.launchDate ? new Date(p.launchDate).toLocaleString() : "N/A"}
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {p.price ? `$${p.price}` : ""}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(p)}
                        className="text-sm underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(p)}
                        className="text-sm text-red-600 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* pagination controls */}
            <div className="p-3 border-t flex items-center justify-between">
              <div className="text-sm text-gray-600">
                {filtered.length} result(s)
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  {"<<"}
                </button>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  {"<"}
                </button>
                <div className="px-3 py-1 border rounded text-sm">
                  Page {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  {">"}
                </button>
                <button
                  onClick={() => setPage(totalPages)}
                  disabled={page === totalPages}
                  className="px-2 py-1 border rounded disabled:opacity-50"
                >
                  {">>"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Modal */}
      {gallery.open && (
        <ImageGalleryModal
          urls={gallery.urls}
          startIndex={gallery.start}
          onClose={closeGallery}
        />
      )}
    </div>
  );
}
