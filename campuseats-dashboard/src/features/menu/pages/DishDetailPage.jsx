import { useParams, Link } from "react-router-dom";
import { useFetch } from "../hooks/useFetch";
import { MENU_ENDPOINT } from "../../../config/api";

function DishDetailPage() {
  const { id } = useParams(); // from /dish/:id
  const { data: dishes, isLoading, error } = useFetch(MENU_ENDPOINT);

  const dish = Array.isArray(dishes)
    ? dishes.find((d) => d.id === Number(id))
    : dishes && dishes.id === Number(id)
    ? dishes
    : null;

  return (
    <div className="dish-detail-page">
      <Link to="/" className="back-link">← Back to menu</Link>
      <h2>Dish Details #{id}</h2>
      {isLoading && <div className="status-message loading"><p>Loading dish details...</p></div>}
      {error && <div className="status-message error"><p>Error loading details: {error}</p></div>}
      {dish ? (
        <div className="dish-detail-card">
          <h3>{dish.name}</h3>
          <p className="detail-category"><strong>Category:</strong> {dish.category}</p>
          <p className="detail-price"><strong>Price:</strong> Rs. {dish.price.toFixed(2)}</p>
          <p className="detail-status">
            <strong>Status:</strong>{" "}
            {dish.available ? (
              <span className="available-badge">Available to order</span>
            ) : (
              <span className="sold-out-badge">Currently Sold Out</span>
            )}
          </p>
          {dish.available && (
            <Link to="/order" className="place-order-btn" style={{ display: "inline-block", marginTop: "15px" }}>
              Order This Dish
            </Link>
          )}
        </div>
      ) : (
        !isLoading && <p>Showing details for dish #{id}</p>
      )}
    </div>
  );
}

export default DishDetailPage;
