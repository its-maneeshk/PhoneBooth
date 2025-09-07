import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Auth } from "../lib/api";

export default function ProtectedRoute({ children }) {
  const [authState, setAuthState] = useState({
    loading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    let isMounted = true; // prevent state update if component unmounts

    const checkAuth = async () => {
      try {
        await Auth.me(); // your API call to validate auth
        if (isMounted) setAuthState({ loading: false, isAuthenticated: true });
      } catch (err) {
        if (isMounted) setAuthState({ loading: false, isAuthenticated: false });
      }
    };

    checkAuth();

    return () => {
      isMounted = false; // cleanup
    };
  }, []);

  if (authState.loading) return <div>Loading…</div>;
  if (!authState.isAuthenticated) return <Navigate to="/admin/login" replace />;

  return children;
}
