const expect = require('chai').expect;
const { credentials } = require('../config');
const uuidv4 = require('uuid/v4');

const Acquiring = require('../index');
const acquiring = new Acquiring(credentials, 'https://mail.ru');

describe('Basic Test', function() {
    let orderId;

    it('creating order', async function () {
        let result = await acquiring.register(uuidv4().substr(0, 30), 1000, 'test order');
        expect(typeof result).to.be.equal('object');
        expect(typeof (result.orderId)).to.be.equal('string');
        expect(typeof (result.formUrl)).to.be.equal('string');
        orderId = result.orderId;
    });

    it('should get order extended data', async function () {
        let result = await acquiring.get(orderId);
        expect(typeof result).to.be.equal('object');
        expect(result.errorMessage).to.be.equal('Успешно');
    });
});