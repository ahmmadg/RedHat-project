/**
 * @typedef {Object} IOrderRepository
 * @property {(orderData: Object) => Promise<Object>} create
 * @property {(id: string) => Promise<Object|null>} findById
 * @property {(trackingNumber: string) => Promise<Object|null>} findByTrackingNumber
 * @property {(id: string, updateData: Object) => Promise<Object>} update
 * @property {(historyData: Object) => Promise<Object>} createStatusHistory
 */

export {};
