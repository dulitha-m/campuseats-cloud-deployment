import { Routes, Route, NavLink } from "react-router-dom";
import MenuPage from "./features/menu/pages/MenuPage";
import DishDetailPage from "./features/menu/pages/DishDetailPage";
import OrderPage from "./features/menu/pages/OrderPage";

export default function App() {
  return (
    <div className="app-container">
      <header className="app-header">
        <h1>CampusEats Dashboard</h1>
        <nav className="nav-bar">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Menu
          </NavLink>
          <span className="nav-divider">|</span>
          <NavLink to="/order" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            Place Order
          </NavLink>
        </nav>
      </header>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<MenuPage />} />
          <Route path="/dish/:id" element={<DishDetailPage />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="*" element={<div className="status-message error"><p>404 — Page not found</p></div>} />
        </Routes>
      </main>
    </div>
  );
}
