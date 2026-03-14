// ============================================================
// 🍷 Story Night — Hash Router
// /#/       → 前台（參與者）
// /#/admin  → 後台（管理員）
// ============================================================
import { useState, useEffect } from "react";
import PublicApp from "./PublicApp.jsx";
import AdminApp from "./AdminApp.jsx";

function getRoute() {
  const hash = window.location.hash.replace("#", "") || "/";
  if (hash.startsWith("/admin")) return "admin";
  return "public";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (route === "admin") return <AdminApp />;
  return <PublicApp />;
}
