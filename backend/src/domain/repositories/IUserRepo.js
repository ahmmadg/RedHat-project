/**
 * @typedef {Object} IUserRepository
 * @property {(email: string) => Promise<Object|null>} findByEmail
 * @property {(userData: Object) => Promise<Object>} create
 */

export {};