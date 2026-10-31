export function createGetAllOrders(orderRepository) {
  return async function getAllOrders() {
    return orderRepository.findAll();
  };
}