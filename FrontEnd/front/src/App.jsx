import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./AuthContext";
import RequireAuth from "./RequireAuth";

import IndexPublic from "./pages/IndexPublic";
import HomeMember from "./pages/HomeMember";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NewsDetail from "./pages/NewsDetail";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/index" element={<IndexPublic />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/"
            element={
              <RequireAuth>
                <HomeMember />
              </RequireAuth>
            }
          />

          <Route
            path="/news/:id"
            element={
              <RequireAuth>
                <NewsDetail />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/index" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
