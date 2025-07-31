import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  fetchProduct,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../../services/productService";
import DeleteButton from "../../components/buttons/DeleteButton";
import UpdateButton from "../../components/buttons/UpdateButton";
import AddButton from "../../components/buttons/AddButton";
import AddProductModal from "../../features/modals/AddProductModal";
import UpdateProductModal from "../../features/modals/UpdateProductModal";

function Product() {
  const [products, setProducts] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);

  // Fetch products
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productsData = await fetchProduct();
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch products:", error);
      }
    };

    loadProducts();
  }, []);

  const handleAddProduct = async (productData) => {
    try {
      const response = await createProduct(productData);
      setProducts((prev) => [...prev, response]);
      setShowAddModal(false);
      setShowToast(true);

      setTimeout(() => setShowToast(false), 3000); // auto-hide after 3s
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  //delete product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts((prev) => prev.filter((product) => product._id !== id));
      toast.success("User deleted successfully!");
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  //update product
  const handleUpdateProduct = (product) => {
    setProductToEdit(product);
    setShowUpdateModal(true);
  };
  const handleProductUpdated = async (updatedProductData) => {
    try {
      // Send to backend (you must have updateProduct function in productService)
      const updated = await updateProduct(
        updatedProductData._id,
        updatedProductData
      );

      // Replace in products list
      setProducts((prev) =>
        prev.map((p) => (p._id === updated._id ? updated : p))
      );

      toast.success("Product updated successfully!");
      setShowUpdateModal(false);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  return (
    <div className="p-4 text-white">
      <div className="pb-4 mb-4 border-bottom border-secondary-subtle">
        <div className="dashboard-content-area d-flex justify-content-between align-items-center">
          <h4 className="fs-4 fw-medium mb-0" style={{ color: "black" }}>
            Products Dashboard
          </h4>
          <AddButton
            label="Add Product"
            onClick={() => setShowAddModal(true)}
          />
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div
          className="toast show position-fixed top-0 end-0 m-4 bg-success text-white"
          role="alert"
          style={{ zIndex: 9999 }}
        >
          <div className="toast-header bg-success text-white">
            <strong className="me-auto">Success</strong>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={() => setShowToast(false)}
            ></button>
          </div>
          <div className="toast-body">Product added successfully!</div>
        </div>
      )}

      <div className="card p-4 shadow-sm rounded-3 h-100 bg-dark overflow-auto">
        <div className="table-responsive">
          <table className="table table-dark table-striped table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>ProductName</th>
                <th colSpan={2}>Action</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((product, index) => (
                  <tr key={product._id || index}>
                    <td>{index + 1}</td>
                    <td>{product.productName}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <UpdateButton
                          onConfirm={() => handleUpdateProduct(product)}
                          confirmMessage={`Are you sure you want to update "${product.productName}"?`}
                          className="btn-sm"
                        >
                          Update
                        </UpdateButton>
                        <DeleteButton
                          onConfirm={() => handleDeleteProduct(product._id)}
                          confirmMessage={`Are you sure you want to delete "${product.productName}"?`}
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
                  <td colSpan="5" className="text-center py-4">
                    <div className="alert alert-info" role="alert">
                      No products found.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddProductModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddProduct}
      />
      <UpdateProductModal
        show={showUpdateModal}
        onClose={() => setShowUpdateModal(false)}
        onSubmit={handleProductUpdated}
        productData={productToEdit}
      />
    </div>
  );
}

export default Product;
