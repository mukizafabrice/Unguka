import PaymentTransaction from "../models/PaymentTransaction.js";
import mongoose from "mongoose"; // Needed for mongoose.Types.ObjectId.isValid

// Helper to construct query filter based on user role and cooperativeId
// This function is robust and should remain as is for security and multi-tenancy.
const getCooperativeQueryFilter = (req) => {
  // Defensive check: if req.user is not set by authentication middleware, deny access.
  if (!req.user) {
    console.error(
      `[${new Date().toISOString()}] ERROR: getCooperativeQueryFilter - req.user is undefined. Authentication context is missing.`
    );
    throw new Error(
      "Authentication context missing. Please ensure user is logged in."
    );
  }

  const { role, cooperativeId } = req.user;

  console.log(
    `[${new Date().toISOString()}] DEBUG: getCooperativeQueryFilter - Role: ${role}, CooperativeId from JWT: ${cooperativeId}`
  );

  if (role === "superadmin") {
    if (
      req.query.cooperativeId &&
      mongoose.Types.ObjectId.isValid(req.query.cooperativeId)
    ) {
      console.log(
        `[${new Date().toISOString()}] DEBUG: Superadmin: Filtering by cooperativeId from query: ${
          req.query.cooperativeId
        }`
      );
      return { cooperativeId: req.query.cooperativeId };
    }
    console.log(
      `[${new Date().toISOString()}] DEBUG: Superadmin: No specific cooperativeId in query, returning all.`
    );
    return {};
  }

  // For manager and member roles, cooperativeId is mandatory and must be valid
  if (!cooperativeId) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Cooperative ID not found in user token for role ${role}. Authentication misconfiguration.`
    );
    throw new Error(
      "Cooperative ID not found in user token. Authentication misconfiguration."
    );
  }
  if (!mongoose.Types.ObjectId.isValid(cooperativeId)) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Invalid Cooperative ID format for role: ${role}. ID: ${cooperativeId}`
    );
    throw new Error(
      "Invalid cooperative ID format. Authentication misconfiguration."
    );
  }

  console.log(
    `[${new Date().toISOString()}] DEBUG: Manager/Member: Filtering by cooperativeId from JWT: ${cooperativeId}`
  );
  return { cooperativeId: cooperativeId };
};

// ====================================================================
// --- Get All Payment Transactions (Scoped by Cooperative) ---
// ====================================================================
export const getAllPaymentTransactions = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactions Controller START`
  );
  try {
    const filter = getCooperativeQueryFilter(req);
    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactions: Applied filter: ${JSON.stringify(
        filter
      )}`
    );

    const PaymentTransactions = await PaymentTransaction.find(filter)
      .populate("userId", "names")
      .sort({ transactionDate: -1 });

    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactions: Fetched ${
        PaymentTransactions.length
      } transactions.`
    );
    res.status(200).json(PaymentTransactions);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error fetching all payment transactions: ${
        error.message
      }`,
      error
    );
    // Determine appropriate status based on error message from getCooperativeQueryFilter
    if (error.message.includes("Authentication context missing")) {
      return res.status(401).json({ message: error.message });
    }
    if (
      error.message.includes("Cooperative ID not found") ||
      error.message.includes("Invalid cooperative ID format")
    ) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ====================================================================
// --- Get Payment Transactions by User ID (Scoped by Cooperative) ---
// ====================================================================
export const getAllPaymentTransactionsById = async (req, res) => {
  console.log(
    `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactionsById Controller START`
  );
  const { userId: paramUserId } = req.params;

  // Defensive check for req.user before destructuring
  if (!req.user) {
    console.error(
      `[${new Date().toISOString()}] ERROR: getAllPaymentTransactionsById - req.user is undefined. Authentication context is missing.`
    );
    return res
      .status(401)
      .json({
        message:
          "Authentication context missing. Please ensure user is logged in.",
      });
  }
  const { _id: authenticatedUserId, role } = req.user;

  // Authorization check: Non-superadmins can only query their own user's transactions
  if (
    role !== "superadmin" &&
    (!authenticatedUserId || paramUserId !== authenticatedUserId.toString())
  ) {
    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactionsById - Unauthorized attempt for userId: ${paramUserId} by role: ${role}. Authenticated: ${authenticatedUserId}`
    );
    return res.status(403).json({
      message: "You are not authorized to view transactions for this user.",
    });
  }

  try {
    const cooperativeFilter = getCooperativeQueryFilter(req);
    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactionsById - Cooperative filter: ${JSON.stringify(
        cooperativeFilter
      )}`
    );

    const finalFilter = { ...cooperativeFilter, userId: paramUserId };
    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactionsById - Final filter: ${JSON.stringify(
        finalFilter
      )}`
    );

    const PaymentTransactions = await PaymentTransaction.find(finalFilter)
      .populate("userId", "names")
      .sort({ transactionDate: -1 });

    console.log(
      `[${new Date().toISOString()}] DEBUG: getAllPaymentTransactionsById: Fetched ${
        PaymentTransactions.length
      } transactions.`
    );
    res.status(200).json(PaymentTransactions);
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] ERROR: Error fetching payment transactions by ID: ${
        error.message
      }`,
      error
    );
    // Determine appropriate status based on error message from getCooperativeQueryFilter
    if (error.message.includes("Authentication context missing")) {
      return res.status(401).json({ message: error.message });
    }
    if (
      error.message.includes("Cooperative ID not found") ||
      error.message.includes("Invalid cooperative ID format")
    ) {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
