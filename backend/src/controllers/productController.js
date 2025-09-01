import Product from "../models/Product.js";

// Register a new product
export const registerProduct = async (req, res) => {
  // Destructure productName and cooperativeId from the request body
  const { productName, cooperativeId } = req.body;

  // Validate that both required fields are present
  if (!productName || !cooperativeId) {
    return res
      .status(400)
      .json({ message: "Product name and Cooperative ID are required." });
  }
  console.log("Registering product:", productName, cooperativeId);

  const productToLower = productName.toLowerCase();

  try {
    // Check for an existing product with the same name *within the specific cooperative*.
    // This leverages the compound unique index defined in the Product model.
    const existingProduct = await Product.findOne({
      productName: { $regex: `^${productToLower}$`, $options: "i" },
      cooperativeId: cooperativeId,
    });

    if (existingProduct) {
      // Return a specific error message if the product name already exists in this cooperative
      return res.status(400).json({
        message: "A product with this name already exists in this cooperative.",
      });
    }

    // Create a new product instance with the provided details
    const newProduct = new Product({
      productName: productToLower,
      cooperativeId: cooperativeId,
    });

    // Save the new product to the database
    await newProduct.save();

    // Respond with a 201 Created status for successful resource creation
    res.status(201).json({
      message: "New product registered successfully",
      product: newProduct, // Include the created product data in the response
    });
  } catch (error) {
    console.error("Error registering product:", error);
    // Handle specific Mongoose validation errors (e.g., if a field's minlength constraint fails)
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    // Handle MongoDB duplicate key error (code 11000), which occurs if the compound unique index is violated
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "A product with this name already exists for this cooperative.",
      });
    }
    // Catch any other unexpected errors
    res.status(500).json({ message: "Internal server error" });
  }
};

// // Get all products
// export const getAllProducts = async (req, res) => {

//   const { cooperativeId } = req.query;
//   let query = {};

//   // If a cooperativeId is provided, add it to the query filter
//   if (cooperativeId) {
//     query.cooperativeId = cooperativeId;
//   }

//   try {
//     // Find products based on the constructed query, sorted by creation date
//     const products = await Product.find(query).sort({ createdAt: -1 });
//     // Respond with a 200 OK status and the fetched product data
//     res
//       .status(200)
//       .json({
//         success: true,
//         data: products,
//         message: "Products fetched successfully",
//       });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

// Get all products
export const getAllProducts = async (req, res) => {
  const { cooperativeId } = req.query;
  let query = {};

  // Filter by cooperativeId if provided
  if (cooperativeId) {
    query.cooperativeId = cooperativeId;
  } else {
    return res.status(400).json({
      success: false,
      message: "cooperativeId is required to fetch products.",
    });
  }

  try {
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: products,
      message: "Products fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Get a product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { cooperativeId } = req.query; // Get cooperativeId from query parameters for authorization

  // Validate that a product ID is provided
  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  let query = { _id: id };
  // If cooperativeId is provided, add it to the query to ensure authorized access
  if (cooperativeId) {
    query.cooperativeId = cooperativeId;
  }

  try {
    // Find the product based on its ID and optional cooperativeId
    const product = await Product.findOne(query);

    // If no product is found, it might mean the ID is incorrect or the user is unauthorized
    if (!product) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized access." });
    }

    // Respond with the fetched product data
    res.status(200).json({
      success: true,
      data: product,
      message: "Product fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    // Handle cases where the provided ID format is invalid (e.g., not a valid MongoDB ObjectId)
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Update a product by ID
export const updateProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  // Destructure productName and cooperativeId from the request body
  const { productName, cooperativeId } = req.body;

  // Validate that all necessary fields are present for the update
  if (!id || !productName || !cooperativeId) {
    return res.status(400).json({
      message: "Product ID, name, and Cooperative ID are required for update",
    });
  }

  try {
    // Find and update the product. The query includes cooperativeId to ensure that
    // only products within the specified cooperative can be modified.
    const updatedProduct = await Product.findOneAndUpdate(
      { _id: id, cooperativeId: cooperativeId }, // Query to match both ID and cooperativeId
      { productName: productName.toLowerCase() }, // Update the product name
      { new: true } // Return the updated document
    );

    // If no product is found matching the criteria, return a 404 error
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized to update." });
    }

    // Respond with a 200 OK status and the updated product data
    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    // Handle invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
    // Handle duplicate key error (code 11000) for the compound unique index,
    // which occurs if the updated productName already exists within the same cooperative.
    if (error.code === 11000) {
      return res.status(400).json({
        message:
          "Another product with this name already exists in this cooperative.",
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params; // Get product ID from URL parameters
  const { cooperativeId } = req.body; // Get cooperativeId from request body for authorization

  // Validate that both product ID and cooperativeId are provided
  if (!id || !cooperativeId) {
    return res.status(400).json({
      message: "Product ID and Cooperative ID are required for deletion",
    });
  }

  try {
    // Find and delete the product, ensuring it belongs to the correct cooperative.
    // This prevents cross-cooperative deletion.
    const deletedProduct = await Product.findOneAndDelete({
      _id: id,
      cooperativeId: cooperativeId,
    });

    // If no product is found matching the criteria, return a 404 error
    if (!deletedProduct) {
      return res
        .status(404)
        .json({ message: "Product not found or unauthorized to delete." });
    }

    // Respond with a 200 OK status for successful deletion
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    // Handle invalid ID format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid product ID format." });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};
