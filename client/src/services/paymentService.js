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

export const fetchSummaryById = async (id) => {
  const response = await axiosInstance.get(`/payments/details/${id}`);
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

// export const downloadPaymentsPDF = async () => {
//   try {
//     const response = await axiosInstance.get(`/payments/download/pdf`, {
//       responseType: "blob", // important for file downloads
//     });

//     // Create a blob link
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "payments.pdf");
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   } catch (error) {
//     console.error("Error downloading payments PDF:", error);
//     throw error;
//   }
// };

// export const downloadPaymentsExcel = async () => {
//   try {
//     const response = await axiosInstance.get(`/payments/download/excel`, {
//       responseType: "blob", // important for Excel
//     });

//     // Create a blob link
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement("a");
//     link.href = url;
//     link.setAttribute("download", "payments.xlsx");
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   } catch (error) {
//     console.error("Error downloading payments Excel:", error);
//     throw error;
//   }
// };

const API_BASE_URL = "payments";
export const downloadPaymentsPDF = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/pdf`, {
      responseType: "blob", // This is crucial for binary file downloads
    });

    // The response.data is already a Blob object.
    const pdfBlob = response.data;

    // Create a temporary URL for the blob
    const url = window.URL.createObjectURL(pdfBlob);

    // Create a temporary link element to trigger the download
    const a = document.createElement("a");
    a.href = url;
    a.download = "payments_report.pdf"; // The default filename
    document.body.appendChild(a);
    a.click(); // Programmatically click the link to start the download

    // Clean up the temporary URL and element to free up memory
    window.URL.revokeObjectURL(url);
    a.remove();
  } catch (error) {
    console.error("Error downloading PDF:", error);
    throw error;
  }
};

export const downloadPaymentsExcel = async () => {
  try {
    const response = await axiosInstance.get(`${API_BASE_URL}/excel`, {
      responseType: "blob", // Crucial for binary file downloads
    });

    const excelBlob = response.data; // response.data is already a Blob
    const url = window.URL.createObjectURL(excelBlob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payments_report.xlsx"; // Suggested filename
    document.body.appendChild(a);
    a.click();

    window.URL.revokeObjectURL(url); // Clean up the URL
    a.remove();
  } catch (error) {
    console.error("Error downloading Excel:", error);
    throw error;
  }
};
