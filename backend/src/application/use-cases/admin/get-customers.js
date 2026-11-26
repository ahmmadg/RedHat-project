export function createGetCustomers(userRepository) {
  return async function getCustomers() {
    return userRepository.findCustomers();
  };
}