import React, { useState, useEffect } from "react";
import { fetchUsers } from "../../services/userService"; // Assuming this service exists
import { fetchProduct } from "../../services/productService"; // Assuming this service exists (for product list)
import { fetchSeasons } from "../../services/seasonService"; // Assuming this service exists

const UpdatePurchaseInputModal = ({
  show,
  onClose,
  onSubmit,
  purchaseInput,
}) => {
  const [formData, setFormData] = useState({
    _id: "", // To store the purchase input ID for the update request
    userId: "",
    productId: "",
    seasonId: "",
    quantity: "",
    totalPrice: "",
    paymentType: "",
  });

  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);

  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  const [usersError, setUsersError] = useState(null);
  const [productsError, setProductsError] = useState(null);
  const [seasonsError, setSeasonsError] = useState(null);

  // Effect to manage body class for scroll prevention
  useEffect(() => {
    if (show) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  // Fetch all necessary dropdown data and populate form with initial purchaseInput data
  useEffect(() => {
    if (show) {
      const loadDropdownData = async () => {
        setLoadingUsers(true);
        setLoadingProducts(true);
        setLoadingSeasons(true);
        setUsersError(null);
        setProductsError(null);
        setSeasonsError(null);

        try {
          const [usersResponse, productsResponse, seasonsResponse] =
            await Promise.all([fetchUsers(), fetchProduct(), fetchSeasons()]);

          if (
            usersResponse &&
            Array.isArray(usersResponse.data || usersResponse)
          ) {
            setUsers(usersResponse.data || usersResponse);
          } else {
            console.warn("User data is not an array:", usersResponse);
            setUsers([]);
            setUsersError("User data format incorrect or empty.");
          }

          if (
            productsResponse &&
            Array.isArray(productsResponse.data || productsResponse)
          ) {
            setProducts(productsResponse.data || productsResponse);
          } else {
            console.warn("Product data is not an array:", productsResponse);
            setProducts([]);
            setProductsError("Product data format incorrect or empty.");
          }

          if (
            seasonsResponse &&
            Array.isArray(seasonsResponse.data || seasonsResponse)
          ) {
            setSeasons(seasonsResponse.data || seasonsResponse);
          } else {
            console.warn("Season data is not an array:", seasonsResponse);
            setSeasons([]);
            setSeasonsError("Season data format incorrect or empty.");
          }
        } catch (error) {
          console.error(
            "Failed to load dropdown data for update modal:",
            error
          );
          setUsersError("Failed to load members. Check connection.");
          setProductsError("Failed to load products. Check connection.");
          setSeasonsError("Failed to load seasons. Check connection.");
          setUsers([]);
          setProducts([]);
          setSeasons([]);
        } finally {
          setLoadingUsers(false);
          setLoadingProducts(false);
          setLoadingSeasons(false);
        }
      };

      loadDropdownData();

      // Populate form data with the current 'purchaseInput' prop
      if (purchaseInput) {
        setFormData({
          _id: purchaseInput._id || "",
          userId: purchaseInput.userId?._id || "",
          productId: purchaseInput.productId?._id || "",
          seasonId: purchaseInput.seasonId?._id || "",
          quantity: purchaseInput.quantity || "",
          totalPrice: purchaseInput.totalPrice || "",
          paymentType: purchaseInput.paymentType || "cash",
        });
      }
    }
  }, [show, purchaseInput]); // Re-run when modal visibility or selected 'purchaseInput' changes

  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      quantity: Number(formData.quantity),
      totalPrice: Number(formData.totalPrice),
    };
    onSubmit(dataToSubmit._id, dataToSubmit); // Pass ID and updated data to parent
  };

  return (
    <>
      {/* Modal Backdrop: Render first for correct z-index stacking */}
      <div className="modal-backdrop fade show"></div>

      {/* Main Modal Content */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="updatePurchaseInputModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div
          className="modal-dialog modal-lg modal-dialog-centered"
          role="document"
        >
          <div className="modal-content">
            <form onSubmit={handleSubmit}>
              <div className="modal-header">
                <h5
                  className="modal-title text-dark"
                  id="updatePurchaseInputModalLabel"
                >
                  Update Purchase Input
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={onClose}
                  aria-label="Close"
                />
              </div>

              <div className="modal-body row">
                {/* General Fetch Errors */}
                {(usersError || productsError || seasonsError) && (
                  <div className="col-12 mb-3">
                    <div className="alert alert-danger" role="alert">
                      {usersError && <p className="mb-1">{usersError}</p>}
                      {productsError && <p className="mb-1">{productsError}</p>}
                      {seasonsError && <p className="mb-0">{seasonsError}</p>}
                    </div>
                  </div>
                )}

                {/* User Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="userId" className="form-label text-dark">
                    Member
                  </label>
                  {loadingUsers ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading members...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading members...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="userId"
                        id="userId"
                        className="form-select"
                        value={formData.userId}
                        onChange={handleChange}
                        required
                        disabled={usersError || users.length === 0}
                      >
                        <option value="">Select a member</option>
                        {users.map((user) => (
                          <option key={user._id} value={user._id}>
                            {user.names}
                          </option>
                        ))}
                      </select>
                      {users.length === 0 && !usersError && (
                        <small className="text-muted mt-1 d-block">
                          No members available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Product Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="productId" className="form-label text-dark">
                    Product
                  </label>
                  {loadingProducts ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading products...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading products...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="productId"
                        id="productId"
                        className="form-select"
                        value={formData.productId}
                        onChange={handleChange}
                        required
                        disabled={productsError || products.length === 0}
                      >
                        <option value="">Select a product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                      {products.length === 0 && !productsError && (
                        <small className="text-muted mt-1 d-block">
                          No products available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Season Dropdown */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="seasonId" className="form-label text-dark">
                    Season
                  </label>
                  {loadingSeasons ? (
                    <div className="text-center">
                      <div
                        className="spinner-border spinner-border-sm text-primary"
                        role="status"
                      >
                        <span className="visually-hidden">
                          Loading seasons...
                        </span>
                      </div>
                      <small className="ms-2 text-muted">
                        Loading seasons...
                      </small>
                    </div>
                  ) : (
                    <>
                      <select
                        name="seasonId"
                        id="seasonId"
                        className="form-select"
                        value={formData.seasonId}
                        onChange={handleChange}
                        required
                        disabled={seasonsError || seasons.length === 0}
                      >
                        <option value="">Select a season</option>
                        {seasons.map((season) => (
                          <option key={season._id} value={season._id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                      {seasons.length === 0 && !seasonsError && (
                        <small className="text-muted mt-1 d-block">
                          No seasons available.
                        </small>
                      )}
                    </>
                  )}
                </div>

                {/* Quantity */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="quantity" className="form-label text-dark">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    className="form-control"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                {/* Total Price */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="totalPrice" className="form-label text-dark">
                    Total Amount (RWF)
                  </label>
                  <input
                    type="number"
                    name="totalPrice"
                    id="totalPrice"
                    className="form-control"
                    value={formData.totalPrice}
                    onChange={handleChange}
                    min="0"
                    required
                  />
                </div>

                {/* Payment Type */}
                <div className="col-md-6 mb-3">
                  <label htmlFor="paymentType" className="form-label text-dark">
                    Payment Type
                  </label>
                  <select
                    name="paymentType"
                    id="paymentType"
                    className="form-select"
                    value={formData.paymentType}
                    onChange={handleChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="loan">Loan</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary">
                  Save Changes
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
      </div>
    </>
  );
};

export default UpdatePurchaseInputModal;
