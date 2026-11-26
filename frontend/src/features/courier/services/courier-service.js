import apiClient from "../../../services/api-client";

const courierService = {
  async getAssignedOrders() {
    const response = await apiClient.get("/courier/orders");
    return response.data.orders;
  },

  async acceptOrder(orderId) {
    const response = await apiClient.patch(
      `/courier/orders/${orderId}/accept`
    );
    return response.data.order;
  },

  async declineOrder(orderId) {
    const response = await apiClient.patch(
      `/courier/orders/${orderId}/decline`
    );
    return response.data.order;
  },

  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(
      `/courier/orders/${orderId}/status`,
      { status }
    );
    return response.data.order;
  },
};

export default courierService;