import React, { useState, useEffect } from "react";
import { createPurchaseOut } from "../../services/purchaseOutService";
import fetchSeasons from "../../services/SeasonService";
import { fetchProduct } from "../../services/productService";

const AddPurchaseOutModal = ({ onClose, onSaved }) => {
  const [productId, setProductId] = useState("");
  const [seasonId, setSeasonId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);

  useEffect(() => {
    const loadProductsAndSeasons = async () => {
      try {
        const productsRes = await fetchProduct();
        const seasonsRes = await fetchSeasons();
        setProducts(productsRes.data);
        setSeasons(seasonsRes.data);
      } catch (error) {
        console.error("Error loading products or seasons:", error);
      }
    };
    loadProductsAndSeasons();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createPurchaseOut({ productId, seasonId, quantity, unitPrice });
      onSaved();
      onClose();
    } catch (error) {
      console.error("Add failed:", error);
    }
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      style={{ backgroundColor: "#00000088" }}
    >
      <div className="modal-dialog">
        <form className="modal-content" onSubmit={handleSubmit}>
          <div className="modal-header">
            <h5 className="modal-title">Add Purchase Out</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <select
              className="form-select mb-2"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              <option value="">Select Product</option>
              {products.map((prod) => (
                <option key={prod._id} value={prod._id}>
                  {prod.name}
                </option>
              ))}
            </select>

            <select
              className="form-select mb-2"
              value={seasonId}
              onChange={(e) => setSeasonId(e.target.value)}
              required
            >
              <option value="">Select Season</option>
              {seasons.map((season) => (
                <option key={season._id} value={season._id}>
                  {season.name} - {season.year}
                </option>
              ))}
            </select>

            <input
              type="number"
              className="form-control mb-2"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <input
              type="number"
              className="form-control"
              placeholder="Unit Price"
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              required
            />
          </div>
          <div className="modal-footer">
            <button type="submit" className="btn btn-success">
              Save
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPurchaseOutModal;
