import React, { useState, useEffect } from "react";

import { fetchProduct } from "../../services/productService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import { PlusCircle } from "lucide-react";
function Product() {
  // Fetch season
  const [products, setProducts] = useState([]);
  useEffect(() => {
    const loadStock = async () => {
      try {
        const productsData = await fetchProduct();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch sales:", error);
      }
    };

    loadStock();
  }, []);

  const handleUpdateReason = () => {
    alert("click to update");
  };
  const handleDeleteSale = () => {
    alert("hello world");
  };
  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Products Dashboard
          </h4>
          <button
            className="btn btn-success d-flex align-items-center"
            // onClick={() => setShowAddModal(true)}
          >
            <PlusCircle size={20} className="me-2" /> Add Product
          </button>
        </div>
      </div>

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>ProductName</th>
                <th>Price</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.slice(0, 3).map((product, index) => (
                  <tr key={product.id}>
                    <td>{index + 1}</td>
                    <td>{product.productName}</td>

                    <td>{product.unitPrice}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateReason(product)}
                          confirmMessage={`Are you sure you want to update stock for "${
                            product.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteSale(product._id)}
                          confirmMessage={`Are you sure you want to delete stock "${
                            product.productName || "N/A"
                          }"?`}
                          className="btn-sm"
                        >
                          Delete
                        </DeleteButton>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No product found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Product;
