const expect = require('chai').expect;
const { credentials } = require('../config');
const { v4: uuidv4 } = require('uuid');

const Acquiring = require('../index');
const acquiring = new Acquiring(credentials, 'https://google.com', true);

describe('Basic Test', () => {
  let orderId;

  it('creating order', async () => {
    const result = await acquiring.register(uuidv4().substr(0, 30), 1000, 'test order');
    expect(typeof result).to.be.equal('object');
    expect(typeof (result.orderId)).to.be.equal('string');
    expect(typeof (result.formUrl)).to.be.equal('string');
    orderId = result.orderId;
  });

  it('should get order extended data', async () => {
    const result = await acquiring.get(orderId);
    expect(typeof result).to.be.equal('object');
    expect(result.errorMessage).to.be.equal('Успешно');
  });
});
