const expect = require('chai').expect;
const { credentials } = require('../config');
const { v4: uuidv4 } = require('uuid');

const Acquiring = require('../index');
const acquiring = new Acquiring(credentials, 'https://google.com', true);

describe('Test With Checking Order Existence And Creating Order', () => {
  let orderId;

  it('check if not existing order doesn\'t exist', async () => {
    const result = await acquiring.status('123456notexists', null);
    expect(result).to.be.null;
  });

  it('creating order', async () => {
    const result = await acquiring.register(uuidv4().substr(0, 30), 1000, 'test order');
    expect(typeof result).to.be.equal('object');
    expect(typeof (result.orderId)).to.be.equal('string');
    expect(typeof (result.formUrl)).to.be.equal('string');
    orderId = result.orderId;
  });

  it('check if existing order exists', async () => {
    const result = await acquiring.status(orderId, null);
    expect(result).to.be.not.null;
  });

  it('getting extended order data', async () => {
    const result = await acquiring.get(orderId);
    expect(typeof result).to.be.equal('object');
    expect(result.errorMessage).to.be.equal('Успешно');
  });
});
