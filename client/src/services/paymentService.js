import axiosInstance from "../api/axiosInstance";

// Fetch all payments for the current cooperative
// paymentService.js
export const fetchPayments = async (cooperativeId) => {
  if (!cooperativeId) throw new Error("Cooperative ID is required");

  try {
    const response = await axiosInstance.get("/payments", {
      headers: { "x-cooperative-id": cooperativeId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching payments:",
      error.response?.data || error.message
    );
    throw error;
  }
};

// Fetch all payments for a specific user
export const fetchPaymentById = async (id) => {
  const response = await axiosInstance.get(`/payments/${id}`);
  return response.data;
};

// Process a new payment
// export const createPayment = async (paymentData, cooperativeId) => {
//   if (!cooperativeId) throw new Error("Cooperative ID is required");

//   try {
//     const response = await axiosInstance.post(
//       "/payments/process",
//       paymentData,
//       {
//         headers: { "x-cooperative-id": cooperativeId },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       "Error processing payment:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

// Fetch payment summary for a specific user
// paymentService.js
// export const fetchPaymentSummary = async (userId, cooperativeId) => {
//   if (!cooperativeId) throw new Error("Cooperative ID is required");

//   try {
//     const response = await axiosInstance.get(
//       `/payments/summary?userId=${userId}`,
//       {
//         headers: { "x-cooperative-id": cooperativeId },
//       }
//     );
//     return response.data;
//   } catch (error) {
//     console.error(
//       `Error fetching payment summary for user ${userId}:`,
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };

// paymentService.js

export const fetchPaymentSummary = async (userId, cooperativeId) => {
  if (!cooperativeId) throw new Error("Cooperative ID is required");

  try {
    const response = await axiosInstance.get(
      `/payments/summary?userId=${userId}`,
      { headers: { "x-cooperative-id": cooperativeId } }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching payment summary for user ${userId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const createPayment = async (paymentData, cooperativeId) => {
  if (!cooperativeId) throw new Error("Cooperative ID is required");

  try {
    const response = await axiosInstance.post(
      "/payments/process",
      paymentData,
      {
        headers: { "x-cooperative-id": cooperativeId },
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      "Error creating payment:",
      error.response?.data || error.message
    );
    throw error;
  }
};
