import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import Phones from "./pages/Phones";
import Laptops from "./pages/Laptops";
import ProductDetail from "./pages/ProductDetail";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Phones /> },
      { path: "phones", element: <Phones /> },
      { path: "laptops", element: <Laptops /> },
      { path: "p/:slug", element: <ProductDetail /> },
      { path: "admin/login", element: <AdminLogin /> },
      { path: "admin", element: <AdminDashboard /> }, // will guard later
      { path: "admin", element: <ProtectedRoute><AdminDashboard /></ProtectedRoute> }
    ]
  }
]);

export default router;
