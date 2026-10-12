import { useState } from "react";

function OrderPage() {
  const [form, setForm] = useState({ name: "", email: "", qty: 1 });
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);

  function validate(v) {
    const e = {};
    if (v.name.trim().length < 2) e.name = "Name too short";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.email))
      e.email = "Enter a valid email";
    if (Number(v.qty) < 1) e.qty = "Qty must be ≥ 1";
    return e;
  }

  function handleChange(e) {
    const updatedForm = { ...form, [e.target.name]: e.target.value };
    setForm(updatedForm);
    if (Object.keys(errors).length > 0) {
      setErrors(validate(updatedForm));
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length === 0) setDone(true);
  }

  if (done)
    return (
      <div className="success-banner">
        <h3>Order Submitted Successfully!</h3>
        <p>Thanks, {form.name}! Order received.</p>
      </div>
    );

  return (
    <div className="order-page">
      <h2>Place Your Order</h2>
      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter your name"
          />
          {errors.name && <span className="error-text"> {errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email"
          />
          {errors.email && <span className="error-text"> {errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="qty">Quantity:</label>
          <input
            id="qty"
            name="qty"
            type="number"
            value={form.qty}
            onChange={handleChange}
          />
          {errors.qty && <span className="error-text"> {errors.qty}</span>}
        </div>

        <button type="submit" className="submit-btn">
          Place order
        </button>
      </form>
    </div>
  );
}

export default OrderPage;
