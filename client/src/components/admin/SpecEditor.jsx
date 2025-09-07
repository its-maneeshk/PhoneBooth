import { useEffect, useState } from "react";

export default function SpecEditor({ value = {}, onChange }) {
  const [rows, setRows] = useState(() =>
    Object.entries(value).map(([k, v]) => ({ k, v }))
  );

  useEffect(() => {
    const currentKeys = rows.map((r) => r.k).sort().join(",");
    const newKeys = Object.keys(value).sort().join(",");
    if (currentKeys !== newKeys) {
      setRows(Object.entries(value).map(([k, v]) => ({ k, v })));
    }
  }, [value]);

  useEffect(() => {
    const obj = {};
    rows.forEach(({ k, v }) => {
      if (k.trim()) obj[k.trim()] = parsePossibleNumberOrBoolean(v);
    });

    if (JSON.stringify(obj) !== JSON.stringify(value || {})) {
      onChange(obj);
    }
  }, [rows]);

  function parsePossibleNumberOrBoolean(v) {
    if (v === "true") return true;
    if (v === "false") return false;
    if (v === "" || v == null) return "";
    const n = Number(v);
    if (!Number.isNaN(n) && String(n) === String(v)) return n;
    return v;
  }

  return (
    <div>
      {rows.map((row, i) => (
        <div key={i} className="flex gap-2 items-center mb-2">
          <input
            value={row.k}
            onChange={(e) =>
              setRows((r) =>
                r.map((rr, idx) => (idx === i ? { ...rr, k: e.target.value } : rr))
              )
            }
            placeholder="Key (e.g. ram)"
            className="border p-1 rounded flex-[0.4]"
          />
          <input
            value={row.v}
            onChange={(e) =>
              setRows((r) =>
                r.map((rr, idx) => (idx === i ? { ...rr, v: e.target.value } : rr))
              )
            }
            placeholder="Value (e.g. 16GB)"
            className="border p-1 rounded flex-1"
          />
          <button
            type="button"
            onClick={() => setRows((r) => r.filter((_, idx) => idx !== i))}
            className="text-red-500 text-sm"
          >
            Remove
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => setRows((r) => [...r, { k: "", v: "" }])}
        className="px-2 py-1 bg-gray-100 border rounded text-sm"
      >
        + Add Field
      </button>
    </div>
  );
}
