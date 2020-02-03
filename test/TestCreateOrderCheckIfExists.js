const expect = require('chai').expect;
const { credentials } = require('../config');
const uuidv4 = require('uuid/v4');

const Acquiring = require('../index');
const acquiring = new Acquiring(credentials, 'https://mail.ru');

describe('Test With Checking Order Existence And Creating Order', function() {
    let orderId;

    it('check if not existing order doesn\'t exist', async function() {
        const result = await acquiring.status('123456notexists', null);
        expect(result).to.be.null;
    });

    it('creating order', async function() {
        const result = await acquiring.register(uuidv4().substr(0, 30), 1000, 'test order');
        expect(typeof result).to.be.equal('object');
        expect(typeof (result.orderId)).to.be.equal('string');
        expect(typeof (result.formUrl)).to.be.equal('string');
        orderId = result.orderId;
    });

    it('check if existing order exists', async function() {
        const result = await acquiring.status(orderId, null);
        expect(result).to.be.not.null;
    });

    it('getting extended order data', async function() {
        const result = await acquiring.get(orderId);
        expect(typeof result).to.be.equal('object');
        expect(result.errorMessage).to.be.equal('Успешно');
    });
});