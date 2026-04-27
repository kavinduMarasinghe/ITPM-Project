import { api, setDevRole } from "./client.js";

// Set dev role for payment operations
setDevRole("organizer");

// Create a new payment
export const createPayment = async (paymentData) => {
  try {
    const response = await api.post("/payments/create", paymentData);
    return response.data;
  } catch (error) {
    console.error("Error creating payment:", error);
    throw error;
  }
};

// Complete a payment
export const completePayment = async (paymentId) => {
  try {
    const response = await api.post(`/payments/${paymentId}/complete`);
    return response.data;
  } catch (error) {
    console.error("Error completing payment:", error);
    throw error;
  }
};

// Fail a payment
export const failPayment = async (paymentId) => {
  try {
    const response = await api.post(`/payments/${paymentId}/fail`);
    return response.data;
  } catch (error) {
    console.error("Error failing payment:", error);
    throw error;
  }
};

// Delete (soft delete - cancel) a payment
export const deletePayment = async (paymentId) => {
  try {
    console.log("API: Deleting payment with ID:", paymentId, "Type:", typeof paymentId);
    const url = `/payments/${paymentId}/cancel`;
    console.log("API: Full URL:", url);
    console.log("API: Making DELETE request...");
    
    const response = await api.delete(url);
    
    console.log("API: Delete response:", response);
    return response.data;
  } catch (error) {
    console.error("API: Error deleting payment:", error);
    console.error("API: Error response data:", error.response?.data);
    console.error("API: Error status:", error.response?.status);
    console.error("API: Error config:", error.config);
    throw error;
  }
};

// Hard delete a payment (admin only)
export const hardDeletePayment = async (paymentId) => {
  try {
    const response = await api.delete(`/payments/${paymentId}/delete`);
    return response.data;
  } catch (error) {
    console.error("Error hard deleting payment:", error);
    throw error;
  }
};

// Get a payment by ID
export const getPaymentById = async (paymentId) => {
  try {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting payment:", error);
    throw error;
  }
};

// List all payments (organizer/admin)
export const listPayments = async (filters = {}) => {
  try {
    const response = await api.get("/payments", {
      params: filters,
    });
    return response.data;
  } catch (error) {
    console.error("Error listing payments:", error);
    throw error;
  }
};

// List user's payments
export const listMyPayments = async () => {
  try {
    const response = await api.get("/my/payments");
    return response.data;
  } catch (error) {
    console.error("Error listing my payments:", error);
    throw error;
  }
};
