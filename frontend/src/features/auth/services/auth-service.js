import apiClient from "../../../services/api-client";

const authService = {
  async login(credentials) {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  async register(userData) {
    const response = await apiClient.post("/auth/register", userData);
    return response.data;
  },
};

export default authService;
