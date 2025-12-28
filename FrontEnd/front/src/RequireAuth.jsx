import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function RequireAuth({ children }) {
  const { session, loading } = useAuth();
  const loc = useLocation();

  if (loading) return <div style={{ padding: 20 }}>Loading...</div>;
  if (!session) return <Navigate to="/index" replace state={{ from: loc.pathname }} />;
  return children;
}
