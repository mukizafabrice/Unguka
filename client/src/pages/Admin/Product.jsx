import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [productToEdit, setProductToEdit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Function to fetch products from the backend
  const loadProducts = async () => {
    try {
      const productsData = await fetchProduct();
      // Log the fetched data to help diagnose the issue
      console.log("Fetched product data:", productsData);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast.error("Failed to load products.");
    }
  };

  // Initial data load on component mount
  useEffect(() => {
    loadProducts();
  }, []);

  // Handler for adding a new product
  const handleAddProduct = async (productData) => {
    try {
      await createProduct(productData);
      setShowAddModal(false);
      toast.success("Product added successfully!");
      await loadProducts(); // Re-fetch all products to refresh the list
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error(
        `Failed to add product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler for deleting a product
  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      toast.success("Product deleted successfully!");
      await loadProducts(); // Re-fetch all products to refresh the list
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error(
        `Failed to delete product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };

  // Handler to open the update modal with the selected product's data
  const handleUpdateProduct = (product) => {
    setProductToEdit(product);
    setShowUpdateModal(true);
  };

  // Handler for submitting the updated product
  const handleProductUpdated = async (updatedProductData) => {
    try {
      await updateProduct(updatedProductData._id, updatedProductData);

      toast.success("Product updated successfully!");
      setShowUpdateModal(false);
      await loadProducts(); // Re-fetch all products to refresh the list
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(
        `Failed to update product: ${
          error.response?.data?.message || error.message
        }`
      );
    }
  };
  const rowsPerPage = 7;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = products.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(products.length / rowsPerPage);
  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
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
                currentRows.map((product, index) => (
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
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 1}
            className="btn btn-outline-primary"
          >
            ← Previous
          </button>
          <span className="text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages}
            className="btn btn-outline-primary"
          >
            Next →
          </button>
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

      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

export default Product;
