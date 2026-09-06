import { createBrowserRouter } from "react-router";
import { MainLayout } from "./components/MainLayout";
import { HomePage } from "./pages/HomePage";
import { HelpCenterPage } from "./pages/HelpCenterPage";
import { AdminLoginPage } from "./pages/AdminLoginPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminDashboardHome } from "./pages/AdminDashboardHome";
import { AdminPanorama } from "./pages/AdminPanorama";
import { AdminKomentar } from "./pages/AdminKomentar";
import { AdminDenahRuangan } from "./pages/AdminDenahRuangan";
import { VirtualTourPage } from "./pages/VirtualTourPage";
import { CustomerService } from "./pages/CustomerService";
import { DenahInteraktifPage } from "./pages/DenahInteraktifPage";
import React from "react";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "help-center", element: <HelpCenterPage /> },
      { path: "admin-login", element: <AdminLoginPage /> },
      {
        path: "admin-dashboard",
        element: <AdminDashboard />,
        children: [
          { index: true, element: <AdminDashboardHome /> },
          { path: "panorama", element: <AdminPanorama /> },
          { path: "komentar", element: <AdminKomentar /> },
          { path: "denah-ruangan", element: <AdminDenahRuangan /> },
        ],
      },
      { path: "virtual-tour", element: <VirtualTourPage /> },
      { path: "denah-interaktif", element: <DenahInteraktifPage /> },
      { path: "customer-service", element: <CustomerService /> },
    ],
  },
]);
