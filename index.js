const axios = require('axios');
const qs = require('fast-querystring');

const TEST_ENTRY = 'https://3dsec.sberbank.ru/payment/rest/';
const ENTRY = 'https://securepayments.sberbank.ru/payment/rest/';
const ACTIONS = {
  register: 'register.do',
  getOrderStatusExtended: 'getOrderStatusExtended.do',
  refund: 'refund.do',
};

/**
 * @typedef {Object} Credentials
 * @property {string} userName - username
 * @property {string} password - password
 */

class Acquiring {
  /**
   * @param {Credentials} credentials
   * @param {string} returnUrl - use macro {order} for ID of order
   * @param {boolean} test - use test entry
   */
  constructor(credentials, returnUrl, test = false) {
    this.returnUrl = returnUrl;
    this.credentials = credentials;
    this.entry = test ? TEST_ENTRY : ENTRY;
  }

  /**
   * Creating new order
   * @param {string} orderNumber
   * @param {number} amount
   * @param {string} description
   */
  async register(orderNumber, amount, description = '') {
    const data = this.buildData({
      orderNumber,
      amount: Math.round(amount * 100),
      description,
      returnUrl: this.returnUrl.replace(/\{order\}/g, orderNumber),
    });
    const response = await this.POST(ACTIONS.register, data);
    return this.parse(response);
  }

  /**
   * Checking if order exists and getting its status
   * Provide only one value - for orderId OR for orderNumber
   * @param {string|null} orderId
   * @param {string|null} orderNumber
   * @returns {Promise<number|null>} status of the order or null unless it exists
   * !!!  result can be 0 - it is REGISTERED_BUT_NOT_PAID status  !!!
   * !!! always check with '===' whether it is null or isn't null !!!
   */
  async status(orderId, orderNumber = null) {
    const SBER_ERROR_NO_SUCH_ORDER_ID = 6;
    try {
      const response = await this.get(orderId, orderNumber);
      return response.orderStatus;
    } catch (error) {
      if (parseInt(error.sberErrorCode) === SBER_ERROR_NO_SUCH_ORDER_ID) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get info on order
   * Provide only one value - for orderId OR for orderNumber
   * @param {string|null} orderId
   * @param {string|null} orderNumber
   * @returns {Promise<Object>} response
   */
  async get(orderId, orderNumber = null) {
    const data = this.buildData(orderId ? { orderId } : { orderNumber });
    const response = await this.POST(ACTIONS.getOrderStatusExtended, data);
    return this.parse(response);
  }

  /**
   * Возврат
   * @param {string} orderId Номер заказа в платежной системе.
   * @param {number} amount Сумма платежа (500.23). 0 для возврата на всю сумму.
   * @param {Object|null} jsonParams Дополнительные параметры запроса.
   * @returns {Promise<Object>} response
   */
  async refund(orderId, amount, jsonParams = null) {
    const params = {
      orderId,
      amount: amount * 100,
    };
    if (jsonParams) {
      params.jsonParams = JSON.stringify(jsonParams);
    }
    const data = this.buildData(params);
    const response = await this.POST(ACTIONS.refund, data);
    return this.parse(response);
  }

  /**
   * Parse response data
   * @param {Object} response
   */
  parse(response) {
    const status = response.status;
    if (status === 200) {
      const data = response.data;
      if (parseInt(data.errorCode)) {
        const error = new Error(data.errorMessage);
        error.sberErrorCode = data.errorCode;
        throw error;
      }
      return data;
    } else {
      throw new Error(`HTTP error ${status}`);
    }
  }

  /**
   * Send POST
   * @param {string} action
   * @param {Object} data
   */
  async POST(action, data) {
    return await axios.post(this.entry + action, qs.stringify(data));
  }

  /**
   * Add technical parameters to data
   * @param {Object} parameters
   */
  buildData(parameters = {}) {
    return { ...parameters, ...this.credentials };
  }
}

module.exports = Acquiring;
