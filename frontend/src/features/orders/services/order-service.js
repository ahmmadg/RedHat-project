import apiClient from "../../../services/api-client";

const orderService = {
  async createOrder(orderData) {
    const response = await apiClient.post("/orders", orderData);
    return response.data;
  },

  async getOrderById(orderId) {
    const response = await apiClient.get(`/orders/${orderId}`);
    return response.data;
  },

  async cancelOrder(orderId) {
    const response = await apiClient.patch(`/orders/${orderId}/cancel`);
    return response.data;
  },

  async trackOrder(query) {
    const response = await apiClient.get(`/orders/track/${encodeURIComponent(query)}`);
    return response.data;
  },

  async getMyOrders() {
    const response = await apiClient.get("/orders/my-orders");
    return response.data;
  },
};

export default orderService;
