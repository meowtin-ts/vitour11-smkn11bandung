import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router";
import { AdminLayout } from "../components/AdminLayout";
import { toast } from "sonner";

export function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const storedToken = localStorage.getItem("adminToken");
    if (!storedToken) {
      navigate("/admin-login");
      return;
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin-login");
      toast.success("Berhasil logout");
    } catch (error) {
      console.error("Logout error:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("adminUser");
      navigate("/admin-login");
      toast.success("Berhasil logout");
    }
  };

  const userName = localStorage.getItem("adminUser");

  return (
    <AdminLayout onLogout={handleLogout} userName={userName || undefined}>
      <Outlet />
    </AdminLayout>
  );
}
