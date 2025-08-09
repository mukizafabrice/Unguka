import React, { useEffect, useState } from "react";
import { fetchUsers } from "../../services/userService";
import { fetchProduct } from "../../services/productService";
import { fetchSeasons } from "../../services/seasonService";

const AddProductionModal = ({ show, onClose, onSave }) => {
  const [members, setMembers] = useState([]);
  const [products, setProducts] = useState([]);
  const [seasons, setSeasons] = useState([]);
  const [productions, setProductions] = useState([
    {
      userId: "",
      productId: "",
      seasonId: "",
      quantity: "",
      unitPrice: "",
      totalAmount: 0,
    },
  ]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [membersData, productsData, seasonsData] = await Promise.all([
          fetchUsers(),
          fetchProduct(),
          fetchSeasons(),
        ]);
        setMembers(membersData);
        setProducts(productsData);
        setSeasons(seasonsData);
      } catch (err) {
        console.error("Failed to load dropdown data", err);
      }
    };

    if (show) {
      loadData();
      // Reset form data when modal opens
      setProductions([
        {
          userId: "",
          productId: "",
          seasonId: "",
          quantity: "",
          unitPrice: "",
          totalAmount: 0,
        },
      ]);
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [show]);

  const handleChange = (e, index) => {
    const { name, value } = e.target;
    const list = [...productions];
    list[index][name] = value;

    // Recalculate totalAmount for the specific production being changed
    const quantity = parseFloat(list[index].quantity) || 0;
    const unitPrice = parseFloat(list[index].unitPrice) || 0;
    list[index].totalAmount = quantity * unitPrice;

    setProductions(list);
  };

  const handleAddProduction = () => {
    setProductions([
      ...productions,
      {
        userId: "",
        productId: "",
        seasonId: "",
        quantity: "",
        unitPrice: "",
        totalAmount: 0,
      },
    ]);
  };

  const handleRemoveProduction = (index) => {
    const list = [...productions];
    list.splice(index, 1);
    setProductions(list);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(productions);
    onClose();
  };

  if (!show) {
    return null;
  }

  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div
        className="modal fade show"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="addProductionModalLabel"
        aria-hidden="false"
        style={{ display: "block", paddingRight: "17px" }}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg"
          role="document"
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5
                className="modal-title text-dark"
                id="addProductionModalLabel"
              >
                Add New Productions
              </h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={onClose}
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                {productions.map((production, index) => (
                  <div key={index} className="border p-3 mb-3">
                    <h6 className="text-dark">Production #{index + 1}</h6>
                    {productions.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm float-end"
                        onClick={() => handleRemoveProduction(index)}
                      >
                        Remove
                      </button>
                    )}
                    <div className="mb-3">
                      <label
                        htmlFor={`userId-${index}`}
                        className="form-label text-dark"
                      >
                        Member
                      </label>
                      <select
                        id={`userId-${index}`}
                        name="userId"
                        className="form-select"
                        value={production.userId}
                        onChange={(e) => handleChange(e, index)}
                        required
                      >
                        <option value="">Select Member</option>
                        {members.map((member) => (
                          <option key={member._id} value={member._id}>
                            {member.names}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor={`productId-${index}`}
                        className="form-label text-dark"
                      >
                        Product
                      </label>
                      <select
                        id={`productId-${index}`}
                        name="productId"
                        className="form-select"
                        value={production.productId}
                        onChange={(e) => handleChange(e, index)}
                        required
                      >
                        <option value="">Select Product</option>
                        {products.map((product) => (
                          <option key={product._id} value={product._id}>
                            {product.productName}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor={`seasonId-${index}`}
                        className="form-label text-dark"
                      >
                        Season
                      </label>
                      <select
                        id={`seasonId-${index}`}
                        name="seasonId"
                        className="form-select"
                        value={production.seasonId}
                        onChange={(e) => handleChange(e, index)}
                        required
                      >
                        <option value="">Select Season</option>
                        {seasons.map((season) => (
                          <option key={season._id} value={season._id}>
                            {season.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor={`quantity-${index}`}
                        className="form-label text-dark"
                      >
                        Quantity
                      </label>
                      <input
                        type="number"
                        id={`quantity-${index}`}
                        className="form-control"
                        name="quantity"
                        value={production.quantity}
                        onChange={(e) => handleChange(e, index)}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor={`unitPrice-${index}`}
                        className="form-label text-dark"
                      >
                        UnitPrice
                      </label>
                      <input
                        type="number"
                        id={`unitPrice-${index}`}
                        className="form-control"
                        name="unitPrice"
                        value={production.unitPrice}
                        onChange={(e) => handleChange(e, index)}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label text-dark">
                        Total Amount
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        value={`$${production.totalAmount.toFixed(2)}`}
                        readOnly
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-info mt-3"
                  onClick={handleAddProduction}
                >
                  Add Another Production
                </button>
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                onClick={handleSubmit}
              >
                Save all changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddProductionModal;
