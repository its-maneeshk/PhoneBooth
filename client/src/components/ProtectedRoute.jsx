import { useEffect, useState } from "react";
import { Auth } from "../lib/api";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const [state, setState] = useState({ loading: true, ok: false });

  useEffect(() => {
    Auth.me()
      .then(() => setState({ loading: false, ok: true }))
      .catch(() => setState({ loading: false, ok: false }));
  }, []);

  if (state.loading) return <div>Loading…</div>;
  if (!state.ok) return <Navigate to="/admin/login" replace />;
  return children;
}
