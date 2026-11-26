export function createGetCouriers(userRepository) {
  return async function getCouriers() {
    return userRepository.findCouriers();
  };
}