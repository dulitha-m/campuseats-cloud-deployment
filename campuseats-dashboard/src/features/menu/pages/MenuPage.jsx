import { useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useFetch } from "../hooks/useFetch";
import MenuList from "../components/MenuList";
import { MENU_ENDPOINT } from "../../../config/api";

function MenuPage() {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query, 400);

  const { data: dishes, isLoading, error } = useFetch(MENU_ENDPOINT);

  if (isLoading) return <div className="status-message loading"><p>Loading menu…</p></div>;
  if (error) return <div className="status-message error"><p>Could not load menu: {error}</p></div>;

  const filtered = (dishes || []).filter((d) =>
    d.name.toLowerCase().includes(debounced.toLowerCase())
  );

  return (
    <div className="menu-page">
      <h2>CampusEats Menu</h2>
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search dishes..."
        />
        {query !== debounced && <span className="debouncing-indicator">Filtering...</span>}
      </div>
      <MenuList dishes={filtered} />
    </div>
  );
}

export default MenuPage;
