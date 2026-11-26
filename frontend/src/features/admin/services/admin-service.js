import apiClient from "../../../services/api-client";

const adminService = {
  async getOrders() {
    const response = await apiClient.get("/admin/orders");
    return response.data.orders;
  },

  async getCouriers() {
    const response = await apiClient.get("/admin/couriers");
    return response.data.couriers;
  },

  async getCustomers() {
    const response = await apiClient.get("/admin/customers");
    return response.data.customers;
  },

  async createOrderForCustomer(orderData) {
    const response = await apiClient.post("/admin/orders", orderData);
    return response.data;
  },

  async updateOrderStatus(orderId, status) {
    const response = await apiClient.patch(`/admin/orders/${orderId}`, {
      status,
    });
    return response.data.order;
  },

  async assignCourier(orderId, courierId) {
    const response = await apiClient.patch(
      `/admin/orders/${orderId}/assign`,
      { courierId }
    );
    return response.data.order;
  },

  async deleteOrder(orderId) {
    const response = await apiClient.delete(`/admin/orders/${orderId}`);
    return response.data;
  },
};

export default adminService;