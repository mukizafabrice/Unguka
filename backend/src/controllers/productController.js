import Product from "../models/Product.js";

// Register a new product

export const registerProduct = async (req, res) => {
  const { productName } = req.body;
  if (!productName) {
    return res.status(400).json({ message: "Please fill the field" });
  }
  const productToLower = productName.toLowerCase();

  try {
    const existingProduct = await Product.findOne({
      productName: productToLower,
    });

    if (existingProduct) {
      return res.status(400).json({ message: "Product already exists" });
    }

    const newProduct = new Product({
      productName: productToLower,
    });
    await newProduct.save();
    res.status(200).json({
      message: "New product registered successfully",
    });
  } catch (error) {
    console.error("Error registering product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get all products
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Get a product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Update a product by ID

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { productName } = req.body;

  if (!id || !productName) {
    return res.status(400).json({
      message: "Product ID, name, and unit price are required",
    });
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        productName: productName.toLowerCase(),
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete a product by ID
export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ message: "Product ID is required" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
