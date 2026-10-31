BACKEND - app.js, add under the existing routes:
  app.use("/api/orders", require("./routes/myOrders.routes"));
  app.use("/api/courier", require("./routes/courier.routes"));

FRONTEND - App.jsx, add routes:
  import MyOrders from "./pages/MyOrders";
  import CourierOrders from "./pages/CourierOrders";
  <Route path="/my-orders" element={<MyOrders />} />
  <Route path="/courier/orders" element={<CourierOrders />} />
