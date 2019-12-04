var axios = require('axios').default;
var qs = require('querystring');

const ENTRY = 'https://3dsec.sberbank.ru/payment/rest/';
const ACTIONS = {
    register: 'register.do',
    getOrderStatusExtended: 'getOrderStatusExtended.do'
}


/**
 * Hey!
 */
class Acquiring {
    /**
     * Constructor
     * @param {Object} credentials 
     * @param {string} returnUrl - use macro {order} for ID of order
     */
    constructor(credentials, returnUrl) {
        this.returnUrl = returnUrl;
        this.credentials = credentials;
    }

    /**
     * Creating new order
     * @param {string} orderNumber 
     * @param {number} amount
     * @param {string} description 
     */
    async register(orderNumber, amount, description = '') {
        let data = this.buildData({
            orderNumber,
            amount: amount * 100,
            description,
            returnUrl: this.returnUrl.replace(/\{order\}/g, orderNumber)
        });
        let response = await this.POST(ACTIONS.register, data);
        return this.parse(response);
    }

    /**
     * Get info on order
     * Required one field - orderId OR orderNumber
     * @param {string} orderId 
     * @param {string} orderNumber 
     */
    async get(orderId, orderNumber = null) {
        let data = this.buildData(orderId ? { orderId } : { orderNumber });
        let response = await this.POST(ACTIONS.getOrderStatusExtended, data);
        return this.parse(response);
    }

    /**
     * Parse response data
     * @param {Object} response 
     */
    parse(response) {
        let status = response.status;
        if (status === 200) {
            let data = response.data;
            if (+data.errorCode) throw new Error(data.errorMessage);
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
        let queuer = await axios.post(
            ENTRY + action,
            qs.stringify(data)
        );
        return queuer;
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
