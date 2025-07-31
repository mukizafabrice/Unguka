import React, { useEffect, useState } from "react";
import { fetchProducts } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";
import { updatePurchaseOut } from "../../services/purchaseOutService";

const UpdatePurchaseOutModal = ({ show, onClose, onUpdate, purchaseOut }) => {
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [formData, setFormData] = useState({
    productId: "",
    quantity: "",
    unitPrice: "",
    seasonId: "",
  });

  useEffect(() => {
    if (purchaseOut) {
      setFormData({
        productId: purchaseOut.productId || "",
        quantity: purchaseOut.quantity || "",
        unitPrice: purchaseOut.unitPrice || "",
        seasonId: purchaseOut.seasonId || "",
      });
    }
  }, [purchaseOut]);

  useEffect(() => {
    const loadData = async () => {
      const productData = await fetchProducts();
      const seasonData = await fetchSeasons();
      setProducts(productData);
      setSeasons(seasonData);
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updatePurchaseOut(purchaseOut._id, formData);
      onUpdate(); // Refresh parent list
      onClose(); // Close modal
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Update Purchase Out</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1">Product</label>
            <select
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Unit Price</label>
            <input
              type="number"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-1">Season</label>
            <select
              name="seasonId"
              value={formData.seasonId}
              onChange={handleChange}
              className="w-full border px-3 py-2 rounded"
              required
            >
              <option value="">Select a season</option>
              {seasons.map((season) => (
                <option key={season._id} value={season._id}>
                  {season.name + " " + season.year}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePurchaseOutModal;
