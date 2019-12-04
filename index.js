var axios = require('axios').default;
var qs = require('querystring');

const ENTRY = 'https://3dsec.sberbank.ru/payment/rest/';
const ACTIONS = {
    register: 'register.do',

}

class Acquiring {

    constructor(credentials, returnUrl) {
        this.returnUrl = returnUrl;
        this.credentials = credentials;
    }

    async register(orderNumber, amount) {
        let data = this.buildData({ orderNumber, amount: amount * 100, returnUrl: this.returnUrl });
        let response = await this.POST(ACTIONS.register, data);
        return this.parse(response);
    }

    parse(response) {
        let status = response.status;
        if (status === 200) {
            let data = response.data;
            if (data.errorCode) throw new Error(data.errorMessage);
            return data;
        } else {
            throw new Error(`HTTP error ${status}`);
        }
    }

    async POST(action, data) {
        let queuer = await axios.post(
            ENTRY + action,
            qs.stringify(data)
        );
        return queuer;
    }

    buildData(parameters = {}) {
        return { ...parameters, ...this.credentials };
    }

}

module.exports = Acquiring;