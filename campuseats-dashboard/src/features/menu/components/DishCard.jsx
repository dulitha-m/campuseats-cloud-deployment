import { Link } from "react-router-dom";

function DishCard({ dish }) {
  return (
    <div className={`dish-card ${!dish.available ? "sold-out-card" : ""}`}>
      <div className="dish-card-header">
        <h3>{dish.name}</h3>
        <span className="dish-category">{dish.category}</span>
      </div>
      <p className="dish-price">Rs. {dish.price.toFixed(2)}</p>
      {!dish.available ? (
        <span className="sold-out-badge"> — Sold out</span>
      ) : (
        <span className="available-badge">Available</span>
      )}
      <div className="dish-card-footer">
        <Link to={`/dish/${dish.id}`} className="view-details-btn">
          View Details →
        </Link>
      </div>
    </div>
  );
}

export default DishCard;
