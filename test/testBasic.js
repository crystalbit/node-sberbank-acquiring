var expect = require('chai').expect;
var { credentials } = require('../config');

var Acquiring = require('../index');
var acquiring = new Acquiring(credentials, 'https://mail.ru');

const TEST_TIMEOUT = 15000;

function uuidv4() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// go tests
describe('Basic Test', function() {
    var orderId;

    it('should do order', async function () {
        let result = await acquiring.register(uuidv4().substr(0, 30), 1000, 'test order');
        expect(typeof result).to.be.equal('object');
        expect(typeof (result.orderId)).to.be.equal('string');
        expect(typeof (result.formUrl)).to.be.equal('string');
        orderId = result.orderId;
    }).timeout(TEST_TIMEOUT);
    it('should get order extended data', async function () {
        let result = await acquiring.get(orderId);
        expect(typeof result).to.be.equal('object');
        expect(result.errorMessage).to.be.equal('Успешно');
    }).timeout(TEST_TIMEOUT);
});