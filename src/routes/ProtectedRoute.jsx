import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { getToken } from "../utils/auth";
import { getMe } from "../services/auth.api";

export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const token = getToken();
  const [me, setMe] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    getMe()
      .then((res) => {
        if (!cancelled) setMe(res.data);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!token || failed) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!me) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (role && me.role !== role) {
    return <Navigate to={me.role === "admin" ? "/admin" : "/student"} replace />;
  }

  return children;
}